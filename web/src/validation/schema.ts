import type {
  Camera,
  FluxionDocument,
  SceneNode,
  Style,
  TimelineOperation,
  Transform,
  ValueTracker,
} from "../types.js";

export class FluxionSchemaValidationError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`Invalid Fluxion document at ${path}: ${message}`);
    this.name = "FluxionSchemaValidationError";
    this.path = path;
  }
}

const nodeTypes = new Set([
  "group",
  "circle",
  "rect",
  "triangle",
  "line",
  "path",
  "text",
  "math",
  "brace",
  "image",
]);

const cameraModes = new Set(["center", "target", "frame-fit"]);
const strokeLinecaps = new Set(["butt", "round", "square"]);
const strokeLinejoins = new Set(["miter", "round", "bevel"]);
const mathRenderers = new Set(["katex", "mathjax"]);
const braceDirections = new Set(["up", "down", "left", "right", "perpendicular", "normal", "line"]);
const braceLabelRenderers = new Set(["text", "katex", "mathjax"]);
const braceLabelAlignments = new Set(["start", "center", "end"]);
const pathTypes = new Set(["parametric", "arc"]);
const pathSamplingModes = new Set(["fixed", "frame"]);
const pathSmoothingModes = new Set(["linear", "smooth"]);

export function validateFluxionDocument(documentData: FluxionDocument): void {
  assertObject(documentData, "$");
  if (documentData.version !== "0.1") fail("$.version", "must be '0.1'.");
  assertPositiveInteger(documentData.width, "$.width");
  assertPositiveInteger(documentData.height, "$.height");
  assertPositiveInteger(documentData.fps, "$.fps");
  if (documentData.duration !== undefined) assertNonNegativeNumber(documentData.duration, "$.duration");
  validateCamera(documentData.camera, "$.camera");
  if (documentData.values !== undefined) validateValues(documentData.values, "$.values");
  assertArray(documentData.nodes, "$.nodes");
  documentData.nodes.forEach((node, index) => validateNode(node, `$.nodes[${index}]`));
  assertArray(documentData.timeline, "$.timeline");
  documentData.timeline.forEach((operation, index) => validateTimelineOperation(operation, `$.timeline[${index}]`));
}

function validateCamera(camera: Camera, path: string): void {
  assertObject(camera, path);
  assertFiniteNumber(camera.x, `${path}.x`);
  assertFiniteNumber(camera.y, `${path}.y`);
  assertFiniteNumber(camera.scale, `${path}.scale`);
  assertFiniteNumber(camera.rotation, `${path}.rotation`);
  if (camera.target !== undefined) {
    assertObject(camera.target, `${path}.target`);
    assertFiniteNumber(camera.target.x, `${path}.target.x`);
    assertFiniteNumber(camera.target.y, `${path}.target.y`);
  }
  if (camera.padding !== undefined) assertNonNegativeNumber(camera.padding, `${path}.padding`);
  if (camera.mode !== undefined) assertOneOf(camera.mode, cameraModes, `${path}.mode`);
}

function validateValues(values: ValueTracker[], path: string): void {
  assertArray(values, path);
  const ids = new Set<string>();
  values.forEach((value, index) => {
    const valuePath = `${path}[${index}]`;
    assertObject(value, valuePath);
    assertIdentifier(value.id, `${valuePath}.id`);
    if (ids.has(value.id)) fail(`${valuePath}.id`, `duplicates value tracker '${value.id}'.`);
    ids.add(value.id);
    assertFiniteNumber(value.initial, `${valuePath}.initial`);
  });
}

function validateNode(node: SceneNode, path: string): void {
  assertObject(node, path);
  assertNonEmptyString(node.id, `${path}.id`);
  assertOneOf(node.type, nodeTypes, `${path}.type`);
  validateTransform(node.transform, `${path}.transform`);
  validateStyle(node.style, `${path}.style`);
  validateGeometry(node.geometry, `${path}.geometry`);
  assertArray(node.children, `${path}.children`);
  node.children.forEach((child, index) => validateNode(child, `${path}.children[${index}]`));

  if (node.text !== undefined) assertString(node.text, `${path}.text`);
  if (node.latex !== undefined) assertString(node.latex, `${path}.latex`);
  if (node.renderer !== undefined) assertOneOf(node.renderer, mathRenderers, `${path}.renderer`);
  if (node.metadata !== undefined) validateNodeMetadata(node.metadata, `${path}.metadata`);
  if (node.type === "path") assertNonEmptyString(node.geometry.d, `${path}.geometry.d`);
  if (node.type === "text" && node.text === undefined) fail(path, "text nodes must include text.");
  if (node.type === "text") assertPositiveNumber(node.geometry.fontSize, `${path}.geometry.fontSize`);
  if (node.type === "math") {
    if (!node.latex) fail(path, "math nodes must include non-empty latex.");
    if (node.renderer === undefined) fail(path, "math nodes must include renderer.");
    assertPositiveNumber(node.geometry.fontSize, `${path}.geometry.fontSize`);
  }
  if (node.type === "brace") {
    assertNonEmptyString(node.geometry.target, `${path}.geometry.target`);
    assertOneOf(node.geometry.direction, braceDirections, `${path}.geometry.direction`);
    assertNonNegativeNumber(node.geometry.buff, `${path}.geometry.buff`);
    if (node.geometry.sharpness !== undefined) assertPositiveNumber(node.geometry.sharpness, `${path}.geometry.sharpness`);
    if (node.geometry.labelRenderer !== undefined) assertOneOf(node.geometry.labelRenderer, braceLabelRenderers, `${path}.geometry.labelRenderer`);
    if (node.geometry.labelAlignment !== undefined) assertOneOf(node.geometry.labelAlignment, braceLabelAlignments, `${path}.geometry.labelAlignment`);
  }
}

