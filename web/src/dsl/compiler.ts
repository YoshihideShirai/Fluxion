import type {
  SceneNode,
  Style,
  TimelineOperation,
  FluxionDocument,
  Camera,
  Transform,
} from "../types.js";
import { ExpressionError, validateExpression, collectExpressionDependencies, evaluateExpression } from "../runtime/expression.js";
import { DslCompileError } from "./errors.js";
import { expandMathTokens } from "./mathTokens.js";
import {
  applyNodeOption,
  cameraPropertyPath,
  createBaseNode,
  defaultCamera,
  isCameraProperty,
  propertyPath,
} from "./nodes.js";
import {
  ensureNoPlayOptions,
  expectPlayArg,
  expectPlayCallArgs,
  expectPlayIdArgs,
  normalizeLaggedGroupTiming,
  readLagRatio,
  readPlayCall,
  type PlayCall,
} from "./playCalls.js";
import {
  columnOf,
  isNodeType,
  parseBoolean,
  parseEasing,
  parseNumber,
  parseSeconds,
  parseValue,
  readAssignment,
  readAssignments,
  readCameraArguments,
  readNodeArguments,
  stripComment,
  tokenize,
} from "./syntax.js";
import { arcToSvgPath, curvesToClosedAreaPath, pointsToSvgPath, sampleSmoothPathPoints } from "../pathUtils.js";

export { DslCompileError } from "./errors.js";

interface CompileState {
  width: number;
  height: number;
  fps: number;
  camera: Camera;
  cameraFrameCursor: CameraFrameCursor;
  nodes: Map<string, SceneNode>;
  autoCreateSnapshots: Map<string, SceneNode>;
  values: Map<string, number>;
  timeline: TimelineOperation[];
  shown: Set<string>;
  rootIds: Set<string>;
  currentTime: number;
  blockTime: number | null;
  extentTime: number;
  braceTargetRefs: Array<{ braceId: string; targetId: string; lineNumber: number }>;
}

