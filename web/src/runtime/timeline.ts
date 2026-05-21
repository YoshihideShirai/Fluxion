import { ease, interpolate } from "../easing.js";
import type {
  CreateOperation,
  DeleteOperation,
  EffectOperation,
  SetExpressionOperation,
  SetOperation,
  SetValueOperation,
  BindExpressionOperation,
  TimelineOperation,
  ValueTracker,
  Camera,
} from "../types.js";
import { evaluateExpression } from "./expression.js";
import type { SceneGraph } from "./sceneGraph.js";

type InstantOperation =
  | CreateOperation
  | DeleteOperation
  | EffectOperation
  | SetOperation
  | SetExpressionOperation
  | SetValueOperation
  | BindExpressionOperation;

const OPERATION_PRIORITY: Record<TimelineOperation["op"], number> = {
  create: 0,
  setValue: 1,
  set: 2,
  effect: 3,
  animateValue: 4,
  animate: 5,
  setExpr: 6,
  bindExpr: 7,
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
      if (isCameraTarget(op.id, op.path)) setCameraPath(camera, op.path, value);
      else graph.setPath(op.id, op.path, value);
    } else if (op.op === "animateValue") {
      if (seconds < op.t) continue;
      const progress = op.duration <= 0 ? 1 : ease(op.easing, (seconds - op.t) / op.duration);
      const value = interpolate(op.from, op.to, progress);
      if (typeof value === "number") trackerValues[op.id] = value;
    } else if (op.t <= seconds) {
      if (op.op === "bindExpr") postAnimationUpdaters.push(op);
      else applyInstantOp(graph, op, trackerValues, camera);
    }
  }

  for (const updater of postAnimationUpdaters) applyInstantOp(graph, updater, trackerValues, camera);
  return { trackerValues, postAnimationUpdaters };
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
}
