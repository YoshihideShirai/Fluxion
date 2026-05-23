import type {
  NodeType,
  SceneNode,
  Style,
  TimelineOperation,
  Transform,
  FluxionDocument,
  Camera,
} from "../types.js";
import { ExpressionError, validateExpression, collectExpressionDependencies, evaluateExpression } from "../runtime/expression.js";

export class DslCompileError extends Error {
  readonly line: number;
  readonly column: number;

  constructor(message: string, line: number, column = 1) {
    super(`Line ${line}, column ${column}: ${message}`);
    this.name = "DslCompileError";
    this.line = line;
    this.column = column;
  }
}

interface CompileState {
  width: number;
  height: number;
  fps: number;
  camera: Camera;
  nodes: Map<string, SceneNode>;
  values: Map<string, number>;
  timeline: TimelineOperation[];
  shown: Set<string>;
  rootIds: Set<string>;
  currentTime: number;
  blockTime: number | null;
}

const DEFAULT_STYLE: Style = {
  fill: "#ffffff",
  stroke: "none",
  strokeWidth: 0,
};

export function compileTextDsl(source: string): FluxionDocument {
  const state: CompileState = {
    width: 1280,
    height: 720,
    fps: 60,
    camera: defaultCamera(),
    nodes: new Map(),
    values: new Map(),
    timeline: [],
    shown: new Set(),
    rootIds: new Set(),
    currentTime: 0,
    blockTime: null,
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

    throw new DslCompileError(
      `Unknown statement '${keyword}'.`,
      lineNumber,
      columnOf(withoutComment, keyword),
    );
  });

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
    if (!state.nodes.has(target))
      throw new DslCompileError(`Brace target '${target}' could not be resolved.`, lineNumber);
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
  const at = options.get("at") ?? `${state.width / 2},${state.height / 2}`;
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
  const at = options.get("at") ?? `${state.width / 2},${state.height / 2}`;
  const [cx, cy] = at.split(",").map((v) => parseNumber(v, lineNumber));
  const scaleX = parseNumber(options.get("scaleX") ?? "76", lineNumber);
  const scaleY = parseNumber(options.get("scaleY") ?? "60", lineNumber);
  const stroke = options.get("stroke") ?? "#38bdf8";
  const strokeWidth = parseNumber(options.get("strokeWidth") ?? "4", lineNumber);
  const pathOp = readPathGeneratorAssignment(`path(x=t*${scaleX}, y=(${fnExpr})*-${scaleY}, from=${r0!}, to=${r1!}, samples=${samples})`, state, lineNumber);
  if (!pathOp) throw new DslCompileError("Failed to build plot path.", lineNumber);

  const node = createBaseNode(id, "path");
  node.transform.x = cx!; node.transform.y = cy!;
  node.style.fill = "none"; node.style.stroke = stroke; node.style.strokeWidth = strokeWidth;
  node.metadata = { plot: { range: [r0!, r1!], samples } };
  const d = buildPathDataPreview(pathOp, state);
  node.geometry.d = d;
  state.nodes.set(id, node);
  state.rootIds.add(id);
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
function statementTime(state: CompileState): number {
  return state.blockTime ?? state.currentTime;
}

function advanceStatementTime(state: CompileState, duration: number): void {
  if (state.blockTime === null) state.currentTime += duration;
  else state.blockTime += duration;
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
    state.timeline.push({
      t: time,
      op: "bindPath",
      id,
      path: isCameraTarget ? cameraPropertyPath(property) : propertyPath(property),
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
  for (const [key, value] of readAssignments(optionTokens, lineNumber)) {
    if (key === "duration") duration = parseSeconds(value, lineNumber);
    else if (key === "easing") easing = parseEasing(value, lineNumber);
    else throw new DslCompileError(`Unknown play option '${key}'.`, lineNumber);
  }

  emitPlayCall(state, call, statementTime(state), duration, easing, lineNumber);
  if (state.blockTime === null) advanceStatementTime(state, duration);
}

function emitPlayCall(
  state: CompileState,
  call: PlayCall,
  start: number,
  duration: number,
  easing: string,
  lineNumber: number,
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
      );
    });
    return;
  }

  throw new DslCompileError(
    `Unknown play primitive '${call.name}'.`,
    lineNumber,
  );
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
  const createNode = hiddenClone(node);
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
    to: node.transform.opacity,
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
  const node = hiddenClone(requireNode(state, id, lineNumber));
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
    to: requireNode(state, id, lineNumber).transform.opacity,
    duration,
    easing,
  });
  state.shown.add(id);
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

