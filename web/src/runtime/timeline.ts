import { ease, interpolate } from "../easing.js";
import type {
  CreateOperation,
  DeleteOperation,
  EffectOperation,
  SetExpressionOperation,
  SetOperation,
  SetValueOperation,
  BindExpressionOperation,
  BindPathOperation,
  FollowCameraOperation,
  TimelineOperation,
  ValueTracker,
  Camera,
} from "../types.js";
import { arcToSvgPath, pointsToSvgPath } from "../pathUtils.js";
import { evaluateExpression } from "./expression.js";
import type { SceneGraph } from "./sceneGraph.js";

type InstantOperation =
  | CreateOperation
  | DeleteOperation
  | EffectOperation
  | SetOperation
  | SetExpressionOperation
  | SetValueOperation
  | BindExpressionOperation
  | BindPathOperation
  | FollowCameraOperation;

const OPERATION_PRIORITY: Record<TimelineOperation["op"], number> = {
  create: 0,
  setValue: 1,
  set: 2,
  effect: 3,
  animateValue: 4,
  animate: 5,
  setExpr: 6,
  bindExpr: 7,
  bindPath: 7,
  followCamera: 7,
  delete: 8,
};

export function applyInstantOp(
  graph: SceneGraph,
  op: InstantOperation,
  trackerValues: Record<string, number> = {},
  camera?: Camera,
): void {
  if (op.op === "create") graph.upsert(op.node);
  if (op.op === "delete") graph.delete(op.id);
  if (op.op === "set") {
    if (isCameraTarget(op.id, op.path)) setCameraPath(camera, op.path, op.value);
    else graph.setPath(op.id, op.path, op.value);
  }
  if (op.op === "setValue") trackerValues[op.id] = op.value;
  if (op.op === "setExpr") {
    const value = evaluateExpression(op.expr, trackerValues);
    if (isCameraTarget(op.id, op.path)) setCameraPath(camera, op.path, value);
    else graph.setPath(op.id, op.path, value);
  }
  if (op.op === "bindExpr") {
    const value = evaluateExpression(op.expr, trackerValues);
    if (isCameraTarget(op.id, op.path)) setCameraPath(camera, op.path, value);
    else graph.setPath(op.id, op.path, value);
  }
  if (op.op === "bindPath") {
    const d = buildPathData(op, trackerValues);
    if (op.path === "geometry.d") graph.setPathData(op.id, d);
    else graph.setPath(op.id, op.path, d);
  }
  if (op.op === "followCamera") {
    const target = graph.get(op.id);
    if (target && camera) {
      camera.target = { x: target.transform.x, y: target.transform.y };
      camera.mode = camera.mode ?? "target";
      if (op.frameId) {
        graph.setPath(op.frameId, "transform.x", target.transform.x);
        graph.setPath(op.frameId, "transform.y", target.transform.y);
      }
    }
  }
  // Effect operations are semantic hints for future renderers; fallback
  // visibility changes are represented by ordinary animate operations.
}

export interface TickPhaseResult {
  trackerValues: Record<string, number>;
  postAnimationUpdaters: InstantOperation[];
}

export function applyTimelineAt(
  graph: SceneGraph,
  timeline: TimelineOperation[],
  seconds: number,
  values: ValueTracker[] = [],
  camera?: Camera,
): TickPhaseResult {
  const trackerValues: Record<string, number> = Object.fromEntries(
    values.map((value) => [value.id, value.initial]),
  );

  const postAnimationUpdaters: InstantOperation[] = [];
  for (const op of orderedTimeline(timeline)) {
    if (op.op === "effect") {
      continue;
    }

    if (op.op === "animate") {
      if (seconds < op.t) continue;
      const progress = op.duration <= 0 ? 1 : ease(op.easing, (seconds - op.t) / op.duration);
      const value = interpolate(op.from, op.to, progress);
      if (isCameraTarget(op.id, op.path)) applyCameraInterpolation(camera, op.path, value);
      else graph.setPath(op.id, op.path, value);
    } else if (op.op === "animateValue") {
      if (seconds < op.t) continue;
      const progress = op.duration <= 0 ? 1 : ease(op.easing, (seconds - op.t) / op.duration);
      const value = interpolate(op.from, op.to, progress);
      if (typeof value === "number") trackerValues[op.id] = value;
    } else if (op.t <= seconds) {
      if (op.op === "bindExpr" || op.op === "bindPath" || op.op === "followCamera") {
        if (op.op === "bindExpr" && op.duration !== undefined && seconds > op.t + op.duration) continue;
        if (op.op === "followCamera" && op.duration !== undefined && seconds > op.t + op.duration) continue;
        postAnimationUpdaters.push(op);
      }
      else applyInstantOp(graph, op, trackerValues, camera);
    }
  }

  for (const updater of postAnimationUpdaters) applyInstantOp(graph, updater, trackerValues, camera);
  return { trackerValues, postAnimationUpdaters };
}