function validateNodeMetadata(metadata: SceneNode["metadata"], path: string): void {
  assertObject(metadata, path);
  if (metadata.plot !== undefined) {
    assertObject(metadata.plot, `${path}.plot`);
    if (metadata.plot.range !== undefined) {
      assertArray(metadata.plot.range, `${path}.plot.range`);
      if (metadata.plot.range.length !== 2) fail(`${path}.plot.range`, "must contain exactly two numbers.");
      metadata.plot.range.forEach((item, index) => assertFiniteNumber(item, `${path}.plot.range[${index}]`));
    }
    if (metadata.plot.samples !== undefined) assertIntegerAtLeast(metadata.plot.samples, 2, `${path}.plot.samples`);
  }
  if (metadata.surfaceFace !== undefined) {
    assertObject(metadata.surfaceFace, `${path}.surfaceFace`);
    assertFiniteNumber(metadata.surfaceFace.row, `${path}.surfaceFace.row`);
    assertFiniteNumber(metadata.surfaceFace.col, `${path}.surfaceFace.col`);
    assertFiniteNumber(metadata.surfaceFace.depth, `${path}.surfaceFace.depth`);
    if (metadata.surfaceFace.height !== undefined) assertFiniteNumber(metadata.surfaceFace.height, `${path}.surfaceFace.height`);
    if (metadata.surfaceFace.shade !== undefined) assertFiniteNumber(metadata.surfaceFace.shade, `${path}.surfaceFace.shade`);
  }
}

function validateTransform(transform: Transform, path: string): void {
  assertObject(transform, path);
  assertFiniteNumber(transform.x, `${path}.x`);
  assertFiniteNumber(transform.y, `${path}.y`);
  assertFiniteNumber(transform.scale, `${path}.scale`);
  if (transform.scaleX !== undefined) assertFiniteNumber(transform.scaleX, `${path}.scaleX`);
  if (transform.scaleY !== undefined) assertFiniteNumber(transform.scaleY, `${path}.scaleY`);
  assertFiniteNumber(transform.rotation, `${path}.rotation`);
  assertUnitInterval(transform.opacity, `${path}.opacity`);
}

function validateStyle(style: Style, path: string): void {
  assertObject(style, path);
  if (style.fill !== undefined) assertString(style.fill, `${path}.fill`);
  if (style.fillOpacity !== undefined) assertUnitInterval(style.fillOpacity, `${path}.fillOpacity`);
  if (style.stroke !== undefined) assertString(style.stroke, `${path}.stroke`);
  if (style.strokeOpacity !== undefined) assertUnitInterval(style.strokeOpacity, `${path}.strokeOpacity`);
  if (style.strokeWidth !== undefined) assertNonNegativeNumber(style.strokeWidth, `${path}.strokeWidth`);
  if (style.strokeLinecap !== undefined) assertOneOf(style.strokeLinecap, strokeLinecaps, `${path}.strokeLinecap`);
  if (style.strokeLinejoin !== undefined) assertOneOf(style.strokeLinejoin, strokeLinejoins, `${path}.strokeLinejoin`);
}

function validateGeometry(geometry: Record<string, unknown>, path: string): void {
  assertObject(geometry, path);
  for (const [key, value] of Object.entries(geometry)) {
    const valuePath = `${path}.${key}`;
    if (typeof value === "number") {
      assertFiniteNumber(value, valuePath);
      continue;
    }
    if (typeof value === "string" || typeof value === "boolean") continue;
    if (Array.isArray(value)) {
      value.forEach((item, index) => assertFiniteNumber(item, `${valuePath}[${index}]`));
      continue;
    }
    fail(valuePath, "must be a number, string, boolean, or numeric array.");
  }
}