type PlayArgument = string | PlayCall;

interface PlayCall {
  name: string;
  args: PlayArgument[];
  options: Map<string, string>;
}

function readPlayCall(
  tokens: string[],
  lineNumber: number,
): [PlayCall, string[]] {
  const callTokens: string[] = [];
  let index = 1;
  let depth = 0;
  let sawOpenParen = false;
  while (index < tokens.length) {
    const token = tokens[index]!;
    callTokens.push(token);
    for (const char of token) {
      if (char === "(") {
        depth += 1;
        sawOpenParen = true;
      } else if (char === ")") {
        depth -= 1;
        if (depth < 0)
          throw new DslCompileError("Unexpected ')' in play call.", lineNumber);
      }
    }
    index += 1;
    if (sawOpenParen && depth === 0) break;
  }

  if (!sawOpenParen || depth !== 0)
    throw new DslCompileError("Unclosed play call.", lineNumber);

  return [parsePlayCall(callTokens.join(" "), lineNumber), tokens.slice(index)];
}

function parsePlayCall(raw: string | undefined, lineNumber: number): PlayCall {
  if (!raw)
    throw new DslCompileError(
      "Expected animation primitive after play.",
      lineNumber,
    );
  const openParen = raw.indexOf("(");
  if (openParen <= 0 || !raw.endsWith(")"))
    throw new DslCompileError(
      "Expected play syntax like FadeIn(id).",
      lineNumber,
    );
  const name = raw.slice(0, openParen).trim();
  if (!/^\w+$/u.test(name))
    throw new DslCompileError(
      "Expected play syntax like FadeIn(id).",
      lineNumber,
    );

  const args: PlayArgument[] = [];
  const options = new Map<string, string>();
  const inner = raw.slice(openParen + 1, -1).trim();
  if (inner !== "") {
    for (const part of splitTopLevelArgs(inner, lineNumber)) {
      const assignment = splitTopLevelAssignment(part);
      if (assignment) {
        const [key, value] = assignment;
        if (options.has(key))
          throw new DslCompileError(
            `Duplicate play option '${key}'.`,
            lineNumber,
          );
        options.set(key, value);
      } else if (isPlayCallText(part)) {
        args.push(parsePlayCall(part, lineNumber));
      } else {
        args.push(part);
      }
    }
  }

  return { name, args, options };
}

function splitTopLevelArgs(raw: string, lineNumber: number): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of raw) {
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth < 0)
        throw new DslCompileError("Unexpected ')' in play call.", lineNumber);
    }

    if (char === "," && depth === 0) {
      const arg = current.trim();
      if (!arg)
        throw new DslCompileError(
          "Expected non-empty play argument.",
          lineNumber,
        );
      args.push(arg);
      current = "";
    } else {
      current += char;
    }
  }
  if (depth !== 0) throw new DslCompileError("Unclosed play call.", lineNumber);
  const finalArg = current.trim();
  if (!finalArg)
    throw new DslCompileError("Expected non-empty play argument.", lineNumber);
  args.push(finalArg);
  return args;
}

function splitTopLevelAssignment(raw: string): [string, string] | null {
  let depth = 0;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "=" && depth === 0) {
      const key = raw.slice(0, index).trim();
      const value = raw.slice(index + 1).trim();
      if (key && value) return [key, value];
    }
  }
  return null;
}