interface CameraFrameCursor {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface TexTokenEntry {
  node: SceneNode;
  parentTransform: Transform;
  absoluteNode: SceneNode;
}

export function compileTextDsl(source: string): FluxionDocument {
  const camera = defaultCamera();
  const state: CompileState = {
    width: 1280,
    height: 720,
    fps: 60,
    camera,
    cameraFrameCursor: cameraFrameCursorFromCamera(camera),
    nodes: new Map(),
    autoCreateSnapshots: new Map(),
    values: new Map(),
    timeline: [],
    shown: new Set(),
    rootIds: new Set(),
    currentTime: 0,
    blockTime: null,
    extentTime: 0,
    braceTargetRefs: [],
  };

  source.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const withoutComment = stripComment(rawLine);
    if (!withoutComment.trim()) return;

    const isIndented = /^\s+/.test(withoutComment);
    const line = withoutComment.trim();
    if (!isIndented) state.blockTime = null;

    const tokens = tokenize(line, lineNumber);
    const keyword = tokens[0];
    if (!keyword) return;

    if (keyword === "scene") {
      parseScene(tokens, state, lineNumber);
      return;
    }

    if (keyword === "at") {
      if (!line.endsWith(":"))
        throw new DslCompileError(
          "Expected ':' after at block.",
          lineNumber,
          columnOf(withoutComment, "at"),
        );
      state.blockTime = parseSeconds(tokens[1], lineNumber);
      return;
    }

    if (keyword === "camera") {
      parseCamera(tokens, state, lineNumber);
      return;
    }

    if (keyword === "cameraFrame") {
      parseCameraFrame(tokens, state, lineNumber);
      return;
    }

    if (keyword === "value") {
      parseValueDeclaration(tokens, state, lineNumber);
      return;
    }

    if (keyword === "show") {
      parseShow(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "hide") {
      parseHide(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "set") {
      parseSet(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "always") {
      parseAlways(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "wait") {
      parseWait(tokens, state, lineNumber);
      return;
    }

    if (keyword === "play") {
      parsePlay(tokens, state, lineNumber);
      return;
    }

    if (keyword === "animate") {
      parseAnimate(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "animateFrame") {
      parseAnimateFrame(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "followCamera") {
      parseFollowCamera(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (
      keyword === "circle" ||
      keyword === "rect" ||
      keyword === "triangle" ||
      keyword === "line" ||
      keyword === "path" ||
      keyword === "text" ||
      keyword === "math" ||
      keyword === "brace" ||
      keyword === "image" ||
      keyword === "group"
    ) {
      parseNode(tokens, state, lineNumber);
      return;
    }

    if (keyword === "surroundingRect") {
      parseSurroundingRect(tokens, state, lineNumber);
      return;
    }

    if (keyword === "axes") {
      parseAxes(tokens, state, lineNumber);
      return;
    }

    if (keyword === "axisLabels") {
      parseAxisLabels(tokens, state, lineNumber);
      return;
    }

    if (keyword === "numberPlane") {
      parseNumberPlane(tokens, state, lineNumber);
      return;
    }

    if (keyword === "plot") {
      parsePlot(tokens, state, lineNumber);
      return;
    }

    if (keyword === "graphLabel") {
      parseGraphLabel(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataPolygon") {
      parseDataPolygon(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataLineGraph") {
      parseDataLineGraph(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataRect") {
      parseDataRect(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataDot") {
      parseDataDot(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataLine") {
      parseDataLine(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dynamicLine") {
      parseDynamicLine(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataArea") {
      parseDataArea(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataRiemannRects") {
      parseDataRiemannRects(tokens, state, lineNumber);
      return;
    }

    if (keyword === "gaussianSurface") {
      parseGaussianSurface(tokens, state, lineNumber);
      return;
    }

    if (keyword === "sphereSurface") {
      parseSphereSurface(tokens, state, lineNumber);
      return;
    }

    if (keyword === "threeDAxes") {
      parseThreeDAxes(tokens, state, lineNumber);
      return;
    }

    if (keyword === "projectedCircle") {
      parseProjectedCircle(tokens, state, lineNumber);
      return;
    }

    if (keyword === "rotatingLine") {
      parseRotatingLine(tokens, state, lineNumber);
      return;
    }

    if (keyword === "rotateUpdater") {
      parseRotateUpdater(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "arrow") {
      parseArrow(tokens, state, lineNumber);
      return;
    }

    if (keyword === "angle") {
      parseAngle(tokens, state, lineNumber);
      return;
    }

    if (keyword === "tracedPath") {
      parseTracedPath(tokens, state, lineNumber);
      return;
    }

    if (keyword === "arrange") {
      parseArrange(tokens, state, lineNumber, statementTime(state));
      return;
    }

    if (keyword === "nextTo") {
      parseNextTo(tokens, state, lineNumber, statementTime(state));
      return;
    }

    throw new DslCompileError(
      `Unknown statement '${keyword}'.`,
      lineNumber,
      columnOf(withoutComment, keyword),
    );
  });
  validateDeferredReferences(state);

  const autoCreates: TimelineOperation[] = [];
  for (const id of state.rootIds) {
    const node = state.nodes.get(id);
    if (!node) continue;
    if (!isShownOrHasShownDescendant(node, state.shown)) {
      autoCreates.push({ t: 0, op: "create", node: structuredClone(state.autoCreateSnapshots.get(id) ?? node) });
      state.shown.add(node.id);
    }
  }

  state.timeline = [...autoCreates, ...state.timeline];
  state.timeline.sort((a, b) => a.t - b.t);
  const duration = Math.max(
    0,
    state.extentTime,
    ...state.timeline.map((op) => op.t + ("duration" in op ? op.duration : 0)),
  );

  return {
    version: "0.1",
    width: state.width,
    height: state.height,
    fps: state.fps,
    duration,
    camera: state.camera,
    nodes: [...state.rootIds]
      .map((id) => state.nodes.get(id))
      .filter((node): node is SceneNode => node !== undefined),
    ...(state.values.size > 0
      ? { values: [...state.values].map(([id, initial]) => ({ id, initial })) }
      : {}),
    timeline: state.timeline,
  };
}

function validateDeferredReferences(state: CompileState): void {
  for (const ref of state.braceTargetRefs) {
    if (!state.nodes.has(ref.targetId))
      throw new DslCompileError(
        `Brace target '${ref.targetId}' could not be resolved.`,
        ref.lineNumber,
      );
  }
}

function isShownOrHasShownDescendant(
  node: SceneNode,
  shown: Set<string>,
): boolean {
  if (shown.has(node.id)) return true;
  return node.children.some((child) => isShownOrHasShownDescendant(child, shown));
}

function parseScene(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  for (const [key, value] of readAssignments(tokens.slice(1), lineNumber)) {
    if (key === "width") state.width = parseNumber(value, lineNumber);
    else if (key === "height") state.height = parseNumber(value, lineNumber);
    else if (key === "fps") state.fps = parseNumber(value, lineNumber);
    else
      throw new DslCompileError(`Unknown scene option '${key}'.`, lineNumber);
  }
}

function parseCamera(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  for (const [key, value] of readCameraArguments(tokens.slice(1), lineNumber)) {
    if (key === "at") {
      const [x, y] = value
        .split(",")
        .map((item) => parseNumber(item, lineNumber));
      if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y))
        throw new DslCompileError("Expected camera at x,y.", lineNumber);
      state.camera.x = x;
      state.camera.y = y;
      continue;
    }

    if (key === "x" || key === "y" || key === "scale" || key === "rotation") {
      state.camera[key] = parseNumber(value, lineNumber);
      continue;
    }
    if (key === "target") {
      const [x, y] = value.split(",").map((item) => parseNumber(item, lineNumber));
      if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y))
        throw new DslCompileError("Expected camera target x,y.", lineNumber);
      state.camera.target = { x, y };
      continue;
    }
    if (key === "padding") {
      state.camera.padding = parseNumber(value, lineNumber);
      continue;
    }
    if (key === "mode") {
      if (value !== "center" && value !== "target" && value !== "frame-fit")
        throw new DslCompileError("Camera mode must be center|target|frame-fit.", lineNumber);
      state.camera.mode = value;
      continue;
    }

    throw new DslCompileError(`Unknown camera option '${key}'.`, lineNumber);
  }
  state.cameraFrameCursor = cameraFrameCursorFromCamera(state.camera);
}

function parseCameraFrame(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  for (const [key, value] of readCameraArguments(tokens.slice(1), lineNumber)) {
    if (key === "at") {
      const [x, y] = value
        .split(",")
        .map((item) => parseNumber(item, lineNumber));
      if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y))
        throw new DslCompileError("Expected cameraFrame at x,y.", lineNumber);
      state.camera.x = x;
      state.camera.y = y;
      state.cameraFrameCursor.x = x;
      state.cameraFrameCursor.y = y;
      continue;
    }
    if (key === "x" || key === "y" || key === "scale" || key === "rotation") {
      const numericValue = parseNumber(value, lineNumber);
      state.camera[key] = numericValue;
      state.cameraFrameCursor[key] = numericValue;
      continue;
    }

    throw new DslCompileError(`Unknown cameraFrame option '${key}'.`, lineNumber);
  }
}

function cameraFrameCursorFromCamera(camera: Camera): CameraFrameCursor {
  return {
    x: camera.x,
    y: camera.y,
    scale: camera.scale,
    rotation: camera.rotation,
  };
}

function parseValueDeclaration(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after value.", lineNumber);
  if (!/^[_A-Za-z]\w*$/u.test(id))
    throw new DslCompileError(`Invalid value id '${id}'.`, lineNumber);
  if (state.values.has(id) || state.nodes.has(id))
    throw new DslCompileError(`Duplicate id '${id}'.`, lineNumber);
  if (tokens[2] !== "=" || tokens[3] === undefined || tokens.length > 4)
    throw new DslCompileError(
      "Expected value syntax: value name = number.",
      lineNumber,
    );

  state.values.set(id, parseNumber(tokens[3], lineNumber));
}

function parseNode(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  const type = tokens[0];
  const id = tokens[1];
  if (!isNodeType(type))
    throw new DslCompileError(`Unknown node type '${type ?? ""}'.`, lineNumber);
  if (!id)
    throw new DslCompileError(`Expected id after '${type}'.`, lineNumber);
  if (state.nodes.has(id))
    throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);

  let rest = tokens.slice(2);
  let content: string | undefined;
  const childIds: string[] = [];
  if (type === "group") {
    while (rest[0] && rest[0] !== "at" && !rest[0].includes("=")) {
      childIds.push(rest[0]);
      rest = rest.slice(1);
    }
  }

  if (type === "text" || type === "math") {
    content = rest[0];
    if (!content)
      throw new DslCompileError(
        `Expected quoted ${type === "math" ? "LaTeX" : "text"} after ${type} id.`,
        lineNumber,
      );
    rest = rest.slice(1);
  }

  const node = createBaseNode(id, type);
  if (type === "text" && content !== undefined) node.text = content;
  if (type === "math" && content !== undefined) {
    node.latex = content;
    node.renderer = "katex";
  }
  if (type === "group") {
    node.children = childIds.map((childId) => {
      const child = state.nodes.get(childId);
      if (!child)
        throw new DslCompileError(
          `Unknown group child node '${childId}'.`,
          lineNumber,
        );
      return structuredClone(child);
    });
  }

  const assignments = readNodeArguments(rest, lineNumber);
  for (const [key, value] of assignments)
    applyNodeOption(node, key, value, lineNumber);
  if (
    type === "math" &&
    assignments.some(
      ([key, value]) =>
        key === "expandTokens" && parseBoolean(value, lineNumber),
    )
  ) {
    expandMathTokens(node, lineNumber);
  }
  if (type === "brace") {
    const target = String(node.geometry.target ?? "").trim();
    if (!target)
      throw new DslCompileError("Brace requires target=<nodeId>.", lineNumber);
    state.braceTargetRefs.push({ braceId: id, targetId: target, lineNumber });
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  if (type === "group") {
    for (const childId of childIds) state.rootIds.delete(childId);
  }
}

function parseSurroundingRect(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  const id = tokens[1];
  if (!id)
    throw new DslCompileError("Expected id after surroundingRect.", lineNumber);
  if (state.nodes.has(id))
    throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);

  const options = readNodeArguments(tokens.slice(2), lineNumber);
  const targetId = options.find(([key]) => key === "target")?.[1];
  if (!targetId)
    throw new DslCompileError(
      "surroundingRect requires target=<nodeId>.",
      lineNumber,
    );
  const target = findNode(state, targetId);
  if (!target)
    throw new DslCompileError(
      `surroundingRect target '${targetId}' could not be resolved.`,
      lineNumber,
    );

  const buffRaw = options.find(([key]) => key === "buff")?.[1] ?? "8";
  const buff = parseNumber(buffRaw, lineNumber);
  const bounds = approximateNodeBounds(target);
  const node = createBaseNode(id, "rect");
  node.transform.x = (bounds.minX + bounds.maxX) / 2;
  node.transform.y = (bounds.minY + bounds.maxY) / 2;
  node.geometry.w = Math.max(1, bounds.maxX - bounds.minX + buff * 2);
  node.geometry.h = Math.max(1, bounds.maxY - bounds.minY + buff * 2);
  node.style.fill = "none";
  node.style.stroke = "#ffffff";
  node.style.strokeWidth = 2;
  node.geometry.shapeMatcher = "surroundingRect";

  for (const [key, value] of options) {
    if (key === "target" || key === "buff") continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
}


function parseAxes(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after axes.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const at = options.get("at") ?? "0,0";
  const [cx, cy] = at.split(",").map((v) => parseNumber(v, lineNumber));
  const xRange = (options.get("xRange") ?? "-7,7").split(",").map((v) => parseNumber(v, lineNumber));
  const yRange = (options.get("yRange") ?? "-4,4").split(",").map((v) => parseNumber(v, lineNumber));
  const width = parseNumber(options.get("width") ?? "810", lineNumber);
  const height = parseNumber(options.get("height") ?? "405", lineNumber);
  const stroke = options.get("stroke") ?? "#FFFFFF";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "2", lineNumber);
  const axesGeometryValue = { xMin: xRange[0]!, xMax: xRange[1]!, yMin: yRange[0]!, yMax: yRange[1]!, width, height };
  const origin = axesDataToPoint({ x: 0, y: 0 }, axesGeometryValue);

  const xAxis = createBaseNode(`${id}_x`, "line");
  xAxis.transform.x = cx!; xAxis.transform.y = cy!;
  xAxis.geometry.x1 = -width / 2; xAxis.geometry.y1 = origin.y; xAxis.geometry.x2 = width / 2; xAxis.geometry.y2 = origin.y;
  xAxis.style.stroke = stroke; xAxis.style.strokeWidth = strokeWidth;

  const yAxis = createBaseNode(`${id}_y`, "line");
  yAxis.transform.x = cx!; yAxis.transform.y = cy!;
  yAxis.geometry.x1 = origin.x; yAxis.geometry.y1 = -height / 2; yAxis.geometry.x2 = origin.x; yAxis.geometry.y2 = height / 2;
  yAxis.style.stroke = stroke; yAxis.style.strokeWidth = strokeWidth;

  const group = createBaseNode(id, "group");
  group.children = [
    xAxis,
    yAxis,
    ...buildAxesNumberChildren(id, options, axesGeometryValue, origin, cx!, cy!, lineNumber),
  ];
  group.metadata = { plot: { range: [xRange[0]!, xRange[1]!] } };
  group.geometry.xMin = xRange[0]!;
  group.geometry.xMax = xRange[1]!;
  group.geometry.yMin = yRange[0]!;
  group.geometry.yMax = yRange[1]!;
  group.geometry.width = width;
  group.geometry.height = height;
  group.geometry.centerX = cx!;
  group.geometry.centerY = cy!;
  group.geometry.originX = origin.x;
  group.geometry.originY = origin.y;
  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseAxisLabels(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after axisLabels.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("axisLabels requires axes=<axes-id>.", lineNumber);
  const axes = requireAxesNode(state, axesId, lineNumber, "axisLabels");
  const fontSize = parseNumber(options.get("size") ?? options.get("fontSize") ?? "28", lineNumber);
  const xFontSize = parseNumber(options.get("xSize") ?? String(fontSize), lineNumber);
  const yFontSize = parseNumber(options.get("ySize") ?? String(fontSize), lineNumber);
  const fill = options.get("fill") ?? "#FFFFFF";
  const renderer = options.get("renderer") ?? "katex";
  const buff = parseNumber(options.get("buff") ?? "20", lineNumber);
  const xBuff = parseNumber(options.get("xBuff") ?? String(buff), lineNumber);
  const yBuff = parseNumber(options.get("yBuff") ?? String(buff), lineNumber);
  const xYOffset = parseNumber(options.get("xYOffset") ?? String(-buff), lineNumber);
  const yYOffset = parseNumber(options.get("yYOffset") ?? String(-buff), lineNumber);
  const xLabel = options.get("x") ?? "x";
  const yLabel = options.get("y") ?? "y";
  const centerX = Number(axes.geometry.centerX ?? 0);
  const centerY = Number(axes.geometry.centerY ?? 0);
  const width = Number(axes.geometry.width ?? 760);
  const height = Number(axes.geometry.height ?? 360);
  const originX = Number(axes.geometry.originX ?? 0);
  const originY = Number(axes.geometry.originY ?? 0);
  const xNode = createBaseNode(`${id}:x`, "math");
  xNode.latex = xLabel;
  xNode.renderer = renderer;
  xNode.geometry.fontSize = xFontSize;
  xNode.transform.x = centerX + width / 2 + xBuff;
  xNode.transform.y = centerY + originY + xYOffset;
  xNode.style.fill = fill;
  const yNode = createBaseNode(`${id}:y`, "math");
  yNode.latex = yLabel;
  yNode.renderer = renderer;
  yNode.geometry.fontSize = yFontSize;
  yNode.transform.x = centerX + originX + yBuff;
  yNode.transform.y = centerY - height / 2 + yYOffset;
  yNode.style.fill = fill;
  const group = createBaseNode(id, "group");
  group.children = [xNode, yNode];
  group.geometry.axisLabels = true;
  group.geometry.axes = axesId;
  for (const [key, value] of options) {
    if (
      [
        "axes",
        "x",
        "y",
        "size",
        "fontSize",
        "xSize",
        "ySize",
        "fill",
        "renderer",
        "buff",
        "xBuff",
        "yBuff",
        "xYOffset",
        "yYOffset",
      ].includes(key)
    )
      continue;
    applyNodeOption(group, key, value, lineNumber);
  }
  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseNumberPlane(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after numberPlane.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const [cx, cy] = parsePointOption(options.get("at") ?? "0,0", "at", lineNumber);
  const [xMin, xMax] = parseRangeOption(options.get("xRange") ?? "-7.111111,7.111111", "xRange", lineNumber);
  const [yMin, yMax] = parseRangeOption(options.get("yRange") ?? "-4,4", "yRange", lineNumber);
  const xStep = parseNumber(options.get("xStep") ?? "1", lineNumber);
  const yStep = parseNumber(options.get("yStep") ?? "1", lineNumber);
  const xUnit = parseNumber(options.get("xUnit") ?? options.get("unit") ?? "67.5", lineNumber);
  const yUnit = parseNumber(options.get("yUnit") ?? options.get("unit") ?? "67.5", lineNumber);
  const color =
    options.get("stroke") ??
    options.get("color") ??
    options.get("backgroundStroke") ??
    options.get("backgroundLineStroke") ??
    options.get("backgroundLineColor") ??
    "#29ABCA";
  const axisColor = options.get("axisStroke") ?? options.get("axisColor") ?? "#FFFFFF";
  const xAxisColor = options.get("xAxisStroke") ?? options.get("xAxisColor") ?? axisColor;
  const yAxisColor = options.get("yAxisStroke") ?? options.get("yAxisColor") ?? axisColor;
  const strokeWidth = parseNumber(
    options.get("strokeWidth") ?? options.get("backgroundStrokeWidth") ?? options.get("backgroundLineStrokeWidth") ?? "2",
    lineNumber,
  );
  const axisStrokeWidth = parseNumber(options.get("axisStrokeWidth") ?? "2", lineNumber);
  const xAxisStrokeWidth = parseNumber(options.get("xAxisStrokeWidth") ?? String(axisStrokeWidth), lineNumber);
  const yAxisStrokeWidth = parseNumber(options.get("yAxisStrokeWidth") ?? String(axisStrokeWidth), lineNumber);
  const opacity = parseNumber(
    options.get("opacity") ?? options.get("backgroundOpacity") ?? options.get("backgroundLineOpacity") ?? "1",
    lineNumber,
  );
  const axisOpacity = parseNumber(options.get("axisOpacity") ?? "1", lineNumber);
  const xAxisOpacity = parseNumber(options.get("xAxisOpacity") ?? String(axisOpacity), lineNumber);
  const yAxisOpacity = parseNumber(options.get("yAxisOpacity") ?? String(axisOpacity), lineNumber);
  const fadedLineRatio = Math.max(
    0,
    Math.round(parseNumber(options.get("fadedLineRatio") ?? "1", lineNumber)),
  );
  const fadedStroke = options.get("fadedStroke") ?? color;
  const fadedStrokeWidth = parseNumber(
    options.get("fadedStrokeWidth") ?? String(strokeWidth * 0.5),
    lineNumber,
  );
  const fadedOpacity = parseNumber(
    options.get("fadedOpacity") ?? String(opacity * 0.5),
    lineNumber,
  );
  const includeTicks = parseBoolean(options.get("includeTicks") ?? options.get("axisTicks") ?? "false", lineNumber);
  const addCoordinates = parseBoolean(options.get("addCoordinates") ?? options.get("includeNumbers") ?? "false", lineNumber);
  const tickLength = parseNumber(options.get("tickLength") ?? "8", lineNumber);
  const tickStrokeWidth = parseNumber(options.get("tickStrokeWidth") ?? String(axisStrokeWidth), lineNumber);
  const numberSize = parseNumber(options.get("numberSize") ?? "24", lineNumber);
  const numberColor = options.get("numberColor") ?? axisColor;
  const xNumberOffsetX = parseNumber(options.get("xNumberOffsetX") ?? "8", lineNumber);
  const xNumberOffsetY = parseNumber(options.get("xNumberOffsetY") ?? "24", lineNumber);
  const yNumberOffsetX = parseNumber(options.get("yNumberOffsetX") ?? "24", lineNumber);
  const yNumberOffsetY = parseNumber(options.get("yNumberOffsetY") ?? "10", lineNumber);
  const children: SceneNode[] = [];

  const mainYValues = steppedValues(yMin, yMax, yStep);
  const mainXValues = steppedValues(xMin, xMax, xStep);
  const shouldFade = (value: number, step: number) => {
    const delta = Math.abs(step) > 1e-9 ? Math.abs(step) : 1;
    return Math.abs(value / delta - Math.round(value / delta)) > 1e-7;
  };
  if (fadedLineRatio > 1) {
    for (const y of steppedValues(yMin, yMax, yStep / fadedLineRatio)) {
      if (!shouldFade(y, yStep)) continue;
      const line = createBaseNode(`${id}:fh:${formatAxisValueId(y)}`, "line");
      line.geometry.x1 = xMin * xUnit;
      line.geometry.y1 = -y * yUnit;
      line.geometry.x2 = xMax * xUnit;
      line.geometry.y2 = -y * yUnit;
      line.style.stroke = fadedStroke;
      line.style.strokeWidth = fadedStrokeWidth;
      line.transform.opacity = fadedOpacity;
      children.push(line);
    }
    for (const x of steppedValues(xMin, xMax, xStep / fadedLineRatio)) {
      if (!shouldFade(x, xStep)) continue;
      const line = createBaseNode(`${id}:fv:${formatAxisValueId(x)}`, "line");
      line.geometry.x1 = x * xUnit;
      line.geometry.y1 = -yMax * yUnit;
      line.geometry.x2 = x * xUnit;
      line.geometry.y2 = -yMin * yUnit;
      line.style.stroke = fadedStroke;
      line.style.strokeWidth = fadedStrokeWidth;
      line.transform.opacity = fadedOpacity;
      children.push(line);
    }
  }

  for (const y of mainYValues) {
    const line = createBaseNode(`${id}:h:${formatAxisValueId(y)}`, "line");
    line.geometry.x1 = xMin * xUnit;
    line.geometry.y1 = -y * yUnit;
    line.geometry.x2 = xMax * xUnit;
    line.geometry.y2 = -y * yUnit;
    line.style.stroke = Math.abs(y) < 1e-9 ? xAxisColor : color;
    line.style.strokeWidth = Math.abs(y) < 1e-9 ? xAxisStrokeWidth : strokeWidth;
    line.transform.opacity = Math.abs(y) < 1e-9 ? xAxisOpacity : opacity;
    children.push(line);
  }

  for (const x of mainXValues) {
    const line = createBaseNode(`${id}:v:${formatAxisValueId(x)}`, "line");
    line.geometry.x1 = x * xUnit;
    line.geometry.y1 = -yMax * yUnit;
    line.geometry.x2 = x * xUnit;
    line.geometry.y2 = -yMin * yUnit;
    line.style.stroke = Math.abs(x) < 1e-9 ? yAxisColor : color;
    line.style.strokeWidth = Math.abs(x) < 1e-9 ? yAxisStrokeWidth : strokeWidth;
    line.transform.opacity = Math.abs(x) < 1e-9 ? yAxisOpacity : opacity;
    children.push(line);
  }

  children.push(
    ...buildNumberPlaneCoordinateChildren({
      id,
      mainXValues,
      mainYValues,
      includeTicks,
      addCoordinates,
      xNumbers: parseNumberListOption(options.get("xNumbers"), lineNumber),
      yNumbers: parseNumberListOption(options.get("yNumbers"), lineNumber),
      xUnit,
      yUnit,
      tickLength,
      tickStrokeWidth,
      numberSize,
      numberColor,
      xNumberOffsetX,
      xNumberOffsetY,
      yNumberOffsetX,
      yNumberOffsetY,
      xAxisStroke: xAxisColor,
      yAxisStroke: yAxisColor,
    }),
  );

  const group = createBaseNode(id, "group");
  group.transform.x = cx;
  group.transform.y = cy;
  group.children = children;
  group.geometry.numberPlane = true;
  group.geometry.xMin = xMin;
  group.geometry.xMax = xMax;
  group.geometry.yMin = yMin;
  group.geometry.yMax = yMax;
  group.geometry.xStep = xStep;
  group.geometry.yStep = yStep;
  group.geometry.xUnit = xUnit;
  group.geometry.yUnit = yUnit;
  group.geometry.fadedLineRatio = fadedLineRatio;
  group.geometry.includeTicks = includeTicks;
  group.geometry.addCoordinates = addCoordinates;
  for (const [key, value] of options) {
    if (
      [
        "at",
        "xRange",
        "yRange",
        "xStep",
        "yStep",
        "unit",
        "xUnit",
        "yUnit",
        "stroke",
        "color",
        "backgroundStroke",
        "backgroundLineStroke",
        "backgroundLineColor",
        "axisStroke",
        "axisColor",
        "xAxisStroke",
        "xAxisColor",
        "yAxisStroke",
        "yAxisColor",
        "strokeWidth",
        "backgroundStrokeWidth",
        "backgroundLineStrokeWidth",
        "axisStrokeWidth",
        "xAxisStrokeWidth",
        "yAxisStrokeWidth",
        "opacity",
        "backgroundOpacity",
        "backgroundLineOpacity",
        "axisOpacity",
        "xAxisOpacity",
        "yAxisOpacity",
        "fadedLineRatio",
        "fadedStroke",
        "fadedStrokeWidth",
        "fadedOpacity",
        "includeTicks",
        "axisTicks",
        "addCoordinates",
        "includeNumbers",
        "xNumbers",
        "yNumbers",
        "tickLength",
        "tickStrokeWidth",
        "numberSize",
        "numberColor",
        "xNumberOffsetX",
        "xNumberOffsetY",
        "yNumberOffsetX",
        "yNumberOffsetY",
      ].includes(key)
    )
      continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function buildNumberPlaneCoordinateChildren({
  id,
  mainXValues,
  mainYValues,
  includeTicks,
  addCoordinates,
  xNumbers,
  yNumbers,
  xUnit,
  yUnit,
  tickLength,
  tickStrokeWidth,
  numberSize,
  numberColor,
  xNumberOffsetX,
  xNumberOffsetY,
  yNumberOffsetX,
  yNumberOffsetY,
  xAxisStroke,
  yAxisStroke,
}: {
  id: string;
  mainXValues: number[];
  mainYValues: number[];
  includeTicks: boolean;
  addCoordinates: boolean;
  xNumbers: number[];
  yNumbers: number[];
  xUnit: number;
  yUnit: number;
  tickLength: number;
  tickStrokeWidth: number;
  numberSize: number;
  numberColor: string;
  xNumberOffsetX: number;
  xNumberOffsetY: number;
  yNumberOffsetX: number;
  yNumberOffsetY: number;
  xAxisStroke: string;
  yAxisStroke: string;
}): SceneNode[] {
  const children: SceneNode[] = [];
  const defaultXNumbers = addCoordinates ? mainXValues.filter((value) => Math.abs(value) > 1e-9) : [];
  const defaultYNumbers = addCoordinates ? mainYValues.filter((value) => Math.abs(value) > 1e-9) : [];
  const xNumberValues = uniqueAxisValues([...defaultXNumbers, ...xNumbers]);
  const yNumberValues = uniqueAxisValues([...defaultYNumbers, ...yNumbers]);
  const xTickValues = includeTicks ? uniqueAxisValues([...mainXValues, ...xNumberValues]).filter((value) => Math.abs(value) > 1e-9) : [];
  const yTickValues = includeTicks ? uniqueAxisValues([...mainYValues, ...yNumberValues]).filter((value) => Math.abs(value) > 1e-9) : [];

  for (const value of xTickValues) {
    const suffix = formatAxisValueId(value);
    const tick = createBaseNode(`${id}:x_tick:${suffix}`, "line");
    tick.transform.x = value * xUnit;
    tick.transform.y = 0;
    tick.geometry.x1 = 0;
    tick.geometry.y1 = -tickLength / 2;
    tick.geometry.x2 = 0;
    tick.geometry.y2 = tickLength / 2;
    tick.style.stroke = xAxisStroke;
    tick.style.strokeWidth = tickStrokeWidth;
    children.push(tick);
  }

  for (const value of yTickValues) {
    const suffix = formatAxisValueId(value);
    const tick = createBaseNode(`${id}:y_tick:${suffix}`, "line");
    tick.transform.x = 0;
    tick.transform.y = -value * yUnit;
    tick.geometry.x1 = -tickLength / 2;
    tick.geometry.y1 = 0;
    tick.geometry.x2 = tickLength / 2;
    tick.geometry.y2 = 0;
    tick.style.stroke = yAxisStroke;
    tick.style.strokeWidth = tickStrokeWidth;
    children.push(tick);
  }

  for (const value of xNumberValues) {
    const label = createBaseNode(`${id}:x_number:${formatAxisValueId(value)}`, "text");
    label.text = formatAxisNumber(value);
    label.transform.x = value * xUnit + xNumberOffsetX;
    label.transform.y = xNumberOffsetY;
    label.geometry.fontSize = numberSize;
    label.style.fill = numberColor;
    label.style.stroke = "none";
    label.style.strokeWidth = 0;
    children.push(label);
  }

  for (const value of yNumberValues) {
    const label = createBaseNode(`${id}:y_number:${formatAxisValueId(value)}`, "text");
    label.text = formatAxisNumber(value);
    label.transform.x = yNumberOffsetX;
    label.transform.y = -value * yUnit + yNumberOffsetY;
    label.geometry.fontSize = numberSize;
    label.style.fill = numberColor;
    label.style.stroke = "none";
    label.style.strokeWidth = 0;
    children.push(label);
  }

  return children;
}

function buildAxesNumberChildren(
  id: string,
  options: Map<string, string>,
  axes: { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number },
  origin: { x: number; y: number },
  centerX: number,
  centerY: number,
  lineNumber: number,
): SceneNode[] {
  const tickLength = parseNumber(options.get("tickLength") ?? "14", lineNumber);
  const tickStrokeWidth = parseNumber(options.get("tickStrokeWidth") ?? "2", lineNumber);
  const labelSize = parseNumber(options.get("numberSize") ?? "18", lineNumber);
  const color = options.get("numberColor") ?? options.get("stroke") ?? "#ffffff";
  const xLabelOffset = parseNumber(options.get("xNumberOffset") ?? "36", lineNumber);
  const yLabelOffset = parseNumber(options.get("yNumberOffset") ?? "-38", lineNumber);
  const children: SceneNode[] = [];
  const xNumbers = parseNumberListOption(options.get("xNumbers"), lineNumber);
  const yNumbers = parseNumberListOption(options.get("yNumbers"), lineNumber);
  const xNumberKeys = new Set(xNumbers.map(formatAxisValueId));
  const yNumberKeys = new Set(yNumbers.map(formatAxisValueId));
  const xTickValues = uniqueAxisValues([...parseNumberListOption(options.get("xTicks"), lineNumber), ...xNumbers]);
  const yTickValues = uniqueAxisValues([...parseNumberListOption(options.get("yTicks"), lineNumber), ...yNumbers]);

  for (const value of xTickValues) {
    const point = axesDataToPoint({ x: value, y: 0 }, axes);
    const suffix = formatAxisValueId(value);
    const tick = createBaseNode(`${id}:x_tick:${suffix}`, "line");
    tick.transform.x = centerX + point.x;
    tick.transform.y = centerY + origin.y;
    tick.geometry.x1 = 0;
    tick.geometry.y1 = -tickLength / 2;
    tick.geometry.x2 = 0;
    tick.geometry.y2 = tickLength / 2;
    tick.style.stroke = color;
    tick.style.strokeWidth = tickStrokeWidth;
    children.push(tick);
    if (!xNumberKeys.has(suffix)) continue;
    const label = createBaseNode(`${id}:x_number:${suffix}`, "text");
    label.transform.x = centerX + point.x;
    label.transform.y = centerY + origin.y + xLabelOffset;
    label.geometry.fontSize = labelSize;
    label.text = formatAxisNumber(value);
    label.style.fill = color;
    label.style.stroke = "none";
    label.style.strokeWidth = 0;
    children.push(label);
  }

  for (const value of yTickValues) {
    const point = axesDataToPoint({ x: 0, y: value }, axes);
    const suffix = formatAxisValueId(value);
    const tick = createBaseNode(`${id}:y_tick:${suffix}`, "line");
    tick.transform.x = centerX + origin.x;
    tick.transform.y = centerY + point.y;
    tick.geometry.x1 = -tickLength / 2;
    tick.geometry.y1 = 0;
    tick.geometry.x2 = tickLength / 2;
    tick.geometry.y2 = 0;
    tick.style.stroke = color;
    tick.style.strokeWidth = tickStrokeWidth;
    children.push(tick);
    if (!yNumberKeys.has(suffix)) continue;
    const label = createBaseNode(`${id}:y_number:${suffix}`, "text");
    label.transform.x = centerX + origin.x + yLabelOffset;
    label.transform.y = centerY + point.y;
    label.geometry.fontSize = labelSize;
    label.text = formatAxisNumber(value);
    label.style.fill = color;
    label.style.stroke = "none";
    label.style.strokeWidth = 0;
    children.push(label);
  }

  return children;
}

function parseDataPolygon(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataPolygon.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataPolygon requires axes=<axesId>.", lineNumber);
  const axes = requireNode(state, axesId, lineNumber);
  if (axes.type !== "group" || axes.geometry.xMin === undefined || axes.geometry.yMin === undefined)
    throw new DslCompileError(`dataPolygon axes '${axesId}' is not an axes helper.`, lineNumber);
  const pointsRaw = options.get("points");
  if (!pointsRaw) throw new DslCompileError("dataPolygon requires points=<x,y;...>.", lineNumber);

  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const points = parseDataPointList(pointsRaw, lineNumber).map(([x, y]) => axesDataToPoint({ x, y }, axesGeometry(axes)));

  const node = createBaseNode(id, "path");
  node.transform.x = centerX;
  node.transform.y = centerY;
  node.geometry.d = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`)
    .concat("Z")
    .join(" ");
  node.geometry.dataPolygon = true;
  node.geometry.axes = axesId;
  node.style.fill = "#22d3ee";
  node.style.stroke = "#22d3ee";
  node.style.strokeWidth = 3;
  for (const [key, value] of options) {
    if (key === "axes" || key === "points") continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
}

function parseDataLineGraph(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataLineGraph.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataLineGraph requires axes=<axesId>.", lineNumber);
  const axes = requireNode(state, axesId, lineNumber);
  if (axes.type !== "group" || axes.geometry.xMin === undefined || axes.geometry.yMin === undefined)
    throw new DslCompileError(`dataLineGraph axes '${axesId}' is not an axes helper.`, lineNumber);
  const pointsRaw = options.get("points");
  if (!pointsRaw) throw new DslCompileError("dataLineGraph requires points=<x,y;...>.", lineNumber);

  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const points = parseDataPointList(pointsRaw, lineNumber, 2).map(([x, y]) => axesDataToPoint({ x, y }, axesGeometry(axes)));
  const lineColor = options.get("lineColor") ?? options.get("stroke") ?? "#FFFF00";
  const vertexColor = options.get("vertexColor") ?? lineColor;
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "4", lineNumber);
  const vertexRadius = parseNumber(options.get("vertexRadius") ?? "5.4", lineNumber);

  const line = createBaseNode(`${id}:line_graph`, "path");
  line.geometry.d = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`)
    .join(" ");
  line.style.fill = "none";
  line.style.stroke = lineColor;
  line.style.strokeWidth = strokeWidth;
  line.style.strokeLinecap = "round";
  line.style.strokeLinejoin = "round";

  const dots = points.map((point, index) => {
    const dot = createBaseNode(`${id}:vertex:${index}`, "circle");
    dot.transform.x = point.x;
    dot.transform.y = point.y;
    dot.geometry.r = vertexRadius;
    dot.style.fill = vertexColor;
    dot.style.stroke = vertexColor;
    dot.style.strokeWidth = 0;
    return dot;
  });

  const group = createBaseNode(id, "group");
  group.transform.x = centerX;
  group.transform.y = centerY;
  group.children = [line, ...dots];
  group.geometry.dataLineGraph = true;
  group.geometry.axes = axesId;
  group.geometry.points = pointsRaw;
  for (const [key, value] of options) {
    if (["axes", "points", "lineColor", "vertexColor", "stroke", "strokeWidth", "vertexRadius"].includes(key)) continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseDataRect(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataRect.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataRect requires axes=<axesId>.", lineNumber);
  const axes = requireAxesNode(state, axesId, lineNumber, "dataRect");
  const from = parseDataCoordExpressionOption(options.get("from") ?? "0,0", "from", state, lineNumber);
  const to = parseDataCoordExpressionOption(options.get("to"), "to", state, lineNumber);
  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const geometry = axesGeometry(axes);
  const x0 = axesDataExpression("x", from.x, geometry, centerX, centerY);
  const y0 = axesDataExpression("y", from.y, geometry, centerX, centerY);
  const x1 = axesDataExpression("x", to.x, geometry, centerX, centerY);
  const y1 = axesDataExpression("y", to.y, geometry, centerX, centerY);
  const expressions = {
    w: `abs((${x1})-(${x0}))`,
    h: `abs((${y1})-(${y0}))`,
    x: `((${x0})+(${x1}))/2`,
    y: `((${y0})+(${y1}))/2`,
  };

  const node = createBaseNode(id, "rect");
  node.geometry.w = evaluateDslExpression(expressions.w, state, lineNumber);
  node.geometry.h = evaluateDslExpression(expressions.h, state, lineNumber);
  node.transform.x = evaluateDslExpression(expressions.x, state, lineNumber);
  node.transform.y = evaluateDslExpression(expressions.y, state, lineNumber);
  node.geometry.dataRect = true;
  node.geometry.axes = axesId;
  node.geometry.from = `${from.x},${from.y}`;
  node.geometry.to = `${to.x},${to.y}`;
  node.style.fill = "#58C4DD";
  node.style.fillOpacity = 0.5;
  node.style.stroke = "#F7D45A";
  node.style.strokeWidth = 1;
  for (const [key, value] of options) {
    if (["axes", "from", "to"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  pushBindExpr(state, id, propertyPath("w"), expressions.w, statementTime(state));
  pushBindExpr(state, id, propertyPath("h"), expressions.h, statementTime(state));
  pushBindExpr(state, id, propertyPath("x"), expressions.x, statementTime(state));
  pushBindExpr(state, id, propertyPath("y"), expressions.y, statementTime(state));
}

function parseDataDot(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataDot.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataDot requires axes=<axesId>.", lineNumber);
  const axes = requireAxesNode(state, axesId, lineNumber, "dataDot");
  const point = parseDataCoordExpressionOption(options.get("point"), "point", state, lineNumber);
  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const geometry = axesGeometry(axes);
  const xExpr = axesDataExpression("x", point.x, geometry, centerX, centerY);
  const yExpr = axesDataExpression("y", point.y, geometry, centerX, centerY);

  const node = createBaseNode(id, "circle");
  node.transform.x = evaluateDslExpression(xExpr, state, lineNumber);
  node.transform.y = evaluateDslExpression(yExpr, state, lineNumber);
  node.geometry.r = parseNumber(options.get("r") ?? "5.4", lineNumber);
  node.geometry.dataDot = true;
  node.geometry.axes = axesId;
  node.geometry.point = `${point.x},${point.y}`;
  node.style.fill = "#ffffff";
  node.style.stroke = "#ffffff";
  node.style.strokeWidth = 0;
  for (const [key, value] of options) {
    if (["axes", "point", "r"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  pushBindExpr(state, id, propertyPath("x"), xExpr, statementTime(state));
  pushBindExpr(state, id, propertyPath("y"), yExpr, statementTime(state));
}

function parseDataLine(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataLine.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataLine requires axes=<axesId>.", lineNumber);
  const axes = requireAxesNode(state, axesId, lineNumber, "dataLine");
  const from = parseDataCoordExpressionOption(options.get("from"), "from", state, lineNumber);
  const to = parseDataCoordExpressionOption(options.get("to"), "to", state, lineNumber);
  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const geometry = axesGeometry(axes);
  const expressions = {
    x1: axesDataExpression("x", from.x, geometry, centerX, centerY),
    y1: axesDataExpression("y", from.y, geometry, centerX, centerY),
    x2: axesDataExpression("x", to.x, geometry, centerX, centerY),
    y2: axesDataExpression("y", to.y, geometry, centerX, centerY),
  };

  const node = createBaseNode(id, "line");
  node.geometry.x1 = evaluateDslExpression(expressions.x1, state, lineNumber);
  node.geometry.y1 = evaluateDslExpression(expressions.y1, state, lineNumber);
  node.geometry.x2 = evaluateDslExpression(expressions.x2, state, lineNumber);
  node.geometry.y2 = evaluateDslExpression(expressions.y2, state, lineNumber);
  node.geometry.dataLine = true;
  node.geometry.axes = axesId;
  node.geometry.from = `${from.x},${from.y}`;
  node.geometry.to = `${to.x},${to.y}`;
  node.style.fill = "none";
  node.style.stroke = "#ffffff";
  node.style.strokeWidth = 4;
  for (const [key, value] of options) {
    if (["axes", "from", "to"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  for (const [property, expression] of Object.entries(expressions)) {
    pushBindExpr(state, id, propertyPath(property), expression, statementTime(state));
  }
}

function parseDynamicLine(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dynamicLine.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const expressions = {
    x1: options.get("x1") ?? "0",
    y1: options.get("y1") ?? "0",
    x2: options.get("x2") ?? "100",
    y2: options.get("y2") ?? "0",
  };
  for (const expression of Object.values(expressions)) validateDslExpression(expression, state, lineNumber);

  const node = createBaseNode(id, "line");
  node.geometry.x1 = evaluateDslExpression(expressions.x1, state, lineNumber);
  node.geometry.y1 = evaluateDslExpression(expressions.y1, state, lineNumber);
  node.geometry.x2 = evaluateDslExpression(expressions.x2, state, lineNumber);
  node.geometry.y2 = evaluateDslExpression(expressions.y2, state, lineNumber);
  node.geometry.dynamicLine = true;
  node.style.fill = "none";
  node.style.stroke = "#ffffff";
  node.style.strokeWidth = 4;
  for (const [key, value] of options) {
    if (["x1", "y1", "x2", "y2"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  for (const [property, expression] of Object.entries(expressions)) {
    pushBindExpr(state, id, propertyPath(property), expression, statementTime(state));
  }
}

function parseDataArea(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataArea.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataArea requires axes=<axesId>.", lineNumber);
  const axes = requireAxesNode(state, axesId, lineNumber, "dataArea");
  const lower = options.get("lower");
  const upper = options.get("upper");
  if (!lower || !upper) throw new DslCompileError("dataArea requires lower=<expr> and upper=<expr>.", lineNumber);
  validateGraphExpression(lower, state, lineNumber);
  validateGraphExpression(upper, state, lineNumber);
  const [x0, x1] = parseRangeOption(options.get("range"), "range", lineNumber);
  const samples = Math.max(2, Math.round(parseNumber(options.get("samples") ?? "48", lineNumber)));
  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const geometry = axesGeometry(axes);
  const upperPoints = sampleDataFunctionPoints(upper, x0, x1, samples, state, lineNumber, geometry, centerX, centerY);
  const lowerPoints = sampleDataFunctionPoints(lower, x1, x0, samples, state, lineNumber, geometry, centerX, centerY);

  const node = createBaseNode(id, "path");
  node.geometry.d = curvesToClosedAreaPath(upperPoints, lowerPoints);
  node.geometry.dataArea = true;
  node.geometry.axes = axesId;
  node.geometry.lower = lower;
  node.geometry.upper = upper;
  node.style.fill = "#888888";
  node.style.fillOpacity = 0.5;
  node.style.stroke = "none";
  node.style.strokeWidth = 0;
  for (const [key, value] of options) {
    if (["axes", "lower", "upper", "range", "samples"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
}

function parseDataRiemannRects(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after dataRiemannRects.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const axesId = options.get("axes");
  if (!axesId) throw new DslCompileError("dataRiemannRects requires axes=<axesId>.", lineNumber);
  const axes = requireAxesNode(state, axesId, lineNumber, "dataRiemannRects");
  const fn = options.get("fn");
  if (!fn) throw new DslCompileError("dataRiemannRects requires fn=<expr>.", lineNumber);
  validateGraphExpression(fn, state, lineNumber);
  const [x0, x1] = parseRangeOption(options.get("range"), "range", lineNumber);
  const dx = parseNumber(options.get("dx") ?? "0.1", lineNumber);
  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const geometry = axesGeometry(axes);
  const fill = options.get("fill") ?? options.get("color") ?? "#0000FF";
  const stroke = options.get("stroke") ?? options.get("strokeColor") ?? "#000000";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "0.5", lineNumber);
  const fillOpacity = parseNumber(options.get("fillOpacity") ?? "0.5", lineNumber);
  const children: SceneNode[] = [];
  const count = Math.max(0, Math.ceil((x1 - x0) / dx - 1e-9));
  for (let index = 0; index < count; index++) {
    const left = x0 + index * dx;
    const right = Math.min(left + dx, x1);
    const y = evaluateGraphExpression(fn, left, state, lineNumber);
    const p0 = axesDataToScenePoint({ x: left, y: 0 }, geometry, centerX, centerY);
    const p1 = axesDataToScenePoint({ x: right, y }, geometry, centerX, centerY);
    const rect = createBaseNode(`${id}:rect:${index}`, "rect");
    rect.geometry.w = Math.abs(p1.x - p0.x);
    rect.geometry.h = Math.abs(p1.y - p0.y);
    rect.transform.x = (p0.x + p1.x) / 2;
    rect.transform.y = (p0.y + p1.y) / 2;
    rect.style.fill = fill;
    rect.style.fillOpacity = fillOpacity;
    rect.style.stroke = stroke;
    rect.style.strokeWidth = strokeWidth;
    children.push(rect);
  }

  const group = createBaseNode(id, "group");
  group.children = children;
  group.geometry.dataRiemannRects = true;
  group.geometry.axes = axesId;
  group.geometry.fn = fn;
  group.geometry.dx = dx;
  for (const [key, value] of options) {
    if (["axes", "fn", "range", "dx", "fill", "color", "stroke", "strokeColor", "strokeWidth", "fillOpacity"].includes(key)) continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseGaussianSurface(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after gaussianSurface.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const [cx, cy] = parsePointOption(options.get("at") ?? "0,0", "at", lineNumber);
  const [u0, u1] = parseRangeOption(options.get("uRange") ?? options.get("range") ?? "-2,2", "uRange", lineNumber);
  const [v0, v1] = parseRangeOption(options.get("vRange") ?? options.get("range") ?? "-2,2", "vRange", lineNumber);
  const resolution = Math.max(1, Math.round(parseNumber(options.get("resolution") ?? "24", lineNumber)));
  const scale = parseNumber(options.get("scale") ?? "2", lineNumber);
  const sigma = parseNumber(options.get("sigma") ?? "0.4", lineNumber);
  const [muX, muY] = parsePointOption(options.get("mu") ?? "0,0", "mu", lineNumber);
  const [basisXX, basisXY] = parsePointOption(options.get("xBasis") ?? "63,31", "xBasis", lineNumber);
  const [basisYX, basisYY] = parsePointOption(options.get("yBasis") ?? "-60,30", "yBasis", lineNumber);
  const [basisZX, basisZY] = parsePointOption(options.get("zBasis") ?? "0,-130", "zBasis", lineNumber);
  const hasCameraProjection = options.has("phi") || options.has("theta") || options.has("gamma");
  const cameraOptions = {
    phi: parseNumber(options.get("phi") ?? "75", lineNumber),
    theta: parseNumber(options.get("theta") ?? "30", lineNumber),
    gamma: parseNumber(options.get("gamma") ?? "0", lineNumber),
    unitScale: parseNumber(options.get("unitScale") ?? "108.75", lineNumber),
    focalDistance: parseNumber(options.get("focalDistance") ?? "20", lineNumber),
    zoom: parseNumber(options.get("zoom") ?? "1", lineNumber),
  };
  const fillA = options.get("fillA") ?? "#FF862F";
  const fillB = options.get("fillB") ?? "#58C4DD";
  const stroke = options.get("stroke") ?? "#83C167";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "0.5", lineNumber);
  const fillOpacity = parseNumber(options.get("fillOpacity") ?? "0.5", lineNumber);
  const shade = parseBoolean(options.get("shade") ?? "false", lineNumber);
  const shadeStrength = parseNumber(options.get("shadeStrength") ?? "1", lineNumber);
  const [lightX, lightY, lightZ] = parseVector3Option(options.get("light") ?? "-7,-9,10", "light", lineNumber);
  const light = { x: lightX, y: lightY, z: lightZ };

  const gaussianHeightAndNormal = (u: number, v: number): { height: number; normal: { x: number; y: number; z: number } } => {
    const dx = u - muX;
    const dy = v - muY;
    const distanceSquared = dx ** 2 + dy ** 2;
    const height = Math.exp(-(distanceSquared / (2 * sigma ** 2)));
    const sigmaSquared = sigma ** 2 || 1;
    const dzdu = height * (-dx / sigmaSquared);
    const dzdv = height * (-dy / sigmaSquared);
    return {
      height,
      normal: normalize3d({ x: -dzdu, y: -dzdv, z: 1 }),
    };
  };

  const project = (u: number, v: number): { x: number; y: number; z: number; depth: number } => {
    const { height: z } = gaussianHeightAndNormal(u, v);
    const x = u * scale;
    const y = v * scale;
    const projectedZ = z * scale;
    if (hasCameraProjection) {
      const projected = projectManimCameraPoint({ x, y, z: projectedZ }, cameraOptions);
      return {
        x: projected.x,
        y: projected.y,
        z,
        depth: projected.z,
      };
    }
    return {
      x: x * basisXX + y * basisYX + projectedZ * basisZX,
      y: x * basisXY + y * basisYY + projectedZ * basisZY,
      z,
      depth: x + y - projectedZ,
    };
  };

  const faces: Array<{ row: number; col: number; height: number; shade: number; depth: number; points: Array<{ x: number; y: number }> }> = [];
  for (let row = 0; row < resolution; row += 1) {
    const va = v0 + (v1 - v0) * (row / resolution);
    const vb = v0 + (v1 - v0) * ((row + 1) / resolution);
    for (let col = 0; col < resolution; col += 1) {
      const ua = u0 + (u1 - u0) * (col / resolution);
      const ub = u0 + (u1 - u0) * ((col + 1) / resolution);
      const points = [project(ua, va), project(ub, va), project(ub, vb), project(ua, vb)];
      const midU = (ua + ub) / 2;
      const midV = (va + vb) / 2;
      const { height, normal } = gaussianHeightAndNormal(midU, midV);
      const point = { x: midU * scale, y: midV * scale, z: height * scale };
      const toLight = normalize3d({
        x: light.x - point.x,
        y: light.y - point.y,
        z: light.z - point.z,
      });
      const lightDot = normal.x * toLight.x + normal.y * toLight.y + normal.z * toLight.z;
      let lightAmount = 0.5 * lightDot ** 3;
      if (lightAmount < 0) lightAmount *= 0.5;
      faces.push({
        row,
        col,
        height: points.reduce((sum, point) => sum + point.z, 0) / points.length,
        shade: lightAmount * shadeStrength,
        depth: points.reduce((sum, point) => sum + point.depth, 0) / points.length,
        points,
      });
    }
  }
  faces.sort((left, right) => left.depth - right.depth);

  const group = createBaseNode(id, "group");
  group.transform.x = cx;
  group.transform.y = cy;
  group.geometry.gaussianSurface = true;
  group.geometry.uMin = u0;
  group.geometry.uMax = u1;
  group.geometry.vMin = v0;
  group.geometry.vMax = v1;
  group.geometry.resolution = resolution;
  group.geometry.sigma = sigma;
  group.geometry.mu = [muX, muY];
  group.geometry.scale = scale;
  group.geometry.xBasis = [basisXX, basisXY];
  group.geometry.yBasis = [basisYX, basisYY];
  group.geometry.zBasis = [basisZX, basisZY];
  group.geometry.shade = shade;
  group.geometry.light = [light.x, light.y, light.z];
  if (hasCameraProjection) {
    group.geometry.cameraProjection = "manim";
    group.geometry.phi = cameraOptions.phi;
    group.geometry.theta = cameraOptions.theta;
  }
  group.children = faces.map((face, index) => {
    const node = createBaseNode(`${id}:face:${index}`, "path");
    node.metadata = {
      surfaceFace: {
        row: face.row,
        col: face.col,
        depth: face.depth,
        height: face.height,
        shade: face.shade,
      },
    };
    node.geometry.d = face.points
      .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`)
      .concat("Z")
      .join(" ");
    const baseFill = (face.row + face.col) % 2 === 0 ? fillA : fillB;
    node.style.fill = shade ? shadeHexColorByDelta(baseFill, face.shade) : baseFill;
    node.style.fillOpacity = fillOpacity;
    node.style.stroke = stroke;
    node.style.strokeWidth = strokeWidth;
    return node;
  });

  for (const [key, value] of options) {
    if (
      [
        "at",
        "range",
        "uRange",
        "vRange",
        "resolution",
        "scale",
        "sigma",
        "mu",
        "xBasis",
        "yBasis",
        "zBasis",
        "fillA",
        "fillB",
        "stroke",
        "strokeWidth",
        "fillOpacity",
        "shade",
        "shadeStrength",
        "light",
        "phi",
        "theta",
        "gamma",
        "unitScale",
        "focalDistance",
        "zoom",
      ].includes(key)
    )
      continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseSphereSurface(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after sphereSurface.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const [cx, cy] = parsePointOption(options.get("at") ?? "0,0", "at", lineNumber);
  const [u0, u1] = parseRangeOption(options.get("uRange") ?? "-1.57079632679,1.57079632679", "uRange", lineNumber);
  const [v0, v1] = parseRangeOption(options.get("vRange") ?? "0,6.28318530718", "vRange", lineNumber);
  const [uResolution, vResolution] = parseResolutionOption(options.get("resolution") ?? "15,32", lineNumber);
  const radius = parseNumber(options.get("radius") ?? "104", lineNumber);
  const worldRadius = parseNumber(options.get("worldRadius") ?? "1", lineNumber);
  const hasProjectionBasis = options.has("xBasis") || options.has("yBasis") || options.has("zBasis");
  const hasCameraProjection = options.has("phi") || options.has("theta") || options.has("gamma");
  const cameraOptions = {
    phi: parseNumber(options.get("phi") ?? "75", lineNumber),
    theta: parseNumber(options.get("theta") ?? "30", lineNumber),
    gamma: parseNumber(options.get("gamma") ?? "0", lineNumber),
    unitScale: parseNumber(options.get("unitScale") ?? "108.75", lineNumber),
    focalDistance: parseNumber(options.get("focalDistance") ?? "20", lineNumber),
    zoom: parseNumber(options.get("zoom") ?? "1", lineNumber),
  };
  const [basisXX, basisXY] = parsePointOption(options.get("xBasis") ?? `${radius},0`, "xBasis", lineNumber);
  const [basisYX, basisYY] = parsePointOption(options.get("yBasis") ?? `0,${radius * 0.18}`, "yBasis", lineNumber);
  const [basisZX, basisZY] = parsePointOption(options.get("zBasis") ?? `0,${-radius}`, "zBasis", lineNumber);
  const fillA = options.get("fillA") ?? "#E65A4C";
  const fillB = options.get("fillB") ?? "#CF5044";
  const stroke = options.get("stroke") ?? "#BBBBBB";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "0.5", lineNumber);
  const fillOpacity = parseNumber(options.get("fillOpacity") ?? "1", lineNumber);
  const shade = parseBoolean(options.get("shade") ?? "true", lineNumber);
  const [lightX, lightY, lightZ] = parseVector3Option(options.get("light") ?? "0,0,-3", "light", lineNumber);
  const light = { x: lightX, y: lightY, z: lightZ };

  const project = (u: number, v: number): { x: number; y: number; z: number; depth: number } => {
    const cu = Math.cos(u);
    const x = cu * Math.cos(v);
    const y = cu * Math.sin(v);
    const z = Math.sin(u);
    if (hasCameraProjection) {
      const scaledX = x * worldRadius;
      const scaledY = y * worldRadius;
      const scaledZ = z * worldRadius;
      const projected = projectManimCameraPoint({ x: scaledX, y: scaledY, z: scaledZ }, cameraOptions);
      return {
        x: projected.x,
        y: projected.y,
        z,
        depth: projected.z,
      };
    }
    if (hasProjectionBasis) {
      const scaledX = x * worldRadius;
      const scaledY = y * worldRadius;
      const scaledZ = z * worldRadius;
      return {
        x: scaledX * basisXX + scaledY * basisYX + scaledZ * basisZX,
        y: scaledX * basisXY + scaledY * basisYY + scaledZ * basisZY,
        z,
        depth: 0.25 * scaledX + 0.35 * scaledY + scaledZ,
      };
    }
    return {
      x: radius * x,
      y: radius * (-z + 0.18 * y),
      z,
      depth: 0.25 * x + 0.35 * y + z,
    };
  };

  const faces: Array<{ row: number; col: number; shade: number; depth: number; points: Array<{ x: number; y: number }> }> = [];
  for (let row = 0; row < uResolution; row += 1) {
    const ua = u0 + (u1 - u0) * (row / uResolution);
    const ub = u0 + (u1 - u0) * ((row + 1) / uResolution);
    for (let col = 0; col < vResolution; col += 1) {
      const va = v0 + (v1 - v0) * (col / vResolution);
      const vb = v0 + (v1 - v0) * ((col + 1) / vResolution);
      const points3d = [project(ua, va), project(ub, va), project(ub, vb), project(ua, vb)];
      const midU = (ua + ub) / 2;
      const midV = (va + vb) / 2;
      const cm = Math.cos(midU);
      const normal = { x: cm * Math.cos(midV), y: cm * Math.sin(midV), z: Math.sin(midU) };
      const point = { x: normal.x * worldRadius, y: normal.y * worldRadius, z: normal.z * worldRadius };
      const toLight = normalize3d({
        x: light.x - point.x,
        y: light.y - point.y,
        z: light.z - point.z,
      });
      const lightDot = normal.x * toLight.x + normal.y * toLight.y + normal.z * toLight.z;
      let lightAmount = 0.5 * lightDot ** 3;
      if (lightAmount < 0) lightAmount *= 0.5;
      faces.push({
        row,
        col,
        shade: shade ? lightAmount : 0,
        depth: points3d.reduce((sum, point) => sum + point.depth, 0) / points3d.length,
        points: points3d,
      });
    }
  }
  faces.sort((left, right) => left.depth - right.depth);

  const group = createBaseNode(id, "group");
  group.transform.x = cx;
  group.transform.y = cy;
  group.geometry.sphereSurface = true;
  group.geometry.uMin = u0;
  group.geometry.uMax = u1;
  group.geometry.vMin = v0;
  group.geometry.vMax = v1;
  group.geometry.uResolution = uResolution;
  group.geometry.vResolution = vResolution;
  group.geometry.radius = radius;
  group.geometry.worldRadius = worldRadius;
  group.geometry.light = [light.x, light.y, light.z];
  if (hasProjectionBasis) {
    group.geometry.xBasis = [basisXX, basisXY];
    group.geometry.yBasis = [basisYX, basisYY];
    group.geometry.zBasis = [basisZX, basisZY];
  }
  if (hasCameraProjection) {
    group.geometry.cameraProjection = "manim";
    group.geometry.phi = cameraOptions.phi;
    group.geometry.theta = cameraOptions.theta;
  }
  group.children = faces.map((face, index) => {
    const node = createBaseNode(`${id}:face:${index}`, "path");
    node.metadata = {
      surfaceFace: {
        row: face.row,
        col: face.col,
        depth: face.depth,
        shade: face.shade,
      },
    };
    node.geometry.d = face.points
      .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`)
      .concat("Z")
      .join(" ");
    const baseFill = (face.row + face.col) % 2 === 0 ? fillA : fillB;
    node.style.fill = shade ? shadeHexColorByDelta(baseFill, face.shade) : baseFill;
    node.style.fillOpacity = fillOpacity;
    node.style.stroke = stroke;
    node.style.strokeWidth = strokeWidth;
    return node;
  });

  for (const [key, value] of options) {
    if (
      [
        "at",
        "uRange",
        "vRange",
        "resolution",
        "radius",
        "worldRadius",
        "xBasis",
        "yBasis",
        "zBasis",
        "fillA",
        "fillB",
        "stroke",
        "strokeWidth",
        "fillOpacity",
        "shade",
        "light",
        "phi",
        "theta",
        "gamma",
        "unitScale",
        "focalDistance",
        "zoom",
      ].includes(key)
    )
      continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseThreeDAxes(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after threeDAxes.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const [cx, cy] = parsePointOption(options.get("at") ?? "0,0", "at", lineNumber);
  const [xMin, xMax, xStep] = parseRange3Option(options.get("xRange") ?? "-6,6,1", "xRange", lineNumber);
  const [yMin, yMax, yStep] = parseRange3Option(options.get("yRange") ?? "-5,5,1", "yRange", lineNumber);
  const [zMin, zMax, zStep] = parseRange3Option(options.get("zRange") ?? "-4,4,1", "zRange", lineNumber);
  const [xBasisX, xBasisY] = parsePointOption(options.get("xBasis") ?? "43.333333,21.333333", "xBasis", lineNumber);
  const [yBasisX, yBasisY] = parsePointOption(options.get("yBasis") ?? "-47.6,23.6", "yBasis", lineNumber);
  const [zBasisX, zBasisY] = parsePointOption(options.get("zBasis") ?? "0,-60", "zBasis", lineNumber);
  const stroke = options.get("stroke") ?? "#FFFFFF";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "2", lineNumber);
  const tickSize = parseNumber(options.get("tickSize") ?? "10", lineNumber);
  const tickStrokeWidth = parseNumber(options.get("tickStrokeWidth") ?? "2", lineNumber);
  const includeTicks = parseBoolean(options.get("includeTicks") ?? "true", lineNumber);
  const includeTips = parseBoolean(options.get("includeTips") ?? "true", lineNumber);
  const tipLength = parseNumber(options.get("tipLength") ?? "18", lineNumber);
  const tipWidth = parseNumber(options.get("tipWidth") ?? "14", lineNumber);
  const xLength = parseNumber(options.get("xLength") ?? String(xMax - xMin), lineNumber);
  const yLength = parseNumber(options.get("yLength") ?? String(yMax - yMin), lineNumber);
  const zLength = parseNumber(options.get("zLength") ?? String(zMax - zMin), lineNumber);
  const hasCameraProjection = options.has("phi") || options.has("theta") || options.has("gamma");

  const children: SceneNode[] = [];
  if (hasCameraProjection) {
    const cameraOptions = {
      phi: parseNumber(options.get("phi") ?? "75", lineNumber),
      theta: parseNumber(options.get("theta") ?? "30", lineNumber),
      gamma: parseNumber(options.get("gamma") ?? "0", lineNumber),
      unitScale: parseNumber(options.get("unitScale") ?? "108.75", lineNumber),
      focalDistance: parseNumber(options.get("focalDistance") ?? "20", lineNumber),
      zoom: parseNumber(options.get("zoom") ?? "1", lineNumber),
    };
    addManimCameraProjectedAxis(children, id, "x", xMin, xMax, xStep, xLength, cameraOptions, {
      stroke,
      strokeWidth,
      tickSize,
      tickStrokeWidth,
      includeTicks,
      includeTips,
      tipLength,
      tipWidth,
    });
    addManimCameraProjectedAxis(children, id, "y", yMin, yMax, yStep, yLength, cameraOptions, {
      stroke,
      strokeWidth,
      tickSize,
      tickStrokeWidth,
      includeTicks,
      includeTips,
      tipLength,
      tipWidth,
    });
    addManimCameraProjectedAxis(children, id, "z", zMin, zMax, zStep, zLength, cameraOptions, {
      stroke,
      strokeWidth,
      tickSize,
      tickStrokeWidth,
      includeTicks,
      includeTips,
      tipLength,
      tipWidth,
    });
  } else {
    const basis = {
      x: { x: xBasisX, y: xBasisY, tick: { x: -xBasisY, y: xBasisX } },
      y: { x: yBasisX, y: yBasisY, tick: { x: -yBasisY, y: yBasisX } },
      z: { x: zBasisX, y: zBasisY, tick: { x: 1, y: 0 } },
    };

    addProjectedAxis(children, id, "x", xMin, xMax, xStep, basis.x, {
      stroke,
      strokeWidth,
      tickSize,
      tickStrokeWidth,
      includeTicks,
      includeTips,
      tipLength,
      tipWidth,
    });
    addProjectedAxis(children, id, "y", yMin, yMax, yStep, basis.y, {
      stroke,
      strokeWidth,
      tickSize,
      tickStrokeWidth,
      includeTicks,
      includeTips,
      tipLength,
      tipWidth,
    });
    addProjectedAxis(children, id, "z", zMin, zMax, zStep, basis.z, {
      stroke,
      strokeWidth,
      tickSize,
      tickStrokeWidth,
      includeTicks,
      includeTips,
      tipLength,
      tipWidth,
    });
  }

  const group = createBaseNode(id, "group");
  group.transform.x = cx;
  group.transform.y = cy;
  group.geometry.threeDAxes = true;
  group.geometry.xRange = [xMin, xMax, xStep];
  group.geometry.yRange = [yMin, yMax, yStep];
  group.geometry.zRange = [zMin, zMax, zStep];
  group.geometry.xLength = xLength;
  group.geometry.yLength = yLength;
  group.geometry.zLength = zLength;
  if (hasCameraProjection) {
    group.geometry.cameraProjection = "manim";
    group.geometry.phi = parseNumber(options.get("phi") ?? "75", lineNumber);
    group.geometry.theta = parseNumber(options.get("theta") ?? "30", lineNumber);
  }
  group.children = children;

  for (const [key, value] of options) {
    if (
      [
        "at",
        "xRange",
        "yRange",
        "zRange",
        "xBasis",
        "yBasis",
        "zBasis",
        "stroke",
        "strokeWidth",
        "tickSize",
        "tickStrokeWidth",
        "includeTicks",
        "includeTips",
        "tipLength",
        "tipWidth",
        "xLength",
        "yLength",
        "zLength",
        "phi",
        "theta",
        "gamma",
        "unitScale",
        "focalDistance",
        "zoom",
      ].includes(key)
    )
      continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

function parseProjectedCircle(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after projectedCircle.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const [cx, cy] = parsePointOption(options.get("at") ?? "0,0", "at", lineNumber);
  const radius = parseNumber(options.get("radius") ?? "1", lineNumber);
  const [xBasisX, xBasisY] = parsePointOption(options.get("xBasis") ?? "-56.75,25.5", "xBasis", lineNumber);
  const [yBasisX, yBasisY] = parsePointOption(options.get("yBasis") ?? "87.75,13.25", "yBasis", lineNumber);
  const hasCameraProjection = options.has("phi") || options.has("theta") || options.has("gamma");

  const path = createBaseNode(id, "path");
  path.transform.x = cx;
  path.transform.y = cy;
  path.geometry.d = hasCameraProjection
    ? manimCameraProjectedCirclePath(radius, {
        phi: parseNumber(options.get("phi") ?? "75", lineNumber),
        theta: parseNumber(options.get("theta") ?? "30", lineNumber),
        gamma: parseNumber(options.get("gamma") ?? "0", lineNumber),
        unitScale: parseNumber(options.get("unitScale") ?? "108.75", lineNumber),
        focalDistance: parseNumber(options.get("focalDistance") ?? "20", lineNumber),
        zoom: parseNumber(options.get("zoom") ?? "1", lineNumber),
        samples: parseNumber(options.get("samples") ?? "64", lineNumber),
      })
    : projectedCirclePath(
        radius,
        { x: xBasisX, y: xBasisY },
        { x: yBasisX, y: yBasisY },
      );
  path.geometry.projectedCircle = true;
  path.geometry.radius = radius;
  if (hasCameraProjection) {
    path.geometry.cameraProjection = "manim";
    path.geometry.phi = parseNumber(options.get("phi") ?? "75", lineNumber);
    path.geometry.theta = parseNumber(options.get("theta") ?? "30", lineNumber);
  }
  path.style.fill = options.get("fill") ?? "none";
  path.style.stroke = options.get("stroke") ?? "#FFFFFF";
  path.style.strokeWidth = parseNumber(options.get("strokeWidth") ?? "4", lineNumber);

  for (const [key, value] of options) {
    if (
      [
        "at",
        "radius",
        "xBasis",
        "yBasis",
        "phi",
        "theta",
        "gamma",
        "unitScale",
        "focalDistance",
        "zoom",
        "samples",
        "fill",
        "stroke",
        "strokeWidth",
      ].includes(key)
    )
      continue;
    applyNodeOption(path, key, value, lineNumber);
  }

  state.nodes.set(id, path);
  state.rootIds.add(id);
}

function manimCameraProjectedCirclePath(
  radius: number,
  options: {
    phi: number;
    theta: number;
    gamma: number;
    unitScale: number;
    focalDistance: number;
    zoom: number;
    samples: number;
  },
): string {
  const sampleCount = Math.max(8, Math.round(options.samples));
  const points: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const alpha = (Math.PI * 2 * index) / sampleCount;
    const point = projectManimCameraPoint(
      {
        x: Math.cos(alpha) * radius,
        y: Math.sin(alpha) * radius,
        z: 0,
      },
      options,
    );
    points.push({
      x: Number(formatPathNumber(point.x)),
      y: Number(formatPathNumber(point.y)),
    });
  }
  return pointsToSvgPath(points, { close: true, smooth: true });
}

function projectManimCameraPoint(
  point: { x: number; y: number; z: number },
  options: { phi: number; theta: number; gamma: number; unitScale: number; focalDistance: number; zoom: number },
): { x: number; y: number; z: number } {
  const phi = (options.phi * Math.PI) / 180;
  const theta = (options.theta * Math.PI) / 180;
  const gamma = (options.gamma * Math.PI) / 180;
  const rotZ = (angle: number): number[][] => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, -s, 0],
      [s, c, 0],
      [0, 0, 1],
    ];
  };
  const rotX = (angle: number): number[][] => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c],
    ];
  };
  const multiply = (left: number[][], right: number[][]): number[][] => {
    const result: number[][] = [];
    for (let row = 0; row < 3; row += 1) {
      const rowResult: number[] = [];
      for (let col = 0; col < 3; col += 1) {
        rowResult[col] =
          (left[row]?.[0] ?? 0) * (right[0]?.[col] ?? 0) +
          (left[row]?.[1] ?? 0) * (right[1]?.[col] ?? 0) +
          (left[row]?.[2] ?? 0) * (right[2]?.[col] ?? 0);
      }
      result[row] = rowResult;
    }
    return result;
  };
  let matrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (const rotation of [rotZ(-theta - Math.PI / 2), rotX(-phi), rotZ(gamma)]) {
    matrix = multiply(rotation, matrix);
  }
  const rotatedX = (matrix[0]?.[0] ?? 0) * point.x + (matrix[0]?.[1] ?? 0) * point.y + (matrix[0]?.[2] ?? 0) * point.z;
  const rotatedY = (matrix[1]?.[0] ?? 0) * point.x + (matrix[1]?.[1] ?? 0) * point.y + (matrix[1]?.[2] ?? 0) * point.z;
  const rotatedZ = (matrix[2]?.[0] ?? 0) * point.x + (matrix[2]?.[1] ?? 0) * point.y + (matrix[2]?.[2] ?? 0) * point.z;
  const factor = (options.focalDistance / (options.focalDistance - rotatedZ)) * options.zoom * options.unitScale;
  return { x: rotatedX * factor, y: -rotatedY * factor, z: rotatedZ };
}

function projectedCirclePath(
  radius: number,
  xBasis: { x: number; y: number },
  yBasis: { x: number; y: number },
): string {
  const kappa = 0.5522847498307936;
  const p = (x: number, y: number): string =>
    `${formatPathNumber(radius * (x * xBasis.x + y * yBasis.x))} ${formatPathNumber(radius * (x * xBasis.y + y * yBasis.y))}`;
  return [
    `M ${p(1, 0)}`,
    `C ${p(1, kappa)} ${p(kappa, 1)} ${p(0, 1)}`,
    `C ${p(-kappa, 1)} ${p(-1, kappa)} ${p(-1, 0)}`,
    `C ${p(-1, -kappa)} ${p(-kappa, -1)} ${p(0, -1)}`,
    `C ${p(kappa, -1)} ${p(1, -kappa)} ${p(1, 0)}`,
    "Z",
  ].join(" ");
}

function parseDataPointList(raw: string, lineNumber: number, minPoints = 3): Array<[number, number]> {
  const points = raw.split(";").map((point) => {
    const [xRaw, yRaw] = point.split(",");
    if (xRaw === undefined || yRaw === undefined)
      throw new DslCompileError("Expected data points as x,y;x,y;...", lineNumber);
    return [parseNumber(xRaw, lineNumber), parseNumber(yRaw, lineNumber)] as [number, number];
  });
  if (points.length < minPoints)
    throw new DslCompileError(`Expected at least ${minPoints} data points.`, lineNumber);
  return points;
}

function parseNumberListOption(raw: string | undefined, lineNumber: number): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .filter((value) => value.length > 0)
    .map((value) => parseNumber(value, lineNumber));
}

function uniqueAxisValues(values: number[]): number[] {
  const byId = new Map<string, number>();
  for (const value of values) byId.set(formatAxisValueId(value), value);
  return [...byId.values()];
}

function steppedValues(min: number, max: number, step: number): number[] {
  const delta = Math.abs(step) > 1e-9 ? Math.abs(step) : 1;
  const values: number[] = [];
  const start = Math.ceil(min / delta) * delta;
  for (let value = start; value <= max + 1e-9; value += delta) values.push(Number(value.toFixed(8)));
  return values;
}

function requireAxesNode(
  state: CompileState,
  axesId: string,
  lineNumber: number,
  caller: string,
): SceneNode {
  const axes = requireNode(state, axesId, lineNumber);
  if (axes.type !== "group" || axes.geometry.xMin === undefined || axes.geometry.yMin === undefined)
    throw new DslCompileError(`${caller} axes '${axesId}' is not an axes helper.`, lineNumber);
  return axes;
}

function axesGeometry(axes: SceneNode): { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number } {
  return {
    xMin: Number(axes.geometry.xMin),
    xMax: Number(axes.geometry.xMax),
    yMin: Number(axes.geometry.yMin),
    yMax: Number(axes.geometry.yMax),
    width: Number(axes.geometry.width),
    height: Number(axes.geometry.height),
  };
}

function parseDataCoordExpressionOption(
  raw: string | undefined,
  optionName: string,
  state: CompileState,
  lineNumber: number,
): { x: string; y: string } {
  if (!raw) throw new DslCompileError(`Expected ${optionName}=x,y.`, lineNumber);
  const commaIndex = raw.indexOf(",");
  if (commaIndex === -1) throw new DslCompileError(`Expected ${optionName}=x,y.`, lineNumber);
  const x = raw.slice(0, commaIndex);
  const y = raw.slice(commaIndex + 1);
  validateDslExpression(x, state, lineNumber);
  validateDslExpression(y, state, lineNumber);
  return { x, y };
}

function axesDataExpression(
  axis: "x" | "y",
  valueExpression: string,
  axes: { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number },
  centerX: number,
  centerY: number,
): string {
  if (axis === "x") {
    return `${formatPathNumber(centerX)}+(((${valueExpression})-${formatPathNumber(axes.xMin)})/${formatPathNumber(axes.xMax - axes.xMin)}-0.5)*${formatPathNumber(axes.width)}`;
  }
  return `${formatPathNumber(centerY)}-(((${valueExpression})-${formatPathNumber(axes.yMin)})/${formatPathNumber(axes.yMax - axes.yMin)}-0.5)*${formatPathNumber(axes.height)}`;
}

function axesDataToPoint(
  point: { x: number; y: number },
  axes: { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number },
): { x: number; y: number } {
  return {
    x: ((point.x - axes.xMin) / (axes.xMax - axes.xMin) - 0.5) * axes.width,
    y: -((point.y - axes.yMin) / (axes.yMax - axes.yMin) - 0.5) * axes.height,
  };
}

function axesDataToScenePoint(
  point: { x: number; y: number },
  axes: { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number },
  centerX: number,
  centerY: number,
): { x: number; y: number } {
  const local = axesDataToPoint(point, axes);
  return { x: centerX + local.x, y: centerY + local.y };
}

function parseRangeOption(raw: string | undefined, optionName: string, lineNumber: number): [number, number] {
  if (!raw) throw new DslCompileError(`Expected ${optionName}=min,max.`, lineNumber);
  const [min, max] = raw.split(",").map((value) => parseNumber(value, lineNumber));
  if (min === undefined || max === undefined || Number.isNaN(min) || Number.isNaN(max))
    throw new DslCompileError(`Expected ${optionName}=min,max.`, lineNumber);
  return [min, max];
}

function parseRange3Option(raw: string | undefined, optionName: string, lineNumber: number): [number, number, number] {
  if (!raw) throw new DslCompileError(`Expected ${optionName}=min,max,step.`, lineNumber);
  const [min, max, step] = raw.split(",").map((value) => parseNumber(value, lineNumber));
  if (
    min === undefined ||
    max === undefined ||
    step === undefined ||
    Number.isNaN(min) ||
    Number.isNaN(max) ||
    Number.isNaN(step) ||
    step === 0
  )
    throw new DslCompileError(`Expected ${optionName}=min,max,step with nonzero step.`, lineNumber);
  return [min, max, step];
}

function sampleDataFunctionPoints(
  expression: string,
  x0: number,
  x1: number,
  samples: number,
  state: CompileState,
  lineNumber: number,
  axes: { xMin: number; xMax: number; yMin: number; yMax: number; width: number; height: number },
  centerX: number,
  centerY: number,
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < samples; index++) {
    const u = samples === 1 ? 0 : index / (samples - 1);
    const t = x0 + (x1 - x0) * u;
    points.push(axesDataToScenePoint({ x: t, y: evaluateGraphExpression(expression, t, state, lineNumber) }, axes, centerX, centerY));
  }
  return points;
}

function validateGraphExpression(expression: string, state: CompileState, lineNumber: number): void {
  try {
    validateExpression(expression, [...state.values.keys(), "t"]);
  } catch (error) {
    if (error instanceof ExpressionError)
      throw new DslCompileError(
        `Invalid expression: ${error.message}`,
        lineNumber,
      );
    throw error;
  }
}

function evaluateGraphExpression(
  expression: string,
  t: number,
  state: CompileState,
  lineNumber: number,
): number {
  try {
    return evaluateExpression(expression, { ...Object.fromEntries(state.values), t });
  } catch (error) {
    if (error instanceof ExpressionError)
      throw new DslCompileError(
        `Invalid expression: ${error.message}`,
        lineNumber,
      );
    throw error;
  }
}

function formatPathNumber(value: number): string {
  return String(Number(value.toFixed(6)));
}

function formatAxisValueId(value: number): string {
  if (Object.is(value, -0) || value === 0) return "0";
  return String(Number(value.toFixed(6))).replace("-", "m").replace(/\./g, "p");
}

function formatAxisNumber(value: number): string {
  return String(Number(value.toFixed(6)));
}

function parseRotatingLine(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after rotatingLine.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const x1 = parseNumber(options.get("x1") ?? "-120", lineNumber);
  const y1 = parseNumber(options.get("y1") ?? "0", lineNumber);
  const x2 = parseNumber(options.get("x2") ?? "120", lineNumber);
  const y2 = parseNumber(options.get("y2") ?? "0", lineNumber);
  const [aboutX, aboutY] = parsePointOption(options.get("about") ?? `${x1},${y1}`, "about", lineNumber);
  const angle = options.get("angle") ?? "0";
  validateDslExpression(angle, state, lineNumber);

  const endpointExpressions = {
    x1: rotatedPointExpression("x", x1, y1, aboutX, aboutY, angle),
    y1: rotatedPointExpression("y", x1, y1, aboutX, aboutY, angle),
    x2: rotatedPointExpression("x", x2, y2, aboutX, aboutY, angle),
    y2: rotatedPointExpression("y", x2, y2, aboutX, aboutY, angle),
  };

  const node = createBaseNode(id, "line");
  node.geometry.x1 = evaluateDslExpression(endpointExpressions.x1, state, lineNumber);
  node.geometry.y1 = evaluateDslExpression(endpointExpressions.y1, state, lineNumber);
  node.geometry.x2 = evaluateDslExpression(endpointExpressions.x2, state, lineNumber);
  node.geometry.y2 = evaluateDslExpression(endpointExpressions.y2, state, lineNumber);
  node.geometry.rotationAboutX = aboutX;
  node.geometry.rotationAboutY = aboutY;
  node.geometry.rotationAngle = angle;
  node.style.stroke = "#ffffff";
  node.style.strokeWidth = 4;
  for (const [key, value] of options) {
    if (["x1", "y1", "x2", "y2", "about", "angle"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  for (const [property, expression] of Object.entries(endpointExpressions)) {
    pushBindExpr(state, id, propertyPath(property), expression, statementTime(state));
  }
}

function parseRotateUpdater(tokens: string[], state: CompileState, lineNumber: number, fallbackStart: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after rotateUpdater.", lineNumber);
  const node = state.nodes.get(id);
  if (!node) throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const rate = parseNumber(options.get("rate") ?? "1", lineNumber);
  const duration = parseSeconds(options.get("duration") ?? "1s", lineNumber);
  const easing = parseEasing(options.get("easing") ?? "linear", lineNumber);
  const start = options.get("start") ? parseSeconds(options.get("start")!, lineNumber) : fallbackStart;
  const from = options.get("from")
    ? parseNumber(options.get("from")!, lineNumber)
    : Number(node.transform.rotation ?? 0);
  const to = from + rate * duration * (180 / Math.PI);

  for (const key of options.keys()) {
    if (["rate", "duration", "easing", "start", "from"].includes(key)) continue;
    throw new DslCompileError(`Unknown rotateUpdater option '${key}'.`, lineNumber);
  }

  state.timeline.push({
    t: start,
    op: "animate",
    id,
    path: propertyPath("rotation"),
    from,
    to,
    duration,
    easing,
  });
  node.transform.rotation = to;
  if (!options.has("start")) advanceStatementTime(state, duration);
}

function parsePointOption(raw: string, optionName: string, lineNumber: number): [number, number] {
  const [x, y] = raw.split(",").map((value) => parseNumber(value, lineNumber));
  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y))
    throw new DslCompileError(`Expected ${optionName}=x,y.`, lineNumber);
  return [x, y];
}

function parseVector3Option(raw: string, optionName: string, lineNumber: number): [number, number, number] {
  const [x, y, z] = raw.split(",").map((value) => parseNumber(value, lineNumber));
  if (x === undefined || y === undefined || z === undefined || Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z))
    throw new DslCompileError(`Expected ${optionName}=x,y,z.`, lineNumber);
  return [x, y, z];
}

function parseResolutionOption(raw: string, lineNumber: number): [number, number] {
  const parts = raw.split(",");
  const first = Math.max(1, Math.round(parseNumber(parts[0], lineNumber)));
  const second = Math.max(1, Math.round(parseNumber(parts[1] ?? parts[0], lineNumber)));
  return [first, second];
}

function addProjectedAxis(
  children: SceneNode[],
  groupId: string,
  axis: "x" | "y" | "z",
  min: number,
  max: number,
  step: number,
  basis: { x: number; y: number; tick: { x: number; y: number } },
  style: {
    stroke: string;
    strokeWidth: number;
    tickSize: number;
    tickStrokeWidth: number;
    includeTicks: boolean;
    includeTips: boolean;
    tipLength: number;
    tipWidth: number;
  },
): void {
  const line = createBaseNode(`${groupId}:${axis}:axis`, "line");
  line.geometry.x1 = min * basis.x;
  line.geometry.y1 = min * basis.y;
  line.geometry.x2 = max * basis.x;
  line.geometry.y2 = max * basis.y;
  line.style.stroke = style.stroke;
  line.style.strokeWidth = style.strokeWidth;
  children.push(line);

  if (style.includeTicks) {
    const tickNormal = normalize2d(basis.tick);
    for (const value of rangeTickValues(min, max, step)) {
      if (Math.abs(value) < 1e-9) continue;
      const tick = createBaseNode(`${groupId}:${axis}:tick:${formatAxisValueId(value)}`, "line");
      const x = value * basis.x;
      const y = value * basis.y;
      tick.geometry.x1 = x - tickNormal.x * style.tickSize;
      tick.geometry.y1 = y - tickNormal.y * style.tickSize;
      tick.geometry.x2 = x + tickNormal.x * style.tickSize;
      tick.geometry.y2 = y + tickNormal.y * style.tickSize;
      tick.style.stroke = style.stroke;
      tick.style.strokeWidth = style.tickStrokeWidth;
      children.push(tick);
    }
  }

  if (style.includeTips) {
    const direction = normalize2d({ x: basis.x, y: basis.y });
    const tip = createBaseNode(`${groupId}:${axis}:tip`, "path");
    const tipPoint = { x: max * basis.x, y: max * basis.y };
    const base = {
      x: tipPoint.x - direction.x * style.tipLength,
      y: tipPoint.y - direction.y * style.tipLength,
    };
    const normal = { x: -direction.y, y: direction.x };
    tip.geometry.d = [
      `M ${formatPathNumber(tipPoint.x)} ${formatPathNumber(tipPoint.y)}`,
      `L ${formatPathNumber(base.x + normal.x * style.tipWidth / 2)} ${formatPathNumber(base.y + normal.y * style.tipWidth / 2)}`,
      `L ${formatPathNumber(base.x - normal.x * style.tipWidth / 2)} ${formatPathNumber(base.y - normal.y * style.tipWidth / 2)}`,
      "Z",
    ].join(" ");
    tip.style.fill = style.stroke;
    tip.style.stroke = style.stroke;
    tip.style.strokeWidth = 0;
    children.push(tip);
  }
}

function addManimCameraProjectedAxis(
  children: SceneNode[],
  groupId: string,
  axis: "x" | "y" | "z",
  min: number,
  max: number,
  step: number,
  length: number,
  cameraOptions: { phi: number; theta: number; gamma: number; unitScale: number; focalDistance: number; zoom: number },
  style: {
    stroke: string;
    strokeWidth: number;
    tickSize: number;
    tickStrokeWidth: number;
    includeTicks: boolean;
    includeTips: boolean;
    tipLength: number;
    tipWidth: number;
  },
): void {
  const axisPoint = (value: number): number => {
    if (Math.abs(max - min) < 1e-9) return 0;
    return ((value - min) / (max - min) - 0.5) * length;
  };
  const pointAt = (value: number): { x: number; y: number } => {
    const coordinate = axisPoint(value);
    if (axis === "x") return projectManimCameraPoint({ x: coordinate, y: 0, z: 0 }, cameraOptions);
    if (axis === "y") return projectManimCameraPoint({ x: 0, y: coordinate, z: 0 }, cameraOptions);
    return projectManimCameraPoint({ x: 0, y: 0, z: coordinate }, cameraOptions);
  };
  const tangentAt = (value: number): { x: number; y: number } => {
    const delta = Math.max(Math.abs(step || 1) * 0.001, 0.001);
    const before = pointAt(value - delta);
    const after = pointAt(value + delta);
    return normalize2d({ x: after.x - before.x, y: after.y - before.y });
  };

  const line = createBaseNode(`${groupId}:${axis}:axis`, "line");
  const start = pointAt(min);
  const end = pointAt(max);
  line.geometry.x1 = start.x;
  line.geometry.y1 = start.y;
  line.geometry.x2 = end.x;
  line.geometry.y2 = end.y;
  line.style.stroke = style.stroke;
  line.style.strokeWidth = style.strokeWidth;
  children.push(line);

  if (style.includeTicks) {
    for (const value of rangeTickValues(min, max, step)) {
      if (Math.abs(value) < 1e-9) continue;
      const tick = createBaseNode(`${groupId}:${axis}:tick:${formatAxisValueId(value)}`, "line");
      const point = pointAt(value);
      const tangent = tangentAt(value);
      const normal = axis === "z" ? { x: 1, y: 0 } : { x: -tangent.y, y: tangent.x };
      tick.geometry.x1 = point.x - normal.x * style.tickSize;
      tick.geometry.y1 = point.y - normal.y * style.tickSize;
      tick.geometry.x2 = point.x + normal.x * style.tickSize;
      tick.geometry.y2 = point.y + normal.y * style.tickSize;
      tick.style.stroke = style.stroke;
      tick.style.strokeWidth = style.tickStrokeWidth;
      children.push(tick);
    }
  }

  if (style.includeTips) {
    const direction = tangentAt(max);
    const tip = createBaseNode(`${groupId}:${axis}:tip`, "path");
    const tipPoint = pointAt(max);
    const base = {
      x: tipPoint.x - direction.x * style.tipLength,
      y: tipPoint.y - direction.y * style.tipLength,
    };
    const normal = { x: -direction.y, y: direction.x };
    tip.geometry.d = [
      `M ${formatPathNumber(tipPoint.x)} ${formatPathNumber(tipPoint.y)}`,
      `L ${formatPathNumber(base.x + normal.x * style.tipWidth / 2)} ${formatPathNumber(base.y + normal.y * style.tipWidth / 2)}`,
      `L ${formatPathNumber(base.x - normal.x * style.tipWidth / 2)} ${formatPathNumber(base.y - normal.y * style.tipWidth / 2)}`,
      "Z",
    ].join(" ");
    tip.style.fill = style.stroke;
    tip.style.stroke = style.stroke;
    tip.style.strokeWidth = 0;
    children.push(tip);
  }
}

function rangeTickValues(min: number, max: number, step: number): number[] {
  const values: number[] = [];
  if (step > 0) {
    for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) {
      values.push(Number(value.toFixed(8)));
    }
  } else {
    for (let value = Math.floor(max / step) * step; value >= min - 1e-9; value += step) {
      values.push(Number(value.toFixed(8)));
    }
  }
  return values;
}

function normalize2d(vector: { x: number; y: number }): { x: number; y: number } {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function normalize3d(vector: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

function shadeHexColorByDelta(hex: string, delta: number): string {
  const match = /^#?([0-9a-f]{6})$/iu.exec(hex);
  if (!match) return hex;
  const value = match[1]!;
  const rgb = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  return `#${rgb
    .map((component) => {
      const shaded = Math.round(Math.max(0, Math.min(255, component + delta * 255)));
      return shaded.toString(16).padStart(2, "0");
    })
    .join("")}`;
}

function rotatedPointExpression(
  axis: "x" | "y",
  x: number,
  y: number,
  aboutX: number,
  aboutY: number,
  angle: string,
): string {
  const dx = formatPathNumber(x - aboutX);
  const dy = formatPathNumber(y - aboutY);
  if (axis === "x")
    return `${formatPathNumber(aboutX)}+(${dx})*cos(${angle})-(${dy})*sin(${angle})`;
  return `${formatPathNumber(aboutY)}+(${dx})*sin(${angle})+(${dy})*cos(${angle})`;
}

function parseArrow(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after arrow.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const x1 = parseNumber(options.get("x1") ?? "0", lineNumber);
  const y1 = parseNumber(options.get("y1") ?? "0", lineNumber);
  const x2 = parseNumber(options.get("x2") ?? "100", lineNumber);
  const y2 = parseNumber(options.get("y2") ?? "0", lineNumber);
  const stroke = options.get("stroke") ?? "#FFFFFF";
  const fill = options.get("fill") ?? stroke;
  const requestedStrokeWidth = parseNumber(options.get("strokeWidth") ?? "6", lineNumber);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const buff = Math.max(0, parseNumber(options.get("buff") ?? "0", lineNumber));
  const maxTipRatio = parseNumber(options.get("maxTipLengthToLengthRatio") ?? "0.25", lineNumber);
  const maxStrokeRatio = parseNumber(options.get("maxStrokeWidthToLengthRatio") ?? "5", lineNumber);
  const drawableLength = Math.max(1, length - buff * 2);
  const startX = x1 + ux * buff;
  const startY = y1 + uy * buff;
  const endX = x2 - ux * buff;
  const endY = y2 - uy * buff;
  const requestedTipLength = parseNumber(options.get("tipLength") ?? "23.625", lineNumber);
  const tipLength = Math.max(0, Math.min(requestedTipLength, drawableLength * maxTipRatio));
  const tipWidth = parseNumber(options.get("tipWidth") ?? String(tipLength), lineNumber);
  const tipShape = parseArrowTipShape(options.get("tipShape") ?? options.get("tip_shape") ?? "triangleFilled", lineNumber);
  const strokeWidth = Math.max(0, Math.min(requestedStrokeWidth, drawableLength * maxStrokeRatio));
  const px = -uy;
  const py = ux;
  const baseX = endX - ux * tipLength;
  const baseY = endY - uy * tipLength;

  const shaft = createBaseNode(`${id}:shaft`, "line");
  shaft.geometry.x1 = startX;
  shaft.geometry.y1 = startY;
  shaft.geometry.x2 = baseX;
  shaft.geometry.y2 = baseY;
  shaft.style.fill = "none";
  shaft.style.stroke = stroke;
  shaft.style.strokeWidth = strokeWidth;

  const tip = createBaseNode(`${id}:tip`, "path");
  tip.geometry.d = buildArrowTipPath({
    endX,
    endY,
    baseX,
    baseY,
    ux,
    uy,
    px,
    py,
    tipLength,
    tipWidth,
    tipShape,
  });
  tip.style.fill = isFilledArrowTipShape(tipShape) ? fill : "none";
  tip.style.stroke = fill;
  tip.style.strokeWidth = isFilledArrowTipShape(tipShape) ? 0 : 3;

  const group = createBaseNode(id, "group");
  group.children = [shaft, tip];
  group.geometry.arrow = true;
  group.geometry.x1 = x1;
  group.geometry.y1 = y1;
  group.geometry.x2 = x2;
  group.geometry.y2 = y2;
  group.geometry.buff = buff;
  group.geometry.tipLength = tipLength;
  group.geometry.tipWidth = tipWidth;
  group.geometry.tipShape = tipShape;
  group.geometry.maxTipLengthToLengthRatio = maxTipRatio;
  group.geometry.maxStrokeWidthToLengthRatio = maxStrokeRatio;
  for (const [key, value] of options) {
    if (
      [
        "x1",
        "y1",
        "x2",
        "y2",
        "buff",
        "tipLength",
        "tipWidth",
        "tipShape",
        "tip_shape",
        "maxTipLengthToLengthRatio",
        "maxStrokeWidthToLengthRatio",
        "stroke",
        "fill",
        "strokeWidth",
      ].includes(key)
    )
      continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
}

type ArrowTipShape = "triangle" | "triangleFilled" | "square" | "squareFilled" | "circle" | "circleFilled" | "stealth";

function parseArrowTipShape(value: string, lineNumber: number): ArrowTipShape {
  const normalized = value.replace(/[^a-z]/giu, "").toLowerCase();
  const shapes: Record<string, ArrowTipShape> = {
    arrowtriangletip: "triangle",
    triangle: "triangle",
    triangletip: "triangle",
    arrowtrianglefilledtip: "triangleFilled",
    default: "triangleFilled",
    filledtriangle: "triangleFilled",
    trianglefilled: "triangleFilled",
    arrowtip: "triangleFilled",
    arrowsquaretip: "square",
    square: "square",
    squaretip: "square",
    arrowsquarefilledtip: "squareFilled",
    filledsquare: "squareFilled",
    squarefilled: "squareFilled",
    arrowcircletip: "circle",
    circle: "circle",
    circletip: "circle",
    arrowcirclefilledtip: "circleFilled",
    circlefilled: "circleFilled",
    filledcircle: "circleFilled",
    stealth: "stealth",
    stealthtip: "stealth",
  };
  const shape = shapes[normalized];
  if (!shape) {
    throw new DslCompileError(
      "Expected tipShape to be one of triangle, triangleFilled, square, squareFilled, circle, circleFilled, stealth, or the matching Manim Arrow*Tip class name.",
      lineNumber,
    );
  }
  return shape;
}

function isFilledArrowTipShape(shape: ArrowTipShape): boolean {
  return shape === "triangleFilled" || shape === "squareFilled" || shape === "circleFilled" || shape === "stealth";
}

function buildArrowTipPath({
  endX,
  endY,
  baseX,
  baseY,
  ux,
  uy,
  px,
  py,
  tipLength,
  tipWidth,
  tipShape,
}: {
  endX: number;
  endY: number;
  baseX: number;
  baseY: number;
  ux: number;
  uy: number;
  px: number;
  py: number;
  tipLength: number;
  tipWidth: number;
  tipShape: ArrowTipShape;
}): string {
  if (tipShape === "circle" || tipShape === "circleFilled") {
    return buildArrowCircleTipPath(endX, endY, baseX, baseY, ux, uy, px, py, tipLength / 2, tipWidth / 2);
  }
  if (tipShape === "square" || tipShape === "squareFilled") {
    return [
      `M ${formatPathNumber(endX + px * tipWidth / 2)} ${formatPathNumber(endY + py * tipWidth / 2)}`,
      `L ${formatPathNumber(baseX + px * tipWidth / 2)} ${formatPathNumber(baseY + py * tipWidth / 2)}`,
      `L ${formatPathNumber(baseX - px * tipWidth / 2)} ${formatPathNumber(baseY - py * tipWidth / 2)}`,
      `L ${formatPathNumber(endX - px * tipWidth / 2)} ${formatPathNumber(endY - py * tipWidth / 2)}`,
      "Z",
    ].join(" ");
  }
  if (tipShape === "stealth") {
    const frontLength = tipLength / 1.6;
    const wingBack = tipLength * 1.2 / 3.2;
    const wingHalfWidth = tipWidth / 2;
    const baseCenterX = endX - ux * frontLength;
    const baseCenterY = endY - uy * frontLength;
    return [
      `M ${formatPathNumber(endX)} ${formatPathNumber(endY)}`,
      `L ${formatPathNumber(baseCenterX - ux * wingBack + px * wingHalfWidth)} ${formatPathNumber(baseCenterY - uy * wingBack + py * wingHalfWidth)}`,
      `L ${formatPathNumber(baseCenterX)} ${formatPathNumber(baseCenterY)}`,
      `L ${formatPathNumber(baseCenterX - ux * wingBack - px * wingHalfWidth)} ${formatPathNumber(baseCenterY - uy * wingBack - py * wingHalfWidth)}`,
      "Z",
    ].join(" ");
  }
  return [
    `M ${formatPathNumber(endX)} ${formatPathNumber(endY)}`,
    `L ${formatPathNumber(baseX + px * tipWidth / 2)} ${formatPathNumber(baseY + py * tipWidth / 2)}`,
    `L ${formatPathNumber(baseX - px * tipWidth / 2)} ${formatPathNumber(baseY - py * tipWidth / 2)}`,
    "Z",
  ].join(" ");
}

function buildArrowCircleTipPath(
  endX: number,
  endY: number,
  baseX: number,
  baseY: number,
  ux: number,
  uy: number,
  px: number,
  py: number,
  rx: number,
  ry: number,
): string {
  const k = 0.5522847498307936;
  const cx = (endX + baseX) / 2;
  const cy = (endY + baseY) / 2;
  const front = { x: cx + ux * rx, y: cy + uy * rx };
  const top = { x: cx + px * ry, y: cy + py * ry };
  const back = { x: cx - ux * rx, y: cy - uy * rx };
  const bottom = { x: cx - px * ry, y: cy - py * ry };
  return [
    `M ${formatPathNumber(front.x)} ${formatPathNumber(front.y)}`,
    `C ${formatPathNumber(front.x + px * k * ry)} ${formatPathNumber(front.y + py * k * ry)} ${formatPathNumber(top.x + ux * k * rx)} ${formatPathNumber(top.y + uy * k * rx)} ${formatPathNumber(top.x)} ${formatPathNumber(top.y)}`,
    `C ${formatPathNumber(top.x - ux * k * rx)} ${formatPathNumber(top.y - uy * k * rx)} ${formatPathNumber(back.x + px * k * ry)} ${formatPathNumber(back.y + py * k * ry)} ${formatPathNumber(back.x)} ${formatPathNumber(back.y)}`,
    `C ${formatPathNumber(back.x - px * k * ry)} ${formatPathNumber(back.y - py * k * ry)} ${formatPathNumber(bottom.x - ux * k * rx)} ${formatPathNumber(bottom.y - uy * k * rx)} ${formatPathNumber(bottom.x)} ${formatPathNumber(bottom.y)}`,
    `C ${formatPathNumber(bottom.x + ux * k * rx)} ${formatPathNumber(bottom.y + uy * k * rx)} ${formatPathNumber(front.x - px * k * ry)} ${formatPathNumber(front.y - py * k * ry)} ${formatPathNumber(front.x)} ${formatPathNumber(front.y)}`,
    "Z",
  ].join(" ");
}

function parsePlot(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after plot.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const fnExpr = options.get("fn");
  if (!fnExpr) throw new DslCompileError("plot requires fn=...", lineNumber);
  const [r0, r1] = (options.get("range") ?? "-5,5").split(",").map((v) => parseNumber(v, lineNumber));
  const samples = parseNumber(options.get("samples") ?? "200", lineNumber);
  const at = options.get("at") ?? "0,0";
  const [cx, cy] = at.split(",").map((v) => parseNumber(v, lineNumber));
  const scaleX = parseNumber(options.get("scaleX") ?? "76", lineNumber);
  const scaleY = parseNumber(options.get("scaleY") ?? "60", lineNumber);
  const close = options.get("close")
    ? parseBoolean(options.get("close")!, lineNumber)
    : false;
  const pathOp = readPathGeneratorAssignment(`path(x=t*${scaleX}, y=(${fnExpr})*-${scaleY}, from=${r0!}, to=${r1!}, samples=${samples}, close=${close})`, state, lineNumber);
  if (!pathOp) throw new DslCompileError("Failed to build plot path.", lineNumber);

  const node = createBaseNode(id, "path");
  node.transform.x = cx!; node.transform.y = cy!;
  node.style.fill = "none";
  node.style.stroke = "#38bdf8";
  node.style.strokeWidth = 4;
  node.style.strokeLinecap = "round";
  node.style.strokeLinejoin = "round";
  for (const [key, value] of options) {
    if (
      key === "fn" ||
      key === "range" ||
      key === "samples" ||
      key === "at" ||
      key === "scaleX" ||
      key === "scaleY" ||
      key === "close"
    ) continue;
    applyNodeOption(node, key, value, lineNumber);
  }
  node.geometry.fn = fnExpr;
  node.geometry.range = [r0!, r1!];
  node.geometry.scaleX = scaleX;
  node.geometry.scaleY = scaleY;
  node.metadata = { plot: { range: [r0!, r1!], samples } };
  pathOp.smoothing = "smooth";
  const d = buildPathDataPreview(pathOp, state);
  node.geometry.d = d;
  state.nodes.set(id, node);
  state.rootIds.add(id);
}

function parseGraphLabel(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after graphLabel.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const plotId = options.get("plot");
  if (!plotId) throw new DslCompileError("graphLabel requires plot=<plot-id>.", lineNumber);
  const plot = requireNode(state, plotId, lineNumber);
  const fnExpr = String(plot.geometry.fn ?? "");
  if (!fnExpr) throw new DslCompileError(`graphLabel plot '${plotId}' is not a plot helper.`, lineNumber);
  const range = Array.isArray(plot.geometry.range) ? plot.geometry.range : undefined;
  const xVal = parseNumber(options.get("xVal") ?? String(range?.[1] ?? 0), lineNumber);
  const yVal = evaluateGraphExpression(fnExpr, xVal, state, lineNumber);
  const scaleX = Number(plot.geometry.scaleX ?? 1);
  const scaleY = Number(plot.geometry.scaleY ?? 1);
  const pointX = Number(plot.transform.x ?? 0) + xVal * scaleX;
  const pointY = Number(plot.transform.y ?? 0) - yVal * scaleY;
  const size = parseNumber(options.get("size") ?? options.get("fontSize") ?? "28", lineNumber);
  const label = options.get("label") ?? "f(x)";
  const renderer = options.get("renderer") ?? "katex";
  const fill = options.get("fill") ?? String(plot.style.stroke ?? "#FFFFFF");
  const buff = parseNumber(options.get("buff") ?? "16.875", lineNumber);
  const labelW = parseNumber(options.get("w") ?? String(Math.max(size * 2, label.length * size * 0.35)), lineNumber);
  const labelH = parseNumber(options.get("h") ?? String(size * 1.55), lineNumber);
  const xOffset = parseNumber(options.get("xOffset") ?? "0", lineNumber);
  const yOffset = parseNumber(options.get("yOffset") ?? "0", lineNumber);
  const direction = parseGraphLabelDirection(options.get("direction") ?? "right", lineNumber);
  const node = createBaseNode(id, "math");
  node.latex = label;
  node.renderer = renderer;
  node.geometry.fontSize = size;
  node.geometry.w = labelW;
  node.geometry.h = labelH;
  node.geometry.graphLabel = true;
  node.geometry.plot = plotId;
  node.geometry.xVal = xVal;
  node.style.fill = fill;
  node.transform.x = pointX + direction.x * (labelW / 2 + buff) + xOffset;
  node.transform.y = pointY + direction.y * (labelH / 2 + buff) + yOffset;
  for (const [key, value] of options) {
    if (
      [
        "plot",
        "label",
        "xVal",
        "direction",
        "buff",
        "size",
        "fontSize",
        "renderer",
        "fill",
        "w",
        "h",
        "xOffset",
        "yOffset",
      ].includes(key)
    )
      continue;
    applyNodeOption(node, key, value, lineNumber);
  }
  state.nodes.set(id, node);
  state.rootIds.add(id);
}

function parseGraphLabelDirection(raw: string, lineNumber: number): { x: number; y: number } {
  const directions: Record<string, { x: number; y: number }> = {
    right: { x: 1, y: 0 },
    left: { x: -1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    ur: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
    ul: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
    dr: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
    dl: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
  };
  const direction = directions[raw.toLowerCase()];
  if (!direction)
    throw new DslCompileError(
      "graphLabel direction must be right, left, up, down, ur, ul, dr, or dl.",
      lineNumber,
    );
  return direction;
}

function parseAngle(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after angle.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const radius = parseNumber(options.get("radius") ?? options.get("r") ?? "48", lineNumber);
  const from = options.get("from") ?? "0";
  const to = options.get("to") ?? "pi/2";
  const samples = options.get("samples") ?? "48";
  const close = options.get("close") ?? "false";
  const pathGenerator = readPathGeneratorAssignment(
    `path(x=${radius}*cos(t),y=${radius}*sin(t),from=${from},to=${to},samples=${samples},close=${close})`,
    state,
    lineNumber,
  );
  if (!pathGenerator) throw new DslCompileError("Failed to build angle path.", lineNumber);
  pathGenerator.pathType = "arc";
  pathGenerator.radius = radius;
  pathGenerator.smoothing = "smooth";

  const node = createBaseNode(id, "path");
  node.style.fill = "none";
  node.style.stroke = "#f59e0b";
  node.style.strokeWidth = 4;
  node.style.strokeLinecap = "round";
  node.style.strokeLinejoin = "round";
  node.geometry.angle = true;
  node.geometry.radius = radius;
  node.geometry.d = buildPathDataPreview(pathGenerator, state);
  for (const [key, value] of options) {
    if (["radius", "r", "from", "to", "samples", "close"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  pushBindPath(state, id, "geometry.d", pathGenerator, statementTime(state));
}

function parseTracedPath(tokens: string[], state: CompileState, lineNumber: number): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after tracedPath.", lineNumber);
  if (state.nodes.has(id)) throw new DslCompileError(`Duplicate node id '${id}'.`, lineNumber);
  const options = new Map(readNodeArguments(tokens.slice(2), lineNumber));
  const target = options.get("target");
  if (target) {
    if (!findNode(state, target))
      throw new DslCompileError(`Unknown tracedPath target '${target}'.`, lineNumber);
    const node = createBaseNode(id, "path");
    node.style.fill = "none";
    node.style.stroke = "#22d3ee";
    node.style.strokeWidth = 4;
    node.style.strokeLinecap = "round";
    node.style.strokeLinejoin = "round";
    node.geometry.tracedPath = true;
    node.geometry.tracedTarget = target;
    node.geometry.traceStart = parseSeconds(options.get("start") ?? `${statementTime(state)}s`, lineNumber);
    node.geometry.traceSamples = parseNumber(options.get("samples") ?? "96", lineNumber);
    const targetNode = requireNode(state, target, lineNumber);
    node.geometry.d = `M ${targetNode.transform.x} ${targetNode.transform.y}`;
    for (const [key, value] of options) {
      if (["target", "start", "samples"].includes(key)) continue;
      applyNodeOption(node, key, value, lineNumber);
    }
    state.nodes.set(id, node);
    state.rootIds.add(id);
    return;
  }
  const xExpr = options.get("x");
  const yExpr = options.get("y");
  if (!xExpr || !yExpr)
    throw new DslCompileError("tracedPath requires x=<expr> and y=<expr>.", lineNumber);
  const from = options.get("from") ?? "0";
  const to = options.get("to") ?? "2*pi";
  const samples = options.get("samples") ?? "96";
  const close = options.get("close") ?? "false";
  const pathGenerator = readPathGeneratorAssignment(
    `path(x=${xExpr},y=${yExpr},from=${from},to=${to},samples=${samples},close=${close})`,
    state,
    lineNumber,
  );
  if (!pathGenerator) throw new DslCompileError("Failed to build tracedPath path.", lineNumber);
  pathGenerator.smoothing = "smooth";

  const node = createBaseNode(id, "path");
  node.style.fill = "none";
  node.style.stroke = "#22d3ee";
  node.style.strokeWidth = 4;
  node.style.strokeLinecap = "round";
  node.style.strokeLinejoin = "round";
  node.geometry.tracedPath = true;
  node.geometry.d = buildPathDataPreview(pathGenerator, state);
  for (const [key, value] of options) {
    if (["x", "y", "from", "to", "samples", "close"].includes(key)) continue;
    applyNodeOption(node, key, value, lineNumber);
  }

  state.nodes.set(id, node);
  state.rootIds.add(id);
  pushBindPath(state, id, "geometry.d", pathGenerator, statementTime(state));
}

function buildPathDataPreview(op: { samples:number; tMinExpr:string; tMaxExpr:string; xExpr:string; yExpr:string; close?:boolean; smoothing?: "linear" | "smooth"; pathType?: "parametric" | "arc"; radius?: number }, state: CompileState): string {
  const vars = Object.fromEntries([...state.values].map(([k,v])=>[k,v]));
  const tMin = evaluateExpression(op.tMinExpr, vars);
  const tMax = evaluateExpression(op.tMaxExpr, vars);
  if (op.pathType === "arc") {
    return arcToSvgPath(op.radius ?? 0, tMin, tMax, {
      ...(op.close === undefined ? {} : { close: op.close }),
    });
  }

  const points: Array<{ x: number; y: number }> = [];
  for (let i=0;i<op.samples;i++){
    const u = op.samples===1?0:i/(op.samples-1);
    const t = tMin + (tMax-tMin)*u;
    const scope={...vars,t};
    const x = evaluateExpression(op.xExpr, scope);
    const y = evaluateExpression(op.yExpr, scope);
    points.push({ x, y });
  }
  return pointsToSvgPath(points, {
    ...(op.close === undefined ? {} : { close: op.close }),
    smooth: op.smoothing === "smooth",
  });
}

function pushBindPath(
  state: CompileState,
  id: string,
  path: string,
  pathGenerator: {
    samples: number;
    tMinExpr: string;
    tMaxExpr: string;
    xExpr: string;
    yExpr: string;
    close?: boolean;
    smoothing?: "linear" | "smooth";
    pathType?: "parametric" | "arc";
    radius?: number;
  },
  time: number,
): void {
  state.timeline.push({
    t: time,
    op: "bindPath",
    id,
    path,
    ...pathGenerator,
    deps: [
      ...new Set([
        ...collectExpressionDependencies(pathGenerator.tMinExpr),
        ...collectExpressionDependencies(pathGenerator.tMaxExpr),
        ...collectExpressionDependencies(pathGenerator.xExpr),
        ...collectExpressionDependencies(pathGenerator.yExpr),
      ]),
    ].filter((name) => state.values.has(name)),
  });
}

function pushBindExpr(
  state: CompileState,
  id: string,
  path: string,
  expr: string,
  time: number,
): void {
  state.timeline.push({
    t: time,
    op: "bindExpr",
    id,
    path,
    expr,
    deps: collectExpressionDependencies(expr).filter((name) => state.values.has(name)),
  });
}

function statementTime(state: CompileState): number {
  return state.blockTime ?? state.currentTime;
}

function advanceStatementTime(state: CompileState, duration: number): void {
  if (state.blockTime === null) state.currentTime += duration;
  else state.blockTime += duration;
  state.extentTime = Math.max(state.extentTime, statementTime(state));
}


function parseArrange(tokens: string[], state: CompileState, lineNumber: number, time: number): void {
  const groupId = tokens[1];
  if (!groupId) throw new DslCompileError("arrange requires a group id.", lineNumber);
  const group = state.nodes.get(groupId);
  if (!group || group.type !== "group") throw new DslCompileError(`arrange target '${groupId}' must be a group.`, lineNumber);

  let direction: "horizontal" | "vertical" = "horizontal";
  let gap = 16;
  for (const [key, value] of readAssignments(tokens.slice(2), lineNumber)) {
    if (key === "direction") {
      if (value !== "horizontal" && value !== "vertical") throw new DslCompileError("arrange direction must be horizontal or vertical.", lineNumber);
      direction = value;
      continue;
    }
    if (key === "gap") { gap = parseNumber(value, lineNumber); continue; }
    throw new DslCompileError(`Unknown arrange option '${key}'.`, lineNumber);
  }

  const sizes = group.children.map((child) => ({ node: child, ...measureNode(child) }));
  const total = sizes.reduce((sum, item, i) => sum + (direction === "horizontal" ? item.w : item.h) + (i > 0 ? gap : 0), 0);
  let cursor = -total / 2;
  for (const item of sizes) {
    if (direction === "horizontal") {
      const x = cursor + item.w / 2;
      pushSet(state, time, item.node.id, "transform.x", x);
      cursor += item.w + gap;
    } else {
      const y = cursor + item.h / 2;
      pushSet(state, time, item.node.id, "transform.y", y);
      cursor += item.h + gap;
    }
  }
}

function parseNextTo(tokens: string[], state: CompileState, lineNumber: number, time: number): void {
  const id = tokens[1];
  const targetId = tokens[2];
  if (!id || !targetId) throw new DslCompileError("nextTo requires source and target ids.", lineNumber);
  const node = state.nodes.get(id);
  const target = state.nodes.get(targetId);
  if (!node) throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  if (!target) throw new DslCompileError(`Unknown node '${targetId}'.`, lineNumber);

  let direction: "up"|"down"|"left"|"right" = "right";
  let buff = 12;
  for (const [key, value] of readAssignments(tokens.slice(3), lineNumber)) {
    if (key === "direction") {
      if (!["up","down","left","right"].includes(value)) throw new DslCompileError("nextTo direction must be up/down/left/right.", lineNumber);
      direction = value as "up" | "down" | "left" | "right";
      continue;
    }
    if (key === "buff") { buff = parseNumber(value, lineNumber); continue; }
    throw new DslCompileError(`Unknown nextTo option '${key}'.`, lineNumber);
  }
  const a = approximateNodeBounds(node);
  const b = approximateNodeBounds(target);
  const aWidth = a.maxX - a.minX;
  const aHeight = a.maxY - a.minY;
  const bCenterX = (b.minX + b.maxX) / 2;
  const bCenterY = (b.minY + b.maxY) / 2;
  if (direction === "right") {
    pushSet(state, time, node.id, "transform.x", b.maxX + aWidth / 2 + buff);
    pushSet(state, time, node.id, "transform.y", bCenterY);
  } else if (direction === "left") {
    pushSet(state, time, node.id, "transform.x", b.minX - aWidth / 2 - buff);
    pushSet(state, time, node.id, "transform.y", bCenterY);
  } else if (direction === "up") {
    pushSet(state, time, node.id, "transform.y", b.minY - aHeight / 2 - buff);
    pushSet(state, time, node.id, "transform.x", bCenterX);
  } else {
    pushSet(state, time, node.id, "transform.y", b.maxY + aHeight / 2 + buff);
    pushSet(state, time, node.id, "transform.x", bCenterX);
  }
}

function pushSet(state: CompileState, time: number, id: string, path: string, value: number): void {
  state.timeline.push({ t: time, op: "set", id, path, value });
  const node = state.nodes.get(id);
  if (!node) return;
  if (path === "transform.x") node.transform.x = value;
  if (path === "transform.y") node.transform.y = value;
}

function measureNode(node: SceneNode): { w: number; h: number } {
  if (node.type === "circle") { const r = Number(node.geometry.r ?? 40); return { w: r * 2, h: r * 2 }; }
  if (node.type === "rect" || node.type === "triangle") return { w: Number(node.geometry.w ?? 100), h: Number(node.geometry.h ?? 80) };
  if (node.type === "line") return { w: Math.abs(Number(node.geometry.x2 ?? 100) - Number(node.geometry.x1 ?? 0)), h: Math.abs(Number(node.geometry.y2 ?? 0) - Number(node.geometry.y1 ?? 0)) };
  if (node.type === "group") {
    const child = node.children.map(measureNode);
    return { w: child.reduce((a,c)=>a+c.w,0), h: child.reduce((a,c)=>Math.max(a,c.h),0) };
  }
  const size = Number(node.geometry.fontSize ?? 32);
  return { w: size * 3, h: size * 1.2 };
}
function parseShow(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  time: number,
): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after show.", lineNumber);
  const node = state.nodes.get(id);
  if (!node) throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  state.timeline.push({ t: time, op: "create", node: structuredClone(node) });
  state.shown.add(id);
}

function parseHide(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  time: number,
): void {
  const id = tokens[1];
  if (!id) throw new DslCompileError("Expected id after hide.", lineNumber);
  if (!state.nodes.has(id))
    throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  state.timeline.push({ t: time, op: "delete", id });
}

function parseSet(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  time: number,
): void {
  const target = tokens[1];
  if (!target)
    throw new DslCompileError("Expected target after set.", lineNumber);
  const [id, property] = splitTargetPath(target);
  if (!id || !property)
    throw new DslCompileError("Expected set target like 'c1.x' or 'camera.x'.", lineNumber);
  const isCameraTarget = id === "camera" && isCameraProperty(property);
  if (!isCameraTarget && !state.nodes.has(id))
    throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  if (tokens[2] !== "to" || tokens[3] === undefined)
    throw new DslCompileError(
      "Expected set syntax: set id.property to value.",
      lineNumber,
    );
  if (tokens.length > 4)
    throw new DslCompileError("Unexpected tokens after set value.", lineNumber);

  const expression = readExpressionAssignment(tokens[3], state, lineNumber);
  if (expression !== null) {
    state.timeline.push({
      t: time,
      op: "setExpr",
      id,
      path: isCameraTarget ? cameraPropertyPath(property) : propertyPath(property),
      expr: expression,
    });
    return;
  }

  state.timeline.push({
    t: time,
    op: "set",
    id,
    path: isCameraTarget ? cameraPropertyPath(property) : propertyPath(property),
    value: parseValue(tokens[3], lineNumber),
  });
}


function parseAlways(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  time: number,
): void {
  const target = tokens[1];
  if (!target) throw new DslCompileError("Expected target after always.", lineNumber);
  const [id, property] = splitTargetPath(target);
  if (!id || !property) throw new DslCompileError("Expected always target like 'c1.x'.", lineNumber);
  const isCameraTarget = id === "camera" && isCameraProperty(property);
  if (!isCameraTarget && !state.nodes.has(id)) throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  if (tokens[2] !== "=" || tokens[3] === undefined) throw new DslCompileError("Expected always syntax: always id.property = expr=...", lineNumber);
  const rightHandSide = tokens.slice(3).join(" ");
  const pathGenerator = readPathGeneratorAssignment(rightHandSide, state, lineNumber);
  if (pathGenerator) {
    pushBindPath(
      state,
      id,
      isCameraTarget ? cameraPropertyPath(property) : propertyPath(property),
      pathGenerator,
      time,
    );
    return;
  }
  const expression = readExpressionAssignment(rightHandSide, state, lineNumber);
  if (expression === null)
    throw new DslCompileError(
      "always requires expr=... or path(...).",
      lineNumber,
    );
  pushBindExpr(
    state,
    id,
    isCameraTarget ? cameraPropertyPath(property) : propertyPath(property),
    expression,
    time,
  );
}

function readPathGeneratorAssignment(
  token: string,
  state: CompileState,
  lineNumber: number,
):
  | {
      samples: number;
      tMinExpr: string;
      tMaxExpr: string;
      xExpr: string;
      yExpr: string;
      close?: boolean;
      smoothing?: "linear" | "smooth";
      pathType?: "parametric" | "arc";
      radius?: number;
    }
  | null {
  const match = /^path\((.*)\)$/u.exec(token.trim());
  if (!match) return null;
  const args = splitInlineArgs(match[1] ?? "");
  const map = new Map(args.map((item) => readAssignment(item, lineNumber)));
  const xExpr = map.get("x");
  const yExpr = map.get("y");
  if (!xExpr || !yExpr)
    throw new DslCompileError("path(...) requires x=... and y=...", lineNumber);
  const tMinExpr = map.get("from") ?? "0";
  const tMaxExpr = map.get("to") ?? "2*pi";
  const samples = Number(map.get("samples") ?? "96");
  const close = map.get("close")
    ? parseBoolean(map.get("close")!, lineNumber)
    : undefined;
  if (!Number.isInteger(samples) || samples < 2)
    throw new DslCompileError(
      "path(...) samples must be an integer >= 2.",
      lineNumber,
    );
  try {
    for (const expression of [xExpr, yExpr, tMinExpr, tMaxExpr])
      validateExpression(expression, [...state.values.keys(), "t"]);
  } catch (error) {
    if (error instanceof ExpressionError)
      throw new DslCompileError(
        `Invalid path(...) expression: ${error.message}`,
        lineNumber,
      );
    throw error;
  }
  return {
    samples,
    tMinExpr,
    tMaxExpr,
    xExpr,
    yExpr,
    ...(close === undefined ? {} : { close }),
  };
}

function splitInlineArgs(source: string): string[] {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]!;
    if (char === '"' && source[index - 1] !== "\\") quoted = !quoted;
    if (char === "," && !quoted) {
      if (current.trim()) out.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function parseWait(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  if (!tokens[1])
    throw new DslCompileError("Expected duration after wait.", lineNumber);
  if (tokens.length > 2)
    throw new DslCompileError(
      "Unexpected tokens after wait duration.",
      lineNumber,
    );
  advanceStatementTime(state, parseSeconds(tokens[1], lineNumber));
}

function parsePlay(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
): void {
  const [call, optionTokens] = readPlayCall(tokens, lineNumber);
  let duration = 1;
  let easing = "smooth";
  let hasDuration = false;
  let hasEasing = false;
  let color: string | undefined;
  for (const [key, value] of readAssignments(optionTokens, lineNumber)) {
    if (key === "duration") {
      duration = parseSeconds(value, lineNumber);
      hasDuration = true;
    } else if (key === "easing") {
      easing = parseEasing(value, lineNumber);
      hasEasing = true;
    }
    else if (key === "color") color = value;
    else throw new DslCompileError(`Unknown play option '${key}'.`, lineNumber);
  }
  if (call.name === "Rotating") {
    if (!hasDuration) duration = 5;
    if (!hasEasing) easing = "linear";
  }

  snapshotPendingAutoCreates(state);
  emitPlayCall(state, call, statementTime(state), duration, easing, lineNumber, color);
  advanceStatementTime(state, duration);
}

function snapshotPendingAutoCreates(state: CompileState): void {
  for (const id of state.rootIds) {
    if (state.autoCreateSnapshots.has(id)) continue;
    const node = state.nodes.get(id);
    if (!node || isShownOrHasShownDescendant(node, state.shown)) continue;
    state.autoCreateSnapshots.set(id, structuredClone(node));
  }
}

function emitPlayCall(
  state: CompileState,
  call: PlayCall,
  start: number,
  duration: number,
  easing: string,
  lineNumber: number,
  playColor?: string,
): void {
  if (call.name === "FadeIn") {
    const id = expectPlayArg(call, 1, lineNumber);
    const shift = readFadeShift(call, lineNumber);
    pushFadeIn(state, start, id, duration, easing, lineNumber, shift);
    return;
  }

  if (call.name === "FadeOut") {
    const id = expectPlayArg(call, 1, lineNumber);
    const shift = readFadeShift(call, lineNumber);
    pushFadeOut(state, start, id, duration, easing, lineNumber, shift);
    return;
  }

  if (call.name === "Animate") {
    pushAnimateMethod(state, start, call, duration, easing, lineNumber);
    return;
  }

  if (call.name === "MoveAlongPath") {
    ensureNoPlayOptions(call, lineNumber);
    const ids = expectPlayIdArgs(call, 2, lineNumber);
    pushMoveAlongPath(state, start, ids[0]!, ids[1]!, duration, easing, lineNumber);
    return;
  }

  if (call.name === "Rotating") {
    pushRotating(state, start, call, duration, easing, lineNumber);
    return;
  }

  if (call.name === "ReplacementTransform") {
    ensureNoPlayOptions(call, lineNumber);
    const ids = expectPlayIdArgs(call, 2, lineNumber);
    const fromId = ids[0]!;
    const toId = ids[1]!;
    const fromNode = requireNode(state, fromId, lineNumber);
    const toNode = requireNode(state, toId, lineNumber);
    const transformSourceNode = state.shown.has(fromId)
      ? visibleZeroOpacityClone(fromNode)
      : fromNode;
    state.timeline.push({
      t: start,
      op: "effect",
      id: fromId,
      effect: "replacementTransform",
      duration,
      easing,
    });
    pushTransformAnimations(state, start, transformSourceNode, toNode, duration, easing);
    state.timeline.push({ t: start + duration, op: "delete", id: fromId });
    state.timeline.push({
      t: start + duration,
      op: "create",
      node: visibleZeroOpacityClone(toNode),
    });
    state.shown.delete(fromId);
    state.shown.add(toId);
    return;
  }

  if (call.name === "Create") {
    ensureNoPlayOptions(call, lineNumber);
    const id = expectPlayArg(call, 1, lineNumber);
    pushCreate(state, start, id, duration, easing, lineNumber);
    return;
  }

  if (call.name === "Uncreate") {
    ensureNoPlayOptions(call, lineNumber);
    const id = expectPlayArg(call, 1, lineNumber);
    pushUncreate(state, start, id, duration, easing, lineNumber);
    return;
  }

  if (call.name === "Write") {
    ensureNoPlayOptions(call, lineNumber);
    const id = expectPlayArg(call, 1, lineNumber);
    pushWrite(state, start, id, duration, easing, lineNumber);
    return;
  }

  if (call.name === "Transform") {
    ensureNoPlayOptions(call, lineNumber);
    const ids = expectPlayIdArgs(call, 2, lineNumber);
    const fromId = ids[0]!;
    const toId = ids[1]!;
    const fromNode = requireNode(state, fromId, lineNumber);
    const toNode = requireNode(state, toId, lineNumber);
    const transformSourceNode = state.shown.has(fromId)
      ? visibleZeroOpacityClone(fromNode)
      : fromNode;
    state.timeline.push({
      t: start,
      op: "effect",
      id: fromId,
      effect: "transform",
      duration,
      easing,
    });
    pushTransformAnimations(state, start, transformSourceNode, toNode, duration, easing);
    state.shown.add(toId);
    return;
  }

  if (call.name === "TransformMatchingTex") {
    ensureNoPlayOptions(call, lineNumber);
    const ids = expectPlayIdArgs(call, 2, lineNumber);
    pushTransformMatchingTex(
      state,
      start,
      ids[0]!,
      ids[1]!,
      duration,
      easing,
      lineNumber,
    );
    return;
  }

  if (call.name === "Circumscribe") {
    const color = readCircumscribeColor(call, lineNumber, playColor);
    const id = expectPlayArg(call, 1, lineNumber);
    requireNode(state, id, lineNumber);
    state.timeline.push({
      t: start,
      op: "effect",
      id,
      effect: color ? `circumscribe:${color}` : "circumscribe",
      duration,
      easing,
    });
    return;
  }

  if (call.name === "AnimationGroup" || call.name === "LaggedStart") {
    const childCalls = expectPlayCallArgs(call, lineNumber);
    const lagRatio = readLagRatio(call, lineNumber);
    const { childDuration, childOffset } = normalizeLaggedGroupTiming(
      duration,
      childCalls.length,
      lagRatio,
    );
    childCalls.forEach((childCall, index) => {
      emitPlayCall(
        state,
        childCall,
        start + childOffset * index,
        childDuration,
        easing,
        lineNumber,
        playColor,
      );
    });
    return;
  }

  if (call.name === "Succession") {
    ensureNoPlayOptions(call, lineNumber);
    const childCalls = expectPlayCallArgs(call, lineNumber);
    const childDuration = duration / childCalls.length;
    childCalls.forEach((childCall, index) => {
      emitPlayCall(
        state,
        childCall,
        start + childDuration * index,
        childDuration,
        easing,
        lineNumber,
        playColor,
      );
    });
    return;
  }

  throw new DslCompileError(
    `Unknown play primitive '${call.name}'.`,
    lineNumber,
  );
}

function readCircumscribeColor(
  call: PlayCall,
  lineNumber: number,
  playColor?: string,
): string | undefined {
  let color = playColor;
  for (const [key, value] of call.options) {
    if (key === "color") color = value;
    else
      throw new DslCompileError(
        `Unknown ${call.name} option '${key}'.`,
        lineNumber,
      );
  }
  return color;
}

function readFadeShift(
  call: PlayCall,
  lineNumber: number,
): { x: number; y: number } {
  let shift = { x: 0, y: 0 };
  for (const [key, value] of call.options) {
    if (key === "shift") shift = parseDirectionVector(value, lineNumber);
    else
      throw new DslCompileError(
        `Unknown ${call.name} option '${key}'.`,
        lineNumber,
      );
  }
  return shift;
}

function parseDirectionVector(
  raw: string,
  lineNumber: number,
): { x: number; y: number } {
  const unit = 67.5;
  const directions: Record<string, { x: number; y: number }> = {
    ORIGIN: { x: 0, y: 0 },
    UP: { x: 0, y: -unit },
    DOWN: { x: 0, y: unit },
    LEFT: { x: -unit, y: 0 },
    RIGHT: { x: unit, y: 0 },
    UL: { x: -unit, y: -unit },
    UR: { x: unit, y: -unit },
    DL: { x: -unit, y: unit },
    DR: { x: unit, y: unit },
  };
  const trimmed = raw.trim();
  const coordinateMatch = trimmed.match(/^\(([^,]+),([^,]+)\)$/u);
  if (coordinateMatch) {
    return {
      x: parseNumber(coordinateMatch[1]!, lineNumber),
      y: parseNumber(coordinateMatch[2]!, lineNumber),
    };
  }

  const multiplierMatch = trimmed.match(/^(.+?)\s*\*\s*([A-Z]+)$/u);
  const scale = multiplierMatch
    ? parseNumber(multiplierMatch[1]!, lineNumber)
    : 1;
  const direction = directions[multiplierMatch ? multiplierMatch[2]! : trimmed];
  if (!direction)
    throw new DslCompileError(
      "Expected shift to be UP, DOWN, LEFT, RIGHT, UL, UR, DL, DR, ORIGIN, n*<direction>, or (x,y).",
      lineNumber,
    );
  return { x: direction.x * scale, y: direction.y * scale };
}

function pushTransformMatchingTex(
  state: CompileState,
  start: number,
  fromId: string,
  toId: string,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const fromNode = requireNode(state, fromId, lineNumber);
  const toNode = requireNode(state, toId, lineNumber);
  const fromTokens = texTokenEntries(fromNode);
  const toTokens = texTokenEntries(toNode);
  if (fromTokens.length === 0 || toTokens.length === 0)
    throw new DslCompileError(
      "TransformMatchingTex requires math nodes declared with expandTokens=true.",
      lineNumber,
    );

  if (toNode.transform.opacity === 0)
    state.timeline.push({ t: start - 0.0001, op: "delete", id: toId });

  const available = new Map<string, TexTokenEntry[]>();
  for (const entry of toTokens) {
    const latex = entry.node.latex;
    if (!latex) continue;
    const matches = available.get(latex) ?? [];
    matches.push(entry);
    available.set(latex, matches);
  }

  const matchedTo = new Set<string>();
  for (const entry of fromTokens) {
    const child = entry.node;
    const matches = child.latex ? available.get(child.latex) : undefined;
    // Duplicate-token priority rule (Manim-compatible enough for stable output):
    // match each source token to the earliest still-unmatched target token with
    // the same LaTeX string, scanning strictly left-to-right.
    const match = matches?.shift();
    if (match) {
      matchedTo.add(match.node.id);
      state.timeline.push({
        t: start,
        op: "effect",
        id: child.id,
        effect: "transform",
        duration,
        easing,
      });
      pushTransformAnimations(
        state,
        start,
        child,
        retargetTokenNode(match.absoluteNode, entry.parentTransform),
        duration,
        easing,
      );
      state.timeline.push({
        t: start + duration,
        op: "create",
        node: visibleZeroOpacityClone(match.absoluteNode),
      });
      state.timeline.push({ t: start + duration, op: "delete", id: child.id });
    } else {
      pushFadeOutNode(state, start, child, duration, easing);
    }
  }

  for (const entry of toTokens) {
    if (!matchedTo.has(entry.node.id))
      pushFadeInNode(
        state,
        start,
        entry.absoluteNode,
        duration,
        easing,
      );
  }

  state.shown.add(toId);
}

function texTokenEntries(
  node: SceneNode,
  parentTransform: Transform = identityTransform(),
): TexTokenEntry[] {
  const currentTransform = composeTransform(parentTransform, node.transform);
  const entries: TexTokenEntry[] = [];
  for (const child of node.children ?? []) {
    if (
      child.type === "math" &&
      typeof child.latex === "string" &&
      (child.children ?? []).length === 0
    ) {
      entries.push({
        node: child,
        parentTransform: currentTransform,
        absoluteNode: nodeWithTransform(
          child,
          composeTransform(currentTransform, child.transform),
        ),
      });
      continue;
    }
    entries.push(...texTokenEntries(child, currentTransform));
  }
  return entries;
}

function retargetTokenNode(
  targetNode: SceneNode,
  sourceParentTransform: Transform,
): SceneNode {
  const clone = structuredClone(targetNode);
  clone.transform = relativeTransform(targetNode.transform, sourceParentTransform);
  return clone;
}

function nodeWithTransform(node: SceneNode, transform: Transform): SceneNode {
  const clone = structuredClone(node);
  clone.transform = transform;
  return clone;
}

function identityTransform(): Transform {
  return { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
}

function composeTransform(parent: Transform, child: Transform): Transform {
  const parentScaleX = parent.scale * Number(parent.scaleX ?? 1);
  const parentScaleY = parent.scale * Number(parent.scaleY ?? 1);
  const scaleX = Number(parent.scaleX ?? 1) * Number(child.scaleX ?? 1);
  const scaleY = Number(parent.scaleY ?? 1) * Number(child.scaleY ?? 1);
  return {
    x: parent.x + child.x * parentScaleX,
    y: parent.y + child.y * parentScaleY,
    scale: parent.scale * child.scale,
    ...(scaleX === 1 ? {} : { scaleX }),
    ...(scaleY === 1 ? {} : { scaleY }),
    rotation: parent.rotation + child.rotation,
    opacity: parent.opacity * child.opacity,
  };
}

function relativeTransform(absolute: Transform, parent: Transform): Transform {
  const parentScaleX = parent.scale * Number(parent.scaleX ?? 1);
  const parentScaleY = parent.scale * Number(parent.scaleY ?? 1);
  const scaleX = safeRatio(Number(absolute.scaleX ?? 1), Number(parent.scaleX ?? 1));
  const scaleY = safeRatio(Number(absolute.scaleY ?? 1), Number(parent.scaleY ?? 1));
  return {
    x: safeRatio(absolute.x - parent.x, parentScaleX),
    y: safeRatio(absolute.y - parent.y, parentScaleY),
    scale: safeRatio(absolute.scale, parent.scale),
    ...(scaleX === 1 ? {} : { scaleX }),
    ...(scaleY === 1 ? {} : { scaleY }),
    rotation: absolute.rotation - parent.rotation,
    opacity: safeRatio(absolute.opacity, parent.opacity),
  };
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator === 0 ? numerator : numerator / denominator;
}

function pushFadeInNode(
  state: CompileState,
  start: number,
  node: SceneNode,
  duration: number,
  easing: string,
): void {
  const targetNode = visibleZeroOpacityClone(node);
  const createNode = hiddenClone(targetNode);
  state.timeline.push({ t: start, op: "create", node: createNode });
  state.timeline.push({
    t: start,
    op: "effect",
    id: node.id,
    effect: "fadeIn",
    duration,
    easing,
  });
  state.timeline.push({
    t: start,
    op: "animate",
    id: node.id,
    path: "transform.opacity",
    from: 0,
    to: fadeInTargetOpacity(targetNode),
    duration,
    easing,
  });
}

function pushFadeOutNode(
  state: CompileState,
  start: number,
  node: SceneNode,
  duration: number,
  easing: string,
): void {
  state.timeline.push({
    t: start,
    op: "effect",
    id: node.id,
    effect: "fadeOut",
    duration,
    easing,
  });
  state.timeline.push({
    t: start,
    op: "animate",
    id: node.id,
    path: "transform.opacity",
    from: node.transform.opacity,
    to: 0,
    duration,
    easing,
  });
  state.timeline.push({ t: start + duration, op: "delete", id: node.id });
}

function pushFadeIn(
  state: CompileState,
  start: number,
  id: string,
  duration: number,
  easing: string,
  lineNumber: number,
  shift: { x: number; y: number } = { x: 0, y: 0 },
): void {
  const sourceNode = visibleZeroOpacityClone(requireNode(state, id, lineNumber));
  const node = hiddenClone(sourceNode);
  node.transform.x -= shift.x;
  node.transform.y -= shift.y;
  state.timeline.push({ t: start, op: "create", node });
  state.timeline.push({
    t: start,
    op: "effect",
    id,
    effect: "fadeIn",
    duration,
    easing,
  });
  state.timeline.push({
    t: start,
    op: "animate",
    id,
    path: "transform.opacity",
    from: 0,
    to: fadeInTargetOpacity(sourceNode),
    duration,
    easing,
  });
  if (shift.x !== 0)
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "transform.x",
      from: sourceNode.transform.x - shift.x,
      to: sourceNode.transform.x,
      duration,
      easing,
    });
  if (shift.y !== 0)
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "transform.y",
      from: sourceNode.transform.y - shift.y,
      to: sourceNode.transform.y,
      duration,
      easing,
    });
  state.shown.add(id);
}

function fadeInTargetOpacity(node: SceneNode): number {
  return node.transform.opacity > 0 ? node.transform.opacity : 1;
}

function pushAnimateMethod(
  state: CompileState,
  start: number,
  call: PlayCall,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const id = expectPlayArg(call, 1, lineNumber);
  const node = requireNode(state, id, lineNumber);
  const target = structuredClone(node);
  if (call.options.size === 0)
    throw new DslCompileError(
      "Animate requires at least one method option.",
      lineNumber,
    );

  for (const [key, value] of call.options) {
    if (key === "shift") {
      const shift = parseDirectionVector(value, lineNumber);
      target.transform.x += shift.x;
      target.transform.y += shift.y;
    } else if (key === "fill") {
      target.style.fill = value;
    } else if (key === "fillOpacity") {
      target.style.fillOpacity = parseNumber(value, lineNumber);
    } else if (key === "stroke") {
      target.style.stroke = value;
    } else if (key === "strokeOpacity") {
      target.style.strokeOpacity = parseNumber(value, lineNumber);
    } else if (key === "strokeWidth") {
      target.style.strokeWidth = parseNumber(value, lineNumber);
    } else if (key === "opacity") {
      target.transform.opacity = parseNumber(value, lineNumber);
    } else if (key === "scale") {
      target.transform.scale *= parseNumber(value, lineNumber);
    } else if (key === "rotate") {
      target.transform.rotation += parseNumber(value, lineNumber) * (180 / Math.PI);
    } else if (key === "rotation") {
      target.transform.rotation += parseNumber(value, lineNumber);
    } else {
      throw new DslCompileError(
        `Unknown ${call.name} option '${key}'.`,
        lineNumber,
      );
    }
  }

  state.timeline.push({
    t: start,
    op: "effect",
    id,
    effect: "animate",
    duration,
    easing,
  });
  pushTransformAnimations(state, start, node, target, duration, easing);
  node.transform = target.transform;
  node.style = target.style;
  node.geometry = target.geometry;
}

function pushMoveAlongPath(
  state: CompileState,
  start: number,
  id: string,
  pathId: string,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const node = requireNode(state, id, lineNumber);
  const path = requireNode(state, pathId, lineNumber);
  if (path.geometry.fn) {
    pushMoveAlongPlotPath(state, start, node, path, duration, easing, lineNumber);
    return;
  }
  if (path.type !== "circle")
    throw new DslCompileError(
      "MoveAlongPath currently supports circle and plot path nodes.",
      lineNumber,
    );
  const trackerId = `__moveAlongPath_${id}_${pathId}_${state.timeline.length}`;
  const cx = formatPathNumber(Number(path.transform.x ?? 0));
  const cy = formatPathNumber(Number(path.transform.y ?? 0));
  const r = formatPathNumber(Number(path.geometry.r ?? 0));
  state.values.set(trackerId, 0);
  state.timeline.push({
    t: start,
    op: "bindExpr",
    id,
    path: "transform.x",
    expr: `${cx}+${r}*cos(${trackerId})`,
    duration,
    deps: [trackerId],
  });
  state.timeline.push({
    t: start,
    op: "bindExpr",
    id,
    path: "transform.y",
    expr: `${cy}-${r}*sin(${trackerId})`,
    duration,
    deps: [trackerId],
  });
  state.timeline.push({
    t: start,
    op: "animateValue",
    id: trackerId,
    from: 0,
    to: Math.PI * 2,
    duration,
    easing,
  });
  node.transform.x = Number(path.transform.x ?? 0) + Number(path.geometry.r ?? 0);
  node.transform.y = Number(path.transform.y ?? 0);
  state.timeline.push({
    t: start + duration,
    op: "set",
    id,
    path: "transform.x",
    value: node.transform.x,
  });
  state.timeline.push({
    t: start + duration,
    op: "set",
    id,
    path: "transform.y",
    value: node.transform.y,
  });
}

function pushMoveAlongPlotPath(
  state: CompileState,
  start: number,
  node: SceneNode,
  path: SceneNode,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  if (easing !== "linear")
    throw new DslCompileError(
      "MoveAlongPath on plot paths currently requires easing=linear.",
      lineNumber,
    );
  const points = resamplePlotPathByArcLength(path, state, lineNumber, 64);
  if (points.length < 2)
    throw new DslCompileError(
      "MoveAlongPath plot path requires at least two sampled points.",
      lineNumber,
    );
  const segmentDuration = duration / (points.length - 1);
  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index]!;
    const to = points[index + 1]!;
    const segmentStart = start + segmentDuration * index;
    state.timeline.push({
      t: segmentStart,
      op: "animate",
      id: node.id,
      path: "transform.x",
      from: from.x,
      to: to.x,
      duration: segmentDuration,
      easing: "linear",
    });
    state.timeline.push({
      t: segmentStart,
      op: "animate",
      id: node.id,
      path: "transform.y",
      from: from.y,
      to: to.y,
      duration: segmentDuration,
      easing: "linear",
    });
  }
  const finalPoint = points[points.length - 1]!;
  node.transform.x = finalPoint.x;
  node.transform.y = finalPoint.y;
}

function resamplePlotPathByArcLength(
  path: SceneNode,
  state: CompileState,
  lineNumber: number,
  segments: number,
): Array<{ x: number; y: number }> {
  const fnExpr = String(path.geometry.fn ?? "");
  const range = Array.isArray(path.geometry.range) ? path.geometry.range : undefined;
  if (!fnExpr || !range)
    throw new DslCompileError("MoveAlongPath plot path is missing plot metadata.", lineNumber);
  const sampleCount = Math.max(segments * 4, Math.min(256, Number(path.metadata?.plot?.samples ?? 200)));
  const scaleX = Number(path.geometry.scaleX ?? 1);
  const scaleY = Number(path.geometry.scaleY ?? 1);
  const originX = Number(path.transform.x ?? 0);
  const originY = Number(path.transform.y ?? 0);
  const rawPoints: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const alpha = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    const t = Number(range[0]) + (Number(range[1]) - Number(range[0])) * alpha;
    rawPoints.push({
      x: originX + t * scaleX,
      y: originY - evaluateGraphExpression(fnExpr, t, state, lineNumber) * scaleY,
    });
  }
  const sourcePoints = sampleSmoothPathPoints(rawPoints, 8);
  const cumulative = [0];
  for (let index = 1; index < sourcePoints.length; index += 1) {
    const previous = sourcePoints[index - 1]!;
    const current = sourcePoints[index]!;
    cumulative.push(cumulative[index - 1]! + Math.hypot(current.x - previous.x, current.y - previous.y));
  }
  const total = cumulative[cumulative.length - 1]!;
  if (total <= 0) return sourcePoints.slice(0, 1);
  const output: Array<{ x: number; y: number }> = [];
  let sourceIndex = 1;
  for (let index = 0; index <= segments; index += 1) {
    const targetLength = (total * index) / segments;
    while (sourceIndex < cumulative.length - 1 && cumulative[sourceIndex]! < targetLength) sourceIndex += 1;
    const previousLength = cumulative[sourceIndex - 1]!;
    const nextLength = cumulative[sourceIndex]!;
    const previous = sourcePoints[sourceIndex - 1]!;
    const next = sourcePoints[sourceIndex]!;
    const localAlpha = nextLength === previousLength ? 0 : (targetLength - previousLength) / (nextLength - previousLength);
    output.push({
      x: previous.x + (next.x - previous.x) * localAlpha,
      y: previous.y + (next.y - previous.y) * localAlpha,
    });
  }
  return output;
}

function pushRotating(
  state: CompileState,
  start: number,
  call: PlayCall,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  if (
    call.args.length < 1 ||
    call.args.length > 2 ||
    call.args.some((arg) => typeof arg !== "string")
  )
    throw new DslCompileError(
      `Expected ${call.name}(id[, angle], about=(x,y)).`,
      lineNumber,
    );

  const id = call.args[0] as string;
  const node = requireNode(state, id, lineNumber);
  let angle = call.args[1] === undefined ? Math.PI * 2 : parseNumber(call.args[1] as string, lineNumber);
  let aboutX = Number(node.transform.x ?? 0);
  let aboutY = Number(node.transform.y ?? 0);

  for (const [key, value] of call.options) {
    if (key === "angle") angle = parseNumber(value, lineNumber);
    else if (key === "about" || key === "aboutPoint" || key === "about_point") {
      [aboutX, aboutY] = parseRotatingAboutPoint(value, lineNumber);
    } else if (key === "axis") {
      if (value !== "OUT")
        throw new DslCompileError(
          "Rotating currently supports only the OUT axis.",
          lineNumber,
        );
    } else {
      throw new DslCompileError(
        `Unknown ${call.name} option '${key}'.`,
        lineNumber,
      );
    }
  }

  const trackerId = `__rotating_${id}_${state.timeline.length}`;
  const fromX = Number(node.transform.x ?? 0);
  const fromY = Number(node.transform.y ?? 0);
  const fromRotation = Number(node.transform.rotation ?? 0);
  const angleExpr = `(-${trackerId})`;
  state.values.set(trackerId, 0);
  state.timeline.push({
    t: start,
    op: "bindExpr",
    id,
    path: "transform.x",
    expr: rotatedPointExpression("x", fromX, fromY, aboutX, aboutY, angleExpr),
    duration,
    deps: [trackerId],
  });
  state.timeline.push({
    t: start,
    op: "bindExpr",
    id,
    path: "transform.y",
    expr: rotatedPointExpression("y", fromX, fromY, aboutX, aboutY, angleExpr),
    duration,
    deps: [trackerId],
  });
  state.timeline.push({
    t: start,
    op: "animateValue",
    id: trackerId,
    from: 0,
    to: angle,
    duration,
    easing,
  });
  state.timeline.push({
    t: start,
    op: "animate",
    id,
    path: "transform.rotation",
    from: fromRotation,
    to: fromRotation - angle * (180 / Math.PI),
    duration,
    easing,
  });
  const finalX = aboutX + (fromX - aboutX) * Math.cos(angle) + (fromY - aboutY) * Math.sin(angle);
  const finalY = aboutY - (fromX - aboutX) * Math.sin(angle) + (fromY - aboutY) * Math.cos(angle);
  node.transform.x = finalX;
  node.transform.y = finalY;
  node.transform.rotation = fromRotation - angle * (180 / Math.PI);
  state.timeline.push({
    t: start + duration,
    op: "set",
    id,
    path: "transform.x",
    value: finalX,
  });
  state.timeline.push({
    t: start + duration,
    op: "set",
    id,
    path: "transform.y",
    value: finalY,
  });
}

function parseRotatingAboutPoint(raw: string, lineNumber: number): [number, number] {
  const trimmed = raw.trim();
  const wrapped = trimmed.match(/^[([](.+)[)\]]$/u);
  if (wrapped) return parsePointOption(wrapped[1]!, "about", lineNumber);
  try {
    const direction = parseDirectionVector(trimmed, lineNumber);
    return [direction.x, direction.y];
  } catch {
    return parsePointOption(trimmed, "about", lineNumber);
  }
}

function pushFadeOut(
  state: CompileState,
  start: number,
  id: string,
  duration: number,
  easing: string,
  lineNumber: number,
  shift: { x: number; y: number } = { x: 0, y: 0 },
): void {
  const node = requireNode(state, id, lineNumber);
  const fromOpacity = state.shown.has(id)
    ? fadeInTargetOpacity(node)
    : node.transform.opacity;
  state.timeline.push({
    t: start,
    op: "effect",
    id,
    effect: "fadeOut",
    duration,
    easing,
  });
  state.timeline.push({
    t: start,
    op: "animate",
    id,
    path: "transform.opacity",
    from: fromOpacity,
    to: 0,
    duration,
    easing,
  });
  if (shift.x !== 0)
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "transform.x",
      from: node.transform.x,
      to: node.transform.x + shift.x,
      duration,
      easing,
    });
  if (shift.y !== 0)
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "transform.y",
      from: node.transform.y,
      to: node.transform.y + shift.y,
      duration,
      easing,
    });
  state.timeline.push({ t: start + duration, op: "delete", id });
  state.shown.delete(id);
}

function parseAnimate(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  fallbackStart: number,
): void {
  const target = tokens[1];
  if (!target)
    throw new DslCompileError("Expected target after animate.", lineNumber);

  const [id, property] = splitTargetPath(target);
  const isTrackerTarget = !property && state.values.has(target);
  const isCameraTarget = id === "camera" && isCameraProperty(property);
  if (!isTrackerTarget && !isCameraTarget) {
    if (!id || !property)
      throw new DslCompileError(
        "Expected animate target like 'c1.x', 'camera.x', or a declared value tracker id.",
        lineNumber,
      );
    if (!findNode(state, id))
      throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  }

  const fromIndex = tokens.indexOf("from");
  const toIndex = tokens.indexOf("to");
  if (fromIndex === -1 || toIndex === -1 || toIndex <= fromIndex + 1) {
    throw new DslCompileError(
      "Expected animate syntax: animate id.property from A to B duration=1s.",
      lineNumber,
    );
  }

  const fromRaw = tokens[fromIndex + 1];
  const toRaw = tokens[toIndex + 1];
  if (!fromRaw || !toRaw)
    throw new DslCompileError("Expected from and to values.", lineNumber);
  const from = parseValue(fromRaw, lineNumber);
  const to = parseValue(toRaw, lineNumber);
  let start = fallbackStart;
  let duration = 1;
  let easing = "smooth";

  for (const [key, value] of readAssignments(
    tokens.slice(toIndex + 2),
    lineNumber,
  )) {
    if (key === "start") start = parseSeconds(value, lineNumber);
    else if (key === "duration") duration = parseSeconds(value, lineNumber);
    else if (key === "easing") easing = parseEasing(value, lineNumber);
    else
      throw new DslCompileError(
        `Unknown animation option '${key}'.`,
        lineNumber,
      );
  }

  if (isTrackerTarget) {
    if (typeof from !== "number" || typeof to !== "number")
      throw new DslCompileError(
        "Value tracker animations require numeric from/to values.",
        lineNumber,
      );
    state.timeline.push({
      t: start,
      op: "animateValue",
      id: target,
      from,
      to,
      duration,
      easing,
    });
    return;
  }

  state.timeline.push({
    t: start,
    op: "animate",
    id: id!,
    path: isCameraTarget ? cameraPropertyPath(property!) : propertyPath(property!),
    from,
    to,
    duration,
    easing,
  });
}

function parseAnimateFrame(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  fallbackStart: number,
): void {
  const toIndex = tokens.indexOf("to");
  if (toIndex === -1 || !tokens[toIndex + 1])
    throw new DslCompileError(
      "Expected animateFrame syntax: animateFrame to x,y scale=1.5 duration=1s.",
      lineNumber,
    );

  const [x, y] = tokens[toIndex + 1]!
    .split(",")
    .map((item) => parseNumber(item, lineNumber));
  if (x === undefined || y === undefined || Number.isNaN(x) || Number.isNaN(y))
    throw new DslCompileError("Expected animateFrame target x,y.", lineNumber);

  let start = fallbackStart;
  let duration = 1;
  let easing = "smooth";
  const target: CameraFrameCursor = {
    ...state.cameraFrameCursor,
    x,
    y,
  };

  for (const [key, value] of readAssignments(
    tokens.slice(toIndex + 2),
    lineNumber,
  )) {
    if (key === "start") start = parseSeconds(value, lineNumber);
    else if (key === "duration") duration = parseSeconds(value, lineNumber);
    else if (key === "easing") easing = parseEasing(value, lineNumber);
    else if (key === "scale" || key === "rotation")
      target[key] = parseNumber(value, lineNumber);
    else
      throw new DslCompileError(
        `Unknown animateFrame option '${key}'.`,
        lineNumber,
      );
  }

  pushCameraFrameAnimations(
    state,
    start,
    state.cameraFrameCursor,
    target,
    duration,
    easing,
  );
  state.cameraFrameCursor = target;
}

function parseFollowCamera(
  tokens: string[],
  state: CompileState,
  lineNumber: number,
  fallbackStart: number,
): void {
  let targetId = tokens[1];
  let start = fallbackStart;
  let duration: number | undefined;
  const optionStart = targetId?.includes("=") ? 1 : 2;

  for (const [key, value] of readAssignments(tokens.slice(optionStart), lineNumber)) {
    if (key === "target") targetId = value;
    else if (key === "start") start = parseSeconds(value, lineNumber);
    else if (key === "duration") duration = parseSeconds(value, lineNumber);
    else
      throw new DslCompileError(
        `Unknown followCamera option '${key}'.`,
        lineNumber,
      );
  }

  if (!targetId)
    throw new DslCompileError("Expected followCamera target id.", lineNumber);
  if (!findNode(state, targetId))
    throw new DslCompileError(`Unknown followCamera target '${targetId}'.`, lineNumber);

  state.timeline.push({
    t: start,
    op: "followCamera",
    id: targetId,
    ...(duration === undefined ? {} : { duration }),
  });
  state.camera.mode = "target";
}

function pushCameraFrameAnimations(
  state: CompileState,
  start: number,
  from: CameraFrameCursor,
  to: CameraFrameCursor,
  duration: number,
  easing: string,
): void {
  for (const key of ["x", "y", "scale", "rotation"] as const) {
    state.timeline.push({
      t: start,
      op: "animate",
      id: "camera",
      path: cameraPropertyPath(key),
      from: from[key],
      to: to[key],
      duration,
      easing,
    });
  }
}

function requireNode(
  state: CompileState,
  id: string,
  lineNumber: number,
): SceneNode {
  const node = findNode(state, id);
  if (!node) throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  return node;
}

function splitTargetPath(target: string): [string | undefined, string | undefined] {
  const dotIndex = target.indexOf(".");
  if (dotIndex === -1) return [target, undefined];
  return [target.slice(0, dotIndex), target.slice(dotIndex + 1)];
}

function findNode(state: CompileState, id: string): SceneNode | undefined {
  const root = state.nodes.get(id);
  if (root) return root;
  for (const node of state.nodes.values()) {
    const found = findNodeInTree(node, id);
    if (found) return found;
  }
  return undefined;
}

function findNodeInTree(node: SceneNode, id: string): SceneNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNodeInTree(child, id);
    if (found) return found;
  }
  return undefined;
}

function approximateNodeBounds(node: SceneNode): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const childBounds = (node.children ?? [])
    .map((child) => approximateNodeBounds(child))
    .filter((bounds) => Number.isFinite(bounds.minX));
  if (childBounds.length > 0) {
    return offsetBounds(
      unionBounds(childBounds),
      Number(node.transform.x ?? 0),
      Number(node.transform.y ?? 0),
    );
  }

  const x = Number(node.transform.x ?? 0);
  const y = Number(node.transform.y ?? 0);
  const scale = Number(node.transform.scale ?? 1);
  const scaleX = scale * Number(node.transform.scaleX ?? 1);
  const scaleY = scale * Number(node.transform.scaleY ?? 1);
  if (node.type === "circle") {
    const r = Number(node.geometry.r ?? 40) * Math.max(scaleX, scaleY);
    return { minX: x - r, maxX: x + r, minY: y - r, maxY: y + r };
  }
  if (node.type === "line") {
    const x1 = Number(node.geometry.x1 ?? 0) * scaleX;
    const x2 = Number(node.geometry.x2 ?? 0) * scaleX;
    const y1 = Number(node.geometry.y1 ?? 0) * scaleY;
    const y2 = Number(node.geometry.y2 ?? 0) * scaleY;
    return {
      minX: x + Math.min(x1, x2),
      maxX: x + Math.max(x1, x2),
      minY: y + Math.min(y1, y2),
      maxY: y + Math.max(y1, y2),
    };
  }
  const fontSize = Number(node.geometry.fontSize ?? 32);
  const contentLength = node.type === "math"
    ? String(node.latex ?? "").length
    : String(node.text ?? "").length;
  const fallbackWidth = Math.max(fontSize * 2, contentLength * fontSize * 0.55);
  const fallbackHeight = node.type === "math" ? fontSize * 2.5 : fontSize * 1.5;
  const w = Number(node.geometry.w ?? fallbackWidth) * scaleX;
  const h = Number(node.geometry.h ?? fallbackHeight) * scaleY;
  return { minX: x - w / 2, maxX: x + w / 2, minY: y - h / 2, maxY: y + h / 2 };
}

function unionBounds(
  bounds: Array<{ minX: number; maxX: number; minY: number; maxY: number }>,
): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: Math.min(...bounds.map((item) => item.minX)),
    maxX: Math.max(...bounds.map((item) => item.maxX)),
    minY: Math.min(...bounds.map((item) => item.minY)),
    maxY: Math.max(...bounds.map((item) => item.maxY)),
  };
}

function offsetBounds(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  x: number,
  y: number,
): { minX: number; maxX: number; minY: number; maxY: number } {
  return {
    minX: bounds.minX + x,
    maxX: bounds.maxX + x,
    minY: bounds.minY + y,
    maxY: bounds.maxY + y,
  };
}

function hiddenClone(node: SceneNode): SceneNode {
  const clone = structuredClone(node);
  clone.transform.opacity = 0;
  return clone;
}

function visibleZeroOpacityClone(node: SceneNode): SceneNode {
  const clone = structuredClone(node);
  revealZeroOpacityNodes(clone);
  return clone;
}

function revealZeroOpacityNodes(node: SceneNode): void {
  node.transform.opacity = fadeInTargetOpacity(node);
  for (const child of node.children ?? []) revealZeroOpacityNodes(child);
}

function hiddenWritableClone(node: SceneNode): SceneNode {
  const clone = visibleZeroOpacityClone(node);
  hideWritableNodes(clone);
  return clone;
}

function hiddenDrawableClone(node: SceneNode): SceneNode {
  const clone = visibleZeroOpacityClone(node);
  hideDrawableNodes(clone);
  return clone;
}

function hideDrawableNodes(node: SceneNode): void {
  if ((node.children ?? []).length === 0) {
    if (supportsDrawProgress(node)) node.geometry.drawProgress = 0;
    else node.transform.opacity = 0;
    return;
  }
  node.transform.opacity = fadeInTargetOpacity(node);
  for (const child of node.children) hideDrawableNodes(child);
}

function hideWritableNodes(node: SceneNode): void {
  if ((node.children ?? []).length === 0) {
    if (supportsWriteProgress(node)) node.geometry.writeProgress = 0;
    else node.transform.opacity = 0;
    return;
  }
  node.transform.opacity = fadeInTargetOpacity(node);
  for (const child of node.children) hideWritableNodes(child);
}

function writableNodes(node: SceneNode): SceneNode[] {
  if ((node.children ?? []).length === 0) return [node];
  return node.children.flatMap((child) => writableNodes(child));
}

function leafNodes(node: SceneNode): SceneNode[] {
  if ((node.children ?? []).length === 0) return [node];
  return node.children.flatMap((child) => leafNodes(child));
}

function pushWrite(
  state: CompileState,
  start: number,
  id: string,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const node = requireNode(state, id, lineNumber);
  const leaves = writableNodes(node);
  const segments = writeSegments(leaves, duration);
  state.timeline.push({
    t: start,
    op: "create",
    node: hiddenWritableClone(node),
  });
  state.timeline.push({
    t: start,
    op: "effect",
    id,
    effect: "write",
    duration,
    easing,
  });
  segments.forEach(({ node: leaf, offset, segmentDuration }) => {
    const path = supportsWriteProgress(leaf)
      ? "geometry.writeProgress"
      : "transform.opacity";
    const to = supportsWriteProgress(leaf) ? 1 : leaf.transform.opacity;
    state.timeline.push({
      t: start + offset,
      op: "animate",
      id: leaf.id,
      path,
      from: 0,
      to,
      duration: segmentDuration,
      easing,
    });
  });
  state.shown.add(id);
}

function writeSegments(
  leaves: SceneNode[],
  duration: number,
): Array<{ node: SceneNode; offset: number; segmentDuration: number }> {
  if (leaves.length === 0) return [];
  const entries = leaves
    .map((node) => {
      const bounds = approximateNodeBounds(node);
      return {
        node,
        bounds,
        width: Math.max(1, bounds.maxX - bounds.minX),
      };
    })
    .sort((left, right) => left.bounds.minX - right.bounds.minX);
  const totalWidth = entries.reduce((sum, entry) => sum + entry.width, 0);
  const overlap = duration * 0.08;
  const offsetSpan = Math.max(0, duration - overlap);
  let cursor = 0;

  return entries.map((entry) => {
    const offset = totalWidth <= 0 ? 0 : (cursor / totalWidth) * offsetSpan;
    const proportionalDuration =
      totalWidth <= 0 ? duration : (entry.width / totalWidth) * duration;
    const segmentDuration = Math.max(
      0,
      Math.min(duration - offset, proportionalDuration + overlap),
    );
    cursor += entry.width;
    return { node: entry.node, offset, segmentDuration };
  });
}

function supportsWriteProgress(node: SceneNode): boolean {
  return node.type === "math" || node.type === "text";
}

function pushCreate(
  state: CompileState,
  start: number,
  id: string,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const node = requireNode(state, id, lineNumber);
  const createNode = hiddenDrawableClone(node);
  const sourceLeaves = leafNodes(visibleZeroOpacityClone(node));
  const createLeaves = leafNodes(createNode);
  state.timeline.push({
    t: start,
    op: "create",
    node: createNode,
  });
  state.timeline.push({
    t: start,
    op: "effect",
    id,
    effect: "create",
    duration,
    easing,
  });
  if (createLeaves.length > 0) {
    const segments = createSegments(createLeaves, duration);
    segments.forEach(({ node: leaf, index, offset, segmentDuration }) => {
      const sourceLeaf = sourceLeaves[index] ?? leaf;
      const isDrawable = supportsDrawProgress(leaf);
      state.timeline.push({
        t: start + offset,
        op: "animate",
        id: leaf.id,
        path: isDrawable ? "geometry.drawProgress" : "transform.opacity",
        from: 0,
        to: isDrawable ? 1 : fadeInTargetOpacity(sourceLeaf),
        duration: segmentDuration,
        easing,
      });
    });
  } else {
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "transform.opacity",
      from: 0,
      to: fadeInTargetOpacity(node),
      duration,
      easing,
    });
  }
  state.shown.add(id);
}

function pushUncreate(
  state: CompileState,
  start: number,
  id: string,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const node = requireNode(state, id, lineNumber);
  const leaves = leafNodes(visibleZeroOpacityClone(node));
  state.timeline.push({
    t: start,
    op: "effect",
    id,
    effect: "uncreate",
    duration,
    easing,
  });
  if (leaves.length > 0) {
    const segments = createSegments(leaves, duration);
    segments.forEach(({ node: leaf, offset, segmentDuration }) => {
      const isDrawable = supportsDrawProgress(leaf);
      state.timeline.push({
        t: start + offset,
        op: "animate",
        id: leaf.id,
        path: isDrawable ? "geometry.drawProgress" : "transform.opacity",
        from: isDrawable ? 1 : fadeInTargetOpacity(leaf),
        to: 0,
        duration: segmentDuration,
        easing,
      });
    });
  } else {
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "transform.opacity",
      from: fadeInTargetOpacity(node),
      to: 0,
      duration,
      easing,
    });
  }
  state.timeline.push({ t: start + duration, op: "delete", id });
  state.shown.delete(id);
}

function supportsDrawProgress(node: SceneNode): boolean {
  return (
    node.type === "line" ||
    node.type === "path" ||
    node.type === "circle" ||
    node.type === "rect" ||
    node.type === "triangle" ||
    node.geometry.shapeMatcher === "surroundingRect"
  );
}

function createSegments(
  leaves: SceneNode[],
  duration: number,
): Array<{ node: SceneNode; index: number; offset: number; segmentDuration: number }> {
  if (leaves.length === 0) return [];
  const entries = leaves.map((node, index) => {
    const bounds = approximateNodeBounds(node);
    return {
      node,
      index,
      width: Math.max(1, bounds.maxX - bounds.minX),
    };
  });
  const totalWidth = entries.reduce((sum, entry) => sum + entry.width, 0);
  const overlap = duration * 0.08;
  const offsetSpan = Math.max(0, duration - overlap);
  let cursor = 0;

  return entries.map((entry) => {
    const offset = totalWidth <= 0 ? 0 : (cursor / totalWidth) * offsetSpan;
    const proportionalDuration =
      totalWidth <= 0 ? duration : (entry.width / totalWidth) * duration;
    const segmentDuration = Math.max(
      0,
      Math.min(duration - offset, proportionalDuration + overlap),
    );
    cursor += entry.width;
    return { ...entry, offset, segmentDuration };
  });
}

function pushTransformAnimations(
  state: CompileState,
  start: number,
  fromNode: SceneNode,
  toNode: SceneNode,
  duration: number,
  easing: string,
): void {
  const visibleToNode = visibleZeroOpacityClone(toNode);
  const finish = start + duration;
  for (const key of ["x", "y", "scale", "rotation", "opacity"] as const) {
    if (fromNode.transform[key] !== visibleToNode.transform[key]) {
      state.timeline.push({
        t: start,
        op: "animate",
        id: fromNode.id,
        path: `transform.${key}`,
        from: fromNode.transform[key],
        to: visibleToNode.transform[key],
        duration,
        easing,
      });
    }
  }

  for (const key of new Set([
    ...Object.keys(fromNode.style),
    ...Object.keys(visibleToNode.style),
  ])) {
    const from = fromNode.style[key as keyof Style];
    const to = visibleToNode.style[key as keyof Style];
    if (from !== to)
      state.timeline.push({
        t: start,
        op: "animate",
        id: fromNode.id,
        path: `style.${key}`,
        from,
        to,
        duration,
        easing,
      });
  }

  for (const key of new Set([
    ...Object.keys(fromNode.geometry),
    ...Object.keys(visibleToNode.geometry),
  ])) {
    const from = fromNode.geometry[key];
    const to = visibleToNode.geometry[key];
    if (JSON.stringify(from) !== JSON.stringify(to))
      state.timeline.push({
        t: start,
        op: "animate",
        id: fromNode.id,
        path: `geometry.${key}`,
        from,
        to,
        duration,
        easing,
      });
  }

  for (const key of ["text", "latex", "renderer"] as const) {
    if (fromNode[key] !== visibleToNode[key]) {
      state.timeline.push({
        t: finish,
        op: "set",
        id: fromNode.id,
        path: key,
        value: visibleToNode[key],
      });
    }
  }
}

function readExpressionAssignment(
  token: string,
  state: CompileState,
  lineNumber: number,
): string | null {
  if (!token.startsWith("expr=")) return null;
  const [key, expression] = readAssignment(token, lineNumber);
  if (key !== "expr") return null;
  validateDslExpression(expression, state, lineNumber);
  return expression;
}

function validateDslExpression(
  expression: string,
  state: CompileState,
  lineNumber: number,
): void {
  try {
    validateExpression(expression, state.values.keys());
  } catch (error) {
    if (error instanceof ExpressionError)
      throw new DslCompileError(
        `Invalid expression: ${error.message}`,
        lineNumber,
      );
    throw error;
  }
}

function evaluateDslExpression(
  expression: string,
  state: CompileState,
  lineNumber: number,
): number {
  try {
    return evaluateExpression(expression, Object.fromEntries(state.values));
  } catch (error) {
    if (error instanceof ExpressionError)
      throw new DslCompileError(
        `Invalid expression: ${error.message}`,
        lineNumber,
      );
    throw error;
  }
}
