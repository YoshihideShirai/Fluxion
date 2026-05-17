import type {
  NodeType,
  SceneNode,
  Style,
  TimelineOperation,
  Transform,
  FluxionDocument,
} from "../types.js";

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
  nodes: Map<string, SceneNode>;
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
    nodes: new Map(),
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
      keyword === "line" ||
      keyword === "path" ||
      keyword === "text" ||
      keyword === "math" ||
      keyword === "group"
    ) {
      parseNode(tokens, state, lineNumber);
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
    if (!state.shown.has(node.id)) {
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
    nodes: [...state.rootIds]
      .map((id) => state.nodes.get(id))
      .filter((node): node is SceneNode => node !== undefined),
    timeline: state.timeline,
  };
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

  state.nodes.set(id, node);
  state.rootIds.add(id);
  if (type === "group") {
    for (const childId of childIds) state.rootIds.delete(childId);
  }
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
    throw new DslCompileError("Expected set target like 'c1.x'.", lineNumber);
  if (!state.nodes.has(id))
    throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  if (tokens[2] !== "to" || tokens[3] === undefined)
    throw new DslCompileError(
      "Expected set syntax: set id.property to value.",
      lineNumber,
    );
  if (tokens.length > 4)
    throw new DslCompileError("Unexpected tokens after set value.", lineNumber);

  state.timeline.push({
    t: time,
    op: "set",
    id,
    path: propertyPath(property),
    value: parseValue(tokens[3], lineNumber),
  });
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

  const start = statementTime(state);
  if (call.name === "FadeIn") {
    const id = expectPlayArg(call, 1, lineNumber);
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
    advanceStatementTime(state, duration);
    return;
  }

  if (call.name === "FadeOut") {
    const id = expectPlayArg(call, 1, lineNumber);
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
    advanceStatementTime(state, duration);
    return;
  }

  if (call.name === "Create" || call.name === "Write") {
    const id = expectPlayArg(call, 1, lineNumber);
    const node = requireNode(state, id, lineNumber);
    state.timeline.push({
      t: start,
      op: "create",
      node: structuredClone(node),
    });
    state.timeline.push({
      t: start,
      op: "effect",
      id,
      effect: call.name === "Create" ? "create" : "write",
      duration,
      easing,
    });
    state.shown.add(id);
    advanceStatementTime(state, duration);
    return;
  }

  if (call.name === "Transform") {
    const [fromId, toId] = call.args;
    if (!fromId || !toId || call.args.length !== 2)
      throw new DslCompileError("Expected Transform(from, to).", lineNumber);
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
    advanceStatementTime(state, duration);
    return;
  }

  throw new DslCompileError(
    `Unknown play primitive '${call.name}'.`,
    lineNumber,
  );
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
  if (!id || !property)
    throw new DslCompileError(
      "Expected animate target like 'c1.x'.",
      lineNumber,
    );
  if (!state.nodes.has(id))
    throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);

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

  state.timeline.push({
    t: start,
    op: "animate",
    id,
    path: propertyPath(property),
    from,
    to,
    duration,
    easing,
  });
}

interface PlayCall {
  name: string;
  args: string[];
}

function readPlayCall(
  tokens: string[],
  lineNumber: number,
): [PlayCall, string[]] {
  const callTokens: string[] = [];
  let index = 1;
  while (index < tokens.length) {
    const token = tokens[index]!;
    callTokens.push(token);
    index += 1;
    if (token.endsWith(")")) break;
  }

  return [parsePlayCall(callTokens.join(" "), lineNumber), tokens.slice(index)];
}

function parsePlayCall(raw: string | undefined, lineNumber: number): PlayCall {
  if (!raw)
    throw new DslCompileError(
      "Expected animation primitive after play.",
      lineNumber,
    );
  const match = /^(\w+)\((.*)\)$/u.exec(raw);
  if (!match)
    throw new DslCompileError(
      "Expected play syntax like FadeIn(id).",
      lineNumber,
    );
  const args =
    match[2]!.trim() === ""
      ? []
      : match[2]!.split(",").map((arg) => arg.trim());
  if (args.some((arg) => arg === ""))
    throw new DslCompileError("Expected non-empty play argument.", lineNumber);
  return { name: match[1]!, args };
}

function expectPlayArg(
  call: PlayCall,
  count: number,
  lineNumber: number,
): string {
  if (call.args.length !== count || !call.args[0])
    throw new DslCompileError(`Expected ${call.name}(id).`, lineNumber);
  return call.args[0];
}

function requireNode(
  state: CompileState,
  id: string,
  lineNumber: number,
): SceneNode {
  const node = state.nodes.get(id);
  if (!node) throw new DslCompileError(`Unknown node '${id}'.`, lineNumber);
  return node;
}

function hiddenClone(node: SceneNode): SceneNode {
  const clone = structuredClone(node);
  clone.transform.opacity = 0;
  return clone;
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

function defaultGeometry(type: NodeType): Record<string, number | string> {
  if (type === "circle") return { r: 40 };
  if (type === "rect") return { w: 100, h: 80 };
  if (type === "line") return { x1: 0, y1: 0, x2: 100, y2: 0 };
  if (type === "path") return { d: "" };
  if (type === "text") return { fontSize: 32 };
  if (type === "math") return { fontSize: 36 };
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

function propertyPath(property: string): string {
  if (["x", "y", "scale", "rotation", "opacity"].includes(property))
    return `transform.${property}`;
  if (["fill", "stroke", "strokeWidth"].includes(property))
    return `style.${property}`;
  if (
    ["r", "w", "h", "fontSize", "x1", "y1", "x2", "y2", "d"].includes(property)
  )
    return `geometry.${property}`;
  if (property === "renderer") return "renderer";
  if (property === "text") return "text";
  return property;
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
    value === "line" ||
    value === "path" ||
    value === "text" ||
    value === "math"
  );
}

function unescapeToken(token: string): string {
  return token.replace(/\\"/g, '"');
}

function columnOf(line: string, token: string): number {
  const index = line.indexOf(token);
  return index === -1 ? 1 : index + 1;
}