function isPlayCallText(raw: string): boolean {
  return /^\w+\s*\(/u.test(raw) && raw.endsWith(")");
}

function expectPlayArg(
  call: PlayCall,
  count: number,
  lineNumber: number,
): string {
  return expectPlayIdArgs(call, count, lineNumber)[0]!;
}

function expectPlayIdArgs(
  call: PlayCall,
  count: number,
  lineNumber: number,
): string[] {
  if (
    call.args.length !== count ||
    call.args.some((arg) => typeof arg !== "string")
  )
    throw new DslCompileError(
      `Expected ${call.name}(${expectedIdList(count)}).`,
      lineNumber,
    );
  return call.args as string[];
}

function expectedIdList(count: number): string {
  if (count === 1) return "id";
  return Array.from({ length: count }, (_, index) =>
    index === 0 ? "from" : index === 1 ? "to" : `id${index + 1}`,
  ).join(", ");
}

function expectPlayCallArgs(call: PlayCall, lineNumber: number): PlayCall[] {
  if (call.args.length === 0)
    throw new DslCompileError(
      `Expected ${call.name}(<animation>, ...).`,
      lineNumber,
    );
  if (call.args.some((arg) => typeof arg === "string"))
    throw new DslCompileError(
      `Expected ${call.name} arguments to be animation calls.`,
      lineNumber,
    );
  return call.args as PlayCall[];
}

function ensureNoPlayOptions(call: PlayCall, lineNumber: number): void {
  if (call.options.size > 0) {
    const [key] = call.options.keys();
    throw new DslCompileError(
      `Unknown ${call.name} option '${key ?? ""}'.`,
      lineNumber,
    );
  }
}

function readLagRatio(call: PlayCall, lineNumber: number): number {
  let lagRatio = 0;
  for (const [key, value] of call.options) {
    if (key === "lagRatio") lagRatio = parseNumber(value, lineNumber);
    else
      throw new DslCompileError(
        `Unknown ${call.name} option '${key}'.`,
        lineNumber,
      );
  }
  if (lagRatio < 0)
    throw new DslCompileError(
      "Expected lagRatio to be non-negative.",
      lineNumber,
    );
  return lagRatio;
}

function normalizeLaggedGroupTiming(
  duration: number,
  childCount: number,
  lagRatio: number,
): { childDuration: number; childOffset: number } {
  if (childCount <= 0) return { childDuration: 0, childOffset: 0 };
  const normalizedChildDuration =
    duration / (1 + Math.max(0, childCount - 1) * lagRatio);
  return {
    childDuration: normalizedChildDuration,
    childOffset: normalizedChildDuration * lagRatio,
  };
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

function hiddenWritableClone(node: SceneNode): SceneNode {
  const clone = structuredClone(node);
  hideWritableNodes(clone);
  return clone;
}

function hideWritableNodes(node: SceneNode): void {
  if ((node.children ?? []).length === 0) {
    if (supportsWriteProgress(node)) node.geometry.writeProgress = 0;
    else node.transform.opacity = 0;
    return;
  }
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
  const createNode = structuredClone(node);
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
  for (const key of ["x", "y", "scale", "rotation", "opacity"] as const) {
    if (fromNode.transform[key] !== toNode.transform[key]) {
      state.timeline.push({
        t: start,
        op: "animate",
        id: fromNode.id,
        path: `transform.${key}`,
        from: fromNode.transform[key],
        to: toNode.transform[key],
        duration,
        easing,
      });
    }
  }

  for (const key of new Set([
    ...Object.keys(fromNode.style),
    ...Object.keys(toNode.style),
  ])) {
    const from = fromNode.style[key as keyof Style];
    const to = toNode.style[key as keyof Style];
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
    ...Object.keys(toNode.geometry),
  ])) {
    const from = fromNode.geometry[key];
    const to = toNode.geometry[key];
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

const LATEX_TOKEN_PATTERN = /\\[a-zA-Z]+\*?|\\.|[_^]|[{}]|\s+|[^\\\s_^{}]/gu;

function expandMathTokens(node: SceneNode, lineNumber: number): void {
  if (node.type !== "math")
    throw new DslCompileError(
      "expandTokens is only supported for math nodes.",
      lineNumber,
    );
  if (node.latex === undefined)
    throw new DslCompileError(
      "Expected math LaTeX before expandTokens.",
      lineNumber,
    );
  node.children = latexToTokenNodes(
    node.id,
    node.latex,
    Number(node.geometry.fontSize ?? 36),
    node.renderer ?? "katex",
    node.style,
  );
}

function tokenizeLatex(latex: string): string[] {
  const rawTokens = [...latex.matchAll(LATEX_TOKEN_PATTERN)]
    .map((match) => match[0])
    .filter((token) => !/^\s+$/u.test(token));
  const tokens: string[] = [];

  for (let index = 0; index < rawTokens.length; index += 1) {
    let token = rawTokens[index] ?? "";
    const grouped = maybeReadScriptedDelimitedGroup(rawTokens, index);
    if (grouped) {
      token = grouped.token;
      index = grouped.nextIndex - 1;
    }

    while (rawTokens[index + 1] === "^" || rawTokens[index + 1] === "_") {
      const marker = rawTokens[index + 1];
      const [argument, nextIndex] = readScriptArgument(rawTokens, index + 2);
      if (!marker || argument === undefined) break;
      token += marker + argument;
      index = nextIndex - 1;
    }

    tokens.push(token);
  }

  return tokens;
}

function maybeReadScriptedDelimitedGroup(
  tokens: string[],
  start: number,
): { token: string; nextIndex: number } | undefined {
  const opener = tokens[start];
  const closer = opener === "(" ? ")" : opener === "[" ? "]" : undefined;
  if (!closer) return undefined;

  let depth = 0;
  let token = "";
  for (let index = start; index < tokens.length; index += 1) {
    const current = tokens[index] ?? "";
    if (current === opener) depth += 1;
    if (current === closer) depth -= 1;
    token += current;
    if (depth === 0) {
      const next = tokens[index + 1];
      if (next === "^" || next === "_") return { token, nextIndex: index + 1 };
      return undefined;
    }
  }

  return undefined;
}

function readScriptArgument(
  tokens: string[],
  start: number,
): [argument: string | undefined, nextIndex: number] {
  const first = tokens[start];
  if (first === undefined) return [undefined, start];
  if (first !== "{") return [first, start + 1];

  let depth = 0;
  let argument = "";
  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index] ?? "";
    if (token === "{") depth += 1;
    if (token === "}") depth -= 1;
    argument += token;
    if (depth === 0) return [argument, index + 1];
  }

  return [argument, tokens.length];
}

