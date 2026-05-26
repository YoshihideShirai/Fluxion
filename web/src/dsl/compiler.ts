import type {
  SceneNode,
  Style,
  TimelineOperation,
  FluxionDocument,
  Camera,
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

export { DslCompileError } from "./errors.js";

interface CompileState {
  width: number;
  height: number;
  fps: number;
  camera: Camera;
  cameraFrameCursor: CameraFrameCursor;
  nodes: Map<string, SceneNode>;
  values: Map<string, number>;
  timeline: TimelineOperation[];
  shown: Set<string>;
  rootIds: Set<string>;
  currentTime: number;
  blockTime: number | null;
  braceTargetRefs: Array<{ braceId: string; targetId: string; lineNumber: number }>;
}

interface CameraFrameCursor {
  x: number;
  y: number;
  scale: number;
  rotation: number;
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
    values: new Map(),
    timeline: [],
    shown: new Set(),
    rootIds: new Set(),
    currentTime: 0,
    blockTime: null,
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

    if (
      keyword === "circle" ||
      keyword === "rect" ||
      keyword === "triangle" ||
      keyword === "line" ||
      keyword === "path" ||
      keyword === "text" ||
      keyword === "math" ||
      keyword === "brace" ||
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

    if (keyword === "plot") {
      parsePlot(tokens, state, lineNumber);
      return;
    }

    if (keyword === "dataPolygon") {
      parseDataPolygon(tokens, state, lineNumber);
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
      autoCreates.push({ t: 0, op: "create", node: structuredClone(node) });
      state.shown.add(node.id);
    }
  }

  state.timeline = [...autoCreates, ...state.timeline];
  state.timeline.sort((a, b) => a.t - b.t);
  const duration = Math.max(
    0,
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
  const xRange = (options.get("xRange") ?? "-5,5").split(",").map((v) => parseNumber(v, lineNumber));
  const yRange = (options.get("yRange") ?? "-3,3").split(",").map((v) => parseNumber(v, lineNumber));
  const width = parseNumber(options.get("width") ?? "760", lineNumber);
  const height = parseNumber(options.get("height") ?? "360", lineNumber);
  const stroke = options.get("stroke") ?? "#94a3b8";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "3", lineNumber);

  const xAxis = createBaseNode(`${id}_x`, "line");
  xAxis.transform.x = cx!; xAxis.transform.y = cy!;
  xAxis.geometry.x1 = -width / 2; xAxis.geometry.y1 = 0; xAxis.geometry.x2 = width / 2; xAxis.geometry.y2 = 0;
  xAxis.style.stroke = stroke; xAxis.style.strokeWidth = strokeWidth;

  const yAxis = createBaseNode(`${id}_y`, "line");
  yAxis.transform.x = cx!; yAxis.transform.y = cy!;
  yAxis.geometry.x1 = 0; yAxis.geometry.y1 = -height / 2; yAxis.geometry.x2 = 0; yAxis.geometry.y2 = height / 2;
  yAxis.style.stroke = stroke; yAxis.style.strokeWidth = strokeWidth;

  const group = createBaseNode(id, "group");
  group.children = [xAxis, yAxis];
  group.metadata = { plot: { range: [xRange[0]!, xRange[1]!] } };
  group.geometry.xMin = xRange[0]!;
  group.geometry.xMax = xRange[1]!;
  group.geometry.yMin = yRange[0]!;
  group.geometry.yMax = yRange[1]!;
  group.geometry.width = width;
  group.geometry.height = height;
  group.geometry.centerX = cx!;
  group.geometry.centerY = cy!;
  state.nodes.set(id, group);
  state.rootIds.add(id);
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

  const xMin = Number(axes.geometry.xMin);
  const xMax = Number(axes.geometry.xMax);
  const yMin = Number(axes.geometry.yMin);
  const yMax = Number(axes.geometry.yMax);
  const width = Number(axes.geometry.width);
  const height = Number(axes.geometry.height);
  const centerX = Number(axes.geometry.centerX ?? axes.transform.x);
  const centerY = Number(axes.geometry.centerY ?? axes.transform.y);
  const points = parseDataPointList(pointsRaw, lineNumber).map(([x, y]) => ({
    x: ((x - xMin) / (xMax - xMin) - 0.5) * width,
    y: ((y - yMin) / (yMax - yMin) - 0.5) * height,
  }));

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

function parseDataPointList(raw: string, lineNumber: number): Array<[number, number]> {
  const points = raw.split(";").map((point) => {
    const [xRaw, yRaw] = point.split(",");
    if (xRaw === undefined || yRaw === undefined)
      throw new DslCompileError("Expected dataPolygon points as x,y;x,y;...", lineNumber);
    return [parseNumber(xRaw, lineNumber), parseNumber(yRaw, lineNumber)] as [number, number];
  });
  if (points.length < 3)
    throw new DslCompileError("dataPolygon requires at least three points.", lineNumber);
  return points;
}

function formatPathNumber(value: number): string {
  return String(Number(value.toFixed(6)));
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
  const tipLength = parseNumber(options.get("tipLength") ?? "24", lineNumber);
  const tipWidth = parseNumber(options.get("tipWidth") ?? "20", lineNumber);
  const stroke = options.get("stroke") ?? "#ffffff";
  const fill = options.get("fill") ?? stroke;
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "4", lineNumber);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  const baseX = x2 - ux * tipLength;
  const baseY = y2 - uy * tipLength;

  const shaft = createBaseNode(`${id}:shaft`, "line");
  shaft.geometry.x1 = x1;
  shaft.geometry.y1 = y1;
  shaft.geometry.x2 = baseX;
  shaft.geometry.y2 = baseY;
  shaft.style.fill = "none";
  shaft.style.stroke = stroke;
  shaft.style.strokeWidth = strokeWidth;

  const tip = createBaseNode(`${id}:tip`, "path");
  tip.geometry.d = [
    `M ${formatPathNumber(x2)} ${formatPathNumber(y2)}`,
    `L ${formatPathNumber(baseX + px * tipWidth / 2)} ${formatPathNumber(baseY + py * tipWidth / 2)}`,
    `L ${formatPathNumber(baseX - px * tipWidth / 2)} ${formatPathNumber(baseY - py * tipWidth / 2)}`,
    "Z",
  ].join(" ");
  tip.style.fill = fill;
  tip.style.stroke = fill;
  tip.style.strokeWidth = 0;

  const group = createBaseNode(id, "group");
  group.children = [shaft, tip];
  group.geometry.arrow = true;
  group.geometry.x1 = x1;
  group.geometry.y1 = y1;
  group.geometry.x2 = x2;
  group.geometry.y2 = y2;
  group.geometry.tipLength = tipLength;
  group.geometry.tipWidth = tipWidth;
  for (const [key, value] of options) {
    if (["x1", "y1", "x2", "y2", "tipLength", "tipWidth", "stroke", "fill", "strokeWidth"].includes(key)) continue;
    applyNodeOption(group, key, value, lineNumber);
  }

  state.nodes.set(id, group);
  state.rootIds.add(id);
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
  node.metadata = { plot: { range: [r0!, r1!], samples } };
  const d = buildPathDataPreview(pathOp, state);
  node.geometry.d = d;
  state.nodes.set(id, node);
  state.rootIds.add(id);
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

  const node = createBaseNode(id, "path");
  node.style.fill = "none";
  node.style.stroke = "#f59e0b";
  node.style.strokeWidth = 4;
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

  const node = createBaseNode(id, "path");
  node.style.fill = "none";
  node.style.stroke = "#22d3ee";
  node.style.strokeWidth = 4;
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

function buildPathDataPreview(op: { samples:number; tMinExpr:string; tMaxExpr:string; xExpr:string; yExpr:string; close?:boolean }, state: CompileState): string {
  const vars = Object.fromEntries([...state.values].map(([k,v])=>[k,v]));
  const tMin = evaluateExpression(op.tMinExpr, vars);
  const tMax = evaluateExpression(op.tMaxExpr, vars);
  const pts:string[]=[];
  for (let i=0;i<op.samples;i++){
    const u = op.samples===1?0:i/(op.samples-1);
    const t = tMin + (tMax-tMin)*u;
    const scope={...vars,t};
    const x = evaluateExpression(op.xExpr, scope);
    const y = evaluateExpression(op.yExpr, scope);
    pts.push(`${i===0?'M':'L'} ${x} ${y}`);
  }
  if (op.close) pts.push('Z');
  return pts.join(' ');
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

function statementTime(state: CompileState): number {
  return state.blockTime ?? state.currentTime;
}

function advanceStatementTime(state: CompileState, duration: number): void {
  if (state.blockTime === null) state.currentTime += duration;
  else state.blockTime += duration;
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
  const a = measureNode(node);
  const b = measureNode(target);
  if (direction === "right") pushSet(state, time, node.id, "transform.x", target.transform.x + b.w/2 + a.w/2 + buff);
  else if (direction === "left") pushSet(state, time, node.id, "transform.x", target.transform.x - b.w/2 - a.w/2 - buff);
  else if (direction === "up") pushSet(state, time, node.id, "transform.y", target.transform.y + b.h/2 + a.h/2 + buff);
  else pushSet(state, time, node.id, "transform.y", target.transform.y - b.h/2 - a.h/2 - buff);
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
  const [id, property] = target.split(".");
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
  const [id, property] = target.split(".");
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
  state.timeline.push({
    t: time,
    op: "bindExpr",
    id,
    path: isCameraTarget ? cameraPropertyPath(property) : propertyPath(property),
    expr: expression,
    deps: collectExpressionDependencies(expression).filter((name) => state.values.has(name)),
  });
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
  let color: string | undefined;
  for (const [key, value] of readAssignments(optionTokens, lineNumber)) {
    if (key === "duration") duration = parseSeconds(value, lineNumber);
    else if (key === "easing") easing = parseEasing(value, lineNumber);
    else if (key === "color") color = value;
    else throw new DslCompileError(`Unknown play option '${key}'.`, lineNumber);
  }

  emitPlayCall(state, call, statementTime(state), duration, easing, lineNumber, color);
  if (state.blockTime === null) advanceStatementTime(state, duration);
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
    ensureNoPlayOptions(call, lineNumber);
    const id = expectPlayArg(call, 1, lineNumber);
    pushFadeIn(state, start, id, duration, easing, lineNumber);
    return;
  }

  if (call.name === "FadeOut") {
    ensureNoPlayOptions(call, lineNumber);
    const id = expectPlayArg(call, 1, lineNumber);
    pushFadeOut(state, start, id, duration, easing, lineNumber);
    return;
  }

  if (call.name === "ReplacementTransform") {
    ensureNoPlayOptions(call, lineNumber);
    const ids = expectPlayIdArgs(call, 2, lineNumber);
    const fromId = ids[0]!;
    const toId = ids[1]!;
    pushFadeOut(state, start, fromId, duration, easing, lineNumber);
    pushFadeIn(state, start, toId, duration, easing, lineNumber);
    return;
  }

  if (call.name === "Create") {
    ensureNoPlayOptions(call, lineNumber);
    const id = expectPlayArg(call, 1, lineNumber);
    pushCreate(state, start, id, duration, easing, lineNumber);
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
    state.timeline.push({
      t: start,
      op: "effect",
      id: fromId,
      effect: "transform",
      duration,
      easing,
    });
    pushTransformAnimations(state, start, fromNode, toNode, duration, easing);
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
  const fromTokens = texTokenChildren(fromNode);
  const toTokens = texTokenChildren(toNode);
  if (fromTokens.length === 0 || toTokens.length === 0)
    throw new DslCompileError(
      "TransformMatchingTex requires math nodes declared with expandTokens=true.",
      lineNumber,
    );

  const available = new Map<string, SceneNode[]>();
  for (const child of toTokens) {
    if (!child.latex) continue;
    const matches = available.get(child.latex) ?? [];
    matches.push(child);
    available.set(child.latex, matches);
  }

  const matchedTo = new Set<string>();
  for (const child of fromTokens) {
    const matches = child.latex ? available.get(child.latex) : undefined;
    // Duplicate-token priority rule (Manim-compatible enough for stable output):
    // match each source token to the earliest still-unmatched target token with
    // the same LaTeX string, scanning strictly left-to-right.
    const match = matches?.shift();
    if (match) {
      matchedTo.add(match.id);
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
        retargetTokenNode(match, fromNode, toNode),
        duration,
        easing,
      );
    } else {
      pushFadeOutNode(state, start, child, duration, easing);
    }
  }

  for (const child of toTokens) {
    if (!matchedTo.has(child.id))
      pushFadeInNode(
        state,
        start,
        absolutizeTokenNode(child, toNode),
        duration,
        easing,
      );
  }

  state.shown.add(toId);
}

function texTokenChildren(node: SceneNode): SceneNode[] {
  return node.children.filter(
    (child) => child.type === "math" && typeof child.latex === "string",
  );
}

function retargetTokenNode(
  targetChild: SceneNode,
  sourceParent: SceneNode,
  targetParent: SceneNode,
): SceneNode {
  const clone = structuredClone(targetChild);
  clone.transform.x += targetParent.transform.x - sourceParent.transform.x;
  clone.transform.y += targetParent.transform.y - sourceParent.transform.y;
  clone.transform.rotation +=
    targetParent.transform.rotation - sourceParent.transform.rotation;
  clone.transform.scale *= safeRatio(
    targetParent.transform.scale,
    sourceParent.transform.scale,
  );
  clone.transform.opacity *= safeRatio(
    targetParent.transform.opacity,
    sourceParent.transform.opacity,
  );
  return clone;
}

function absolutizeTokenNode(child: SceneNode, parent: SceneNode): SceneNode {
  const clone = structuredClone(child);
  clone.transform.x += parent.transform.x;
  clone.transform.y += parent.transform.y;
  clone.transform.rotation += parent.transform.rotation;
  clone.transform.scale *= parent.transform.scale;
  clone.transform.opacity *= parent.transform.opacity;
  return clone;
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
): void {
  const sourceNode = visibleZeroOpacityClone(requireNode(state, id, lineNumber));
  const node = hiddenClone(sourceNode);
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
  state.shown.add(id);
}

function fadeInTargetOpacity(node: SceneNode): number {
  return node.transform.opacity > 0 ? node.transform.opacity : 1;
}

function pushFadeOut(
  state: CompileState,
  start: number,
  id: string,
  duration: number,
  easing: string,
  lineNumber: number,
): void {
  const node = requireNode(state, id, lineNumber);
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
    from: node.transform.opacity,
    to: 0,
    duration,
    easing,
  });
  state.timeline.push({ t: start + duration, op: "delete", id });
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

  const [id, property] = target.split(".");
  const isTrackerTarget = !property && state.values.has(target);
  const isCameraTarget = id === "camera" && isCameraProperty(property);
  if (!isTrackerTarget && !isCameraTarget) {
    if (!id || !property)
      throw new DslCompileError(
        "Expected animate target like 'c1.x', 'camera.x', or a declared value tracker id.",
        lineNumber,
      );
    if (!state.nodes.has(id))
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
  if (node.type === "circle") {
    const r = Number(node.geometry.r ?? 40) * scale;
    return { minX: x - r, maxX: x + r, minY: y - r, maxY: y + r };
  }
  if (node.type === "line") {
    const x1 = Number(node.geometry.x1 ?? 0) * scale;
    const x2 = Number(node.geometry.x2 ?? 0) * scale;
    const y1 = Number(node.geometry.y1 ?? 0) * scale;
    const y2 = Number(node.geometry.y2 ?? 0) * scale;
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
  const w = Number(node.geometry.w ?? fallbackWidth) * scale;
  const h = Number(node.geometry.h ?? fallbackHeight) * scale;
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
  const createNode = visibleZeroOpacityClone(node);
  if (supportsDrawProgress(node)) createNode.geometry.drawProgress = 0;
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
  if (supportsDrawProgress(node)) {
    state.timeline.push({
      t: start,
      op: "animate",
      id,
      path: "geometry.drawProgress",
      from: 0,
      to: 1,
      duration,
      easing,
    });
  }
  state.shown.add(id);
}

function supportsDrawProgress(node: SceneNode): boolean {
  return node.geometry.shapeMatcher === "surroundingRect";
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
}

function readExpressionAssignment(
  token: string,
  state: CompileState,
  lineNumber: number,
): string | null {
  if (!token.startsWith("expr=")) return null;
  const [key, expression] = readAssignment(token, lineNumber);
  if (key !== "expr") return null;
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
  return expression;
}