function validateTimelineOperation(operation: TimelineOperation, path: string): void {
  assertObject(operation, path);
  assertFiniteNumber(operation.t, `${path}.t`);
  switch (operation.op) {
    case "create":
      validateNode(operation.node, `${path}.node`);
      return;
    case "delete":
      assertNonEmptyString(operation.id, `${path}.id`);
      return;
    case "set":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertNonEmptyString(operation.path, `${path}.path`);
      return;
    case "setExpr":
    case "bindExpr":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertNonEmptyString(operation.path, `${path}.path`);
      assertNonEmptyString(operation.expr, `${path}.expr`);
      if ("duration" in operation && operation.duration !== undefined)
        assertNonNegativeNumber(operation.duration, `${path}.duration`);
      if ("deps" in operation && operation.deps !== undefined) validateStringArray(operation.deps as unknown, `${path}.deps`);
      return;
    case "bindPath":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertNonEmptyString(operation.path, `${path}.path`);
      if (operation.pathType !== undefined) assertOneOf(operation.pathType, pathTypes, `${path}.pathType`);
      if (operation.radius !== undefined) assertFiniteNumber(operation.radius, `${path}.radius`);
      assertIntegerAtLeast(operation.samples, 2, `${path}.samples`);
      assertNonEmptyString(operation.tMinExpr, `${path}.tMinExpr`);
      assertNonEmptyString(operation.tMaxExpr, `${path}.tMaxExpr`);
      assertNonEmptyString(operation.xExpr, `${path}.xExpr`);
      assertNonEmptyString(operation.yExpr, `${path}.yExpr`);
      if (operation.close !== undefined) assertBoolean(operation.close, `${path}.close`);
      if (operation.smoothing !== undefined) assertOneOf(operation.smoothing, pathSmoothingModes, `${path}.smoothing`);
      if (operation.sampling !== undefined) assertOneOf(operation.sampling, pathSamplingModes, `${path}.sampling`);
      if (operation.sampleStep !== undefined) assertFiniteNumber(operation.sampleStep, `${path}.sampleStep`);
      if (operation.deps !== undefined) validateStringArray(operation.deps, `${path}.deps`);
      return;
    case "setValue":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertFiniteNumber(operation.value, `${path}.value`);
      return;
    case "animate":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertNonEmptyString(operation.path, `${path}.path`);
      assertNonNegativeNumber(operation.duration, `${path}.duration`);
      assertNonEmptyString(operation.easing, `${path}.easing`);
      return;
    case "animateValue":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertFiniteNumber(operation.from, `${path}.from`);
      assertFiniteNumber(operation.to, `${path}.to`);
      assertNonNegativeNumber(operation.duration, `${path}.duration`);
      assertNonEmptyString(operation.easing, `${path}.easing`);
      return;
    case "effect":
      assertNonEmptyString(operation.id, `${path}.id`);
      assertNonEmptyString(operation.effect, `${path}.effect`);
      assertNonNegativeNumber(operation.duration, `${path}.duration`);
      assertNonEmptyString(operation.easing, `${path}.easing`);
      return;
    case "followCamera":
      assertNonEmptyString(operation.id, `${path}.id`);
      if (operation.frameId !== undefined) assertNonEmptyString(operation.frameId, `${path}.frameId`);
      if (operation.duration !== undefined) assertNonNegativeNumber(operation.duration, `${path}.duration`);
      return;
    default:
      fail(`${path}.op`, `unknown operation '${String((operation as { op?: unknown }).op)}'.`);
  }
}

function validateStringArray(value: unknown, path: string): void {
  assertArray(value, path);
  value.forEach((item, index) => assertString(item, `${path}[${index}]`));
}

function assertObject(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "must be an object.");
}

function assertArray(value: unknown, path: string): asserts value is unknown[] {
  if (!Array.isArray(value)) fail(path, "must be an array.");
}

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string") fail(path, "must be a string.");
}

function assertNonEmptyString(value: unknown, path: string): asserts value is string {
  assertString(value, path);
  if (value.length === 0) fail(path, "must not be empty.");
}

function assertIdentifier(value: unknown, path: string): asserts value is string {
  assertNonEmptyString(value, path);
  if (!/^[_A-Za-z]\w*$/u.test(value)) fail(path, "must be a valid identifier.");
}

function assertBoolean(value: unknown, path: string): asserts value is boolean {
  if (typeof value !== "boolean") fail(path, "must be a boolean.");
}

function assertFiniteNumber(value: unknown, path: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "must be a finite number.");
}

function assertNonNegativeNumber(value: unknown, path: string): asserts value is number {
  assertFiniteNumber(value, path);
  if (value < 0) fail(path, "must be greater than or equal to 0.");
}

function assertUnitInterval(value: unknown, path: string): asserts value is number {
  assertFiniteNumber(value, path);
  if (value < 0 || value > 1) fail(path, "must be between 0 and 1.");
}

function assertPositiveInteger(value: unknown, path: string): asserts value is number {
  assertIntegerAtLeast(value, 1, path);
}

function assertPositiveNumber(value: unknown, path: string): asserts value is number {
  assertFiniteNumber(value, path);
  if (value <= 0) fail(path, "must be greater than 0.");
}

function assertIntegerAtLeast(value: unknown, minimum: number, path: string): asserts value is number {
  assertFiniteNumber(value, path);
  if (!Number.isInteger(value) || value < minimum) fail(path, `must be an integer greater than or equal to ${minimum}.`);
}

function assertOneOf(value: unknown, allowed: Set<string>, path: string): asserts value is string {
  if (typeof value !== "string" || !allowed.has(value)) fail(path, `must be one of ${[...allowed].join(", ")}.`);
}

function fail(path: string, message: string): never {
  throw new FluxionSchemaValidationError(path, message);
}