function latexToTokenNodes(
  parentId: string,
  latex: string,
  fontSize: number,
  renderer: string,
  style: Style,
): SceneNode[] {
  const tokens = tokenizeLatex(latex);
  let cursor =
    -tokens.reduce((sum, token) => sum + tokenWidth(token, fontSize), 0) /
    2;
  return tokens.map((token, index) => {
    const width = tokenWidth(token, fontSize);
    const child = createBaseNode(`${parentId}:tex:${index}`, "math");
    child.latex = token;
    child.renderer = renderer;
    child.style = { ...style };
    child.geometry.fontSize = fontSize;
    child.geometry.w = width;
    child.transform.x = cursor + width / 2;
    cursor += width;
    return child;
  });
}

const TOKEN_PADDING_UNITS = 0.26;
const SCRIPTED_DELIMITED_PADDING_UNITS = 0.5;

function tokenWidth(token: string, fontSize: number): number {
  if (token.startsWith("\\") && token.length > 2)
    return fontSize * (0.9 + TOKEN_PADDING_UNITS);
  if (token === "^" || token === "_" || token === "{" || token === "}")
    return fontSize * (0.35 + TOKEN_PADDING_UNITS);

  const [base, ...scriptParts] = token.split(/(?=[_^])/u);
  const scriptPart = scriptParts.join("");
  const baseText = base ?? token;
  const baseWidthUnits = textWidthUnits(baseText);
  const scriptWidthUnits = scriptPart
    ? textWidthUnits(scriptPart.replace(/[_^{}]/gu, "")) * 0.45
    : 0;

  const estimatedUnits = Math.max(
    0.45,
    baseWidthUnits +
      scriptWidthUnits +
      TOKEN_PADDING_UNITS +
      (isScriptedDelimitedToken(token) ? SCRIPTED_DELIMITED_PADDING_UNITS : 0),
  );
  return fontSize * estimatedUnits;
}

function isScriptedDelimitedToken(token: string): boolean {
  return /^(\(.+\)|\[.+\])[_^]/u.test(token);
}

function textWidthUnits(text: string): number {
  let widthUnits = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? "";
    if (char === "\\") {
      const command = text.slice(index).match(/^\\[a-zA-Z]+\*?/u)?.[0];
      if (command) {
        widthUnits += 0.9;
        index += command.length - 1;
        continue;
      }
      widthUnits += 0.35;
    } else if (/[+=<>-]/u.test(char)) {
      widthUnits += 0.78;
    } else if (/[()[\]]/u.test(char)) {
      widthUnits += 0.42;
    } else if (/[A-Z]/u.test(char)) {
      widthUnits += 0.62;
    } else if (/[a-z]/u.test(char)) {
      widthUnits += 0.56;
    } else if (/[0-9]/u.test(char)) {
      widthUnits += 0.5;
    } else if (/[,.;:]/u.test(char)) {
      widthUnits += 0.28;
    } else {
      widthUnits += 0.55;
    }
  }
  return widthUnits;
}