const MAX_PLOT_SAMPLES = 512;
const SIMPLIFY_EPSILON = 0.35;

function buildPathData(op: BindPathOperation, trackerValues: Record<string, number>): string {
  const tMin = evaluateExpression(op.tMinExpr, trackerValues);
  const tMax = evaluateExpression(op.tMaxExpr, trackerValues);
  if (op.pathType === "arc") {
    return arcToSvgPath(op.radius ?? 0, tMin, tMax, {
      ...(op.close === undefined ? {} : { close: op.close }),
    });
  }

  const effectiveSamples = Math.min(op.samples, MAX_PLOT_SAMPLES);
  const stride = op.samples > MAX_PLOT_SAMPLES ? Math.ceil(op.samples / MAX_PLOT_SAMPLES) : 1;
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < op.samples; i += stride) {
    const unit = effectiveSamples === 1 ? 0 : i / (op.samples - 1);
    const t = tMin + (tMax - tMin) * unit;
    const scope = { ...trackerValues, t };
    points.push({
      x: evaluateExpression(op.xExpr, scope),
      y: evaluateExpression(op.yExpr, scope),
    });
  }
  if (points.length === 0) return "";
  const simplified = simplifyPolyline(points, SIMPLIFY_EPSILON);
  return pointsToSvgPath(simplified, {
    ...(op.close === undefined ? {} : { close: op.close }),
    smooth: op.smoothing === "smooth",
  });
}

function orderedTimeline(timeline: TimelineOperation[]): TimelineOperation[] {
  return timeline
    .map((op, index) => ({ op, index }))
    .sort((left, right) => {
      if (left.op.t !== right.op.t) return left.op.t - right.op.t;
      const priority = OPERATION_PRIORITY[left.op.op] - OPERATION_PRIORITY[right.op.op];
      return priority === 0 ? left.index - right.index : priority;
    })
    .map(({ op }) => op);
}


function isCameraTarget(id: string, path?: string): boolean {
  return id === "camera" && (path === undefined || path.startsWith("camera."));
}

function setCameraPath(camera: Camera | undefined, path: string, value: unknown): void {
  if (!camera) return;
  const key = path.slice("camera.".length);
  if (key === "x" || key === "y" || key === "scale" || key === "rotation") {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) camera[key] = numericValue;
  }
  if (key === "padding") {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) camera.padding = numericValue;
  }
  if (key === "target.x" || key === "target.y") {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      const axis = key.endsWith(".x") ? "x" : "y";
      camera.target = { ...(camera.target ?? { x: 0, y: 0 }), [axis]: numericValue };
    }
  }
  if (key === "mode" && (value === "center" || value === "target" || value === "frame-fit")) {
    camera.mode = value;
  }
}

function applyCameraInterpolation(camera: Camera | undefined, path: string, value: unknown): void {
  setCameraPath(camera, path, value);
}


function simplifyPolyline(points: Array<{ x: number; y: number }>, epsilon: number): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;
  const out = [points[0]!];
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = out[out.length - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;
    const area2 = Math.abs((curr.x - prev.x) * (next.y - prev.y) - (curr.y - prev.y) * (next.x - prev.x));
    const base = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
    const dist = area2 / base;
    if (dist >= epsilon) out.push(curr);
  }
  out.push(points[points.length - 1]!);
  return out;
}