function createBaseNode(id: string, type: NodeType): SceneNode {
  return {
    id,
    type,
    transform: defaultTransform(),
    style: { ...DEFAULT_STYLE },
    geometry: defaultGeometry(type),
    children: [],
  };
}

function defaultTransform(): Transform {
  return { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
}

function defaultCamera(): Camera {
  return { x: 0, y: 0, scale: 1, rotation: 0, target: { x: 0, y: 0 }, padding: 0, mode: "center" };
}

function defaultGeometry(type: NodeType): Record<string, number | string> {
  if (type === "circle") return { r: 40 };
  if (type === "rect") return { w: 100, h: 80 };
  if (type === "triangle") return { w: 100, h: 90 };
  if (type === "line") return { x1: 0, y1: 0, x2: 100, y2: 0 };
  if (type === "path") return { d: "" };
  if (type === "text") return { fontSize: 32 };
  if (type === "math") return { fontSize: 36 };
  if (type === "brace")
    return { target: "", direction: "down", buff: 8, label: "", labelSize: 24, labelColor: "#ffffff" };
  return {};
}

function applyNodeOption(
  node: SceneNode,
  key: string,
  value: string,
  lineNumber: number,
): void {
  if (key === "at") {
    const [x, y] = value
      .split(",")
      .map((item) => parseNumber(item, lineNumber));
    if (
      x === undefined ||
      y === undefined ||
      Number.isNaN(x) ||
      Number.isNaN(y)
    ) {
      throw new DslCompileError("Expected at x,y.", lineNumber);
    }
    node.transform.x = x;
    node.transform.y = y;
    return;
  }

  if (["x", "y", "scale", "rotation", "opacity"].includes(key)) {
    node.transform[key as keyof Transform] = parseNumber(value, lineNumber);
    return;
  }

  if (key === "fill" || key === "stroke") {
    node.style[key] = value;
    return;
  }

  if (key === "strokeWidth") {
    node.style.strokeWidth = parseNumber(value, lineNumber);
    return;
  }

  if (key === "expandTokens") {
    node.geometry.expandTokens = parseBoolean(value, lineNumber);
    if (node.geometry.expandTokens) expandMathTokens(node, lineNumber);
    else node.children = [];
    return;
  }

  if (key === "renderer") {
    if (value !== "katex" && value !== "mathjax")
      throw new DslCompileError(
        "Expected renderer to be 'katex' or 'mathjax'.",
        lineNumber,
      );
    node.renderer = value;
    return;
  }

  if (key === "size" || key === "fontSize") {
    node.geometry.fontSize = parseNumber(value, lineNumber);
    return;
  }
  if (key === "target") {
    node.geometry.target = value;
    return;
  }
  if (key === "direction") {
    if (!["up", "down", "left", "right"].includes(value))
      throw new DslCompileError("Brace direction must be one of up/down/left/right.", lineNumber);
    node.geometry.direction = value;
    return;
  }
  if (key === "buff") {
    node.geometry.buff = parseNumber(value, lineNumber);
    return;
  }
  if (key === "label") {
    node.geometry.label = value;
    return;
  }
  if (key === "labelSize") {
    node.geometry.labelSize = parseNumber(value, lineNumber);
    return;
  }
  if (key === "labelColor") {
    node.geometry.labelColor = value;
    return;
  }

  if (["r", "w", "h", "x1", "y1", "x2", "y2"].includes(key)) {
    node.geometry[key] = parseNumber(value, lineNumber);
    return;
  }

  if (key === "d") {
    node.geometry.d = value;
    return;
  }

  throw new DslCompileError(`Unknown node option '${key}'.`, lineNumber);
}

function cameraPropertyPath(property: string): string {
  if (isCameraProperty(property)) return `camera.${property}`;
  return property;
}

function isCameraProperty(property: string | undefined): boolean {
  return ["x", "y", "scale", "rotation", "padding", "mode", "target.x", "target.y"].includes(property ?? "");
}

function propertyPath(property: string): string {
  if (["x", "y", "scale", "rotation", "opacity"].includes(property))
    return `transform.${property}`;
  if (["fill", "stroke", "strokeWidth"].includes(property))
    return `style.${property}`;
  if (
    ["r", "w", "h", "fontSize", "x1", "y1", "x2", "y2", "d", "target", "direction", "buff", "label", "labelSize", "labelColor"].includes(property)
  )
    return `geometry.${property}`;
  if (property === "renderer") return "renderer";
  if (property === "text") return "text";
  return property;
}

function readCameraArguments(
  tokens: string[],
  lineNumber: number,
): Array<[string, string]> {
  const args: Array<[string, string]> = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "at") {
      const value = tokens[index + 1];
      if (!value) throw new DslCompileError("Expected coordinates after camera at.", lineNumber);
      args.push(["at", value]);
      index += 1;
      continue;
    }
    if (!token) throw new DslCompileError("Expected camera option.", lineNumber);
    args.push(readAssignment(token, lineNumber));
  }
  return args;
}

function readNodeArguments(
  tokens: string[],
  lineNumber: number,
): Array<[string, string]> {
  const args: Array<[string, string]> = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "at") {
      const value = tokens[index + 1];
      if (!value)
        throw new DslCompileError("Expected coordinates after at.", lineNumber);
      args.push(["at", value]);
      index += 1;
      continue;
    }
    if (!token) throw new DslCompileError("Expected node option.", lineNumber);
    args.push(readAssignment(token, lineNumber));
  }
  return args;
}

function readAssignments(
  tokens: string[],
  lineNumber: number,
): Array<[string, string]> {
  return tokens.map((token) => readAssignment(token, lineNumber));
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

function readAssignment(token: string, lineNumber: number): [string, string] {
  const equals = token.indexOf("=");
  if (equals <= 0)
    throw new DslCompileError(
      `Expected key=value, got '${token}'.`,
      lineNumber,
    );
  return [token.slice(0, equals), token.slice(equals + 1)];
}

function parseValue(raw: string, lineNumber: number): number | string {
  const number = Number(raw);
  if (!Number.isNaN(number) && raw.trim() !== "") return number;
  if (raw.endsWith("s")) return parseSeconds(raw, lineNumber);
  return raw;
}

function parseSeconds(raw: string | undefined, lineNumber: number): number {
  if (!raw) throw new DslCompileError("Expected time value.", lineNumber);
  const normalized = raw.endsWith(":") ? raw.slice(0, -1) : raw;
  const value = normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
  return parseNumber(value, lineNumber);
}

function parseEasing(raw: string, lineNumber: number): string {
  if (
    raw === "linear" ||
    raw === "smooth" ||
    raw === "easeInOut" ||
    raw === "easeIn" ||
    raw === "easeOut"
  ) {
    return raw;
  }
  throw new DslCompileError(`Unknown easing '${raw}'.`, lineNumber);
}

function parseBoolean(raw: string, lineNumber: number): boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new DslCompileError(`Expected boolean, got '${raw}'.`, lineNumber);
}

function parseNumber(raw: string | undefined, lineNumber: number): number {
  const value = Number(raw);
  if (raw === undefined || raw === "" || Number.isNaN(value)) {
    throw new DslCompileError(
      `Expected number, got '${raw ?? ""}'.`,
      lineNumber,
    );
  }
  return value;
}

function stripComment(line: string): string {
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === undefined) continue;
    if (char === '"' && line[index - 1] !== "\\") quoted = !quoted;
    if (!quoted && char === "#") return line.slice(0, index);
  }
  return line;
}

function tokenize(line: string, lineNumber: number): string[] {
  const tokens: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === undefined) continue;
    if (char === '"' && line[index - 1] !== "\\") {
      quoted = !quoted;
      continue;
    }
    if (!quoted && /\s/.test(char)) {
      if (current) tokens.push(unescapeToken(current));
      current = "";
      continue;
    }
    current += char;
  }

  if (quoted)
    throw new DslCompileError(
      "Unclosed quoted string.",
      lineNumber,
      line.length,
    );
  if (current) tokens.push(unescapeToken(current));
  return tokens;
}

function isNodeType(value: string | undefined): value is NodeType {
  return (
    value === "group" ||
    value === "circle" ||
    value === "rect" ||
    value === "triangle" ||
    value === "line" ||
    value === "path" ||
    value === "text" ||
    value === "math" ||
    value === "brace"
  );
}

function unescapeToken(token: string): string {
  return token.replace(/\\"/g, '"');
}

function columnOf(line: string, token: string): number {
  const index = line.indexOf(token);
  return index === -1 ? 1 : index + 1;
}
