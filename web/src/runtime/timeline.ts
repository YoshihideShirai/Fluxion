import { ease, interpolate } from "../easing.js";
import type {
  CreateOperation,
  DeleteOperation,
  EffectOperation,
  SetExpressionOperation,
  SetOperation,
  SetValueOperation,
  TimelineOperation,
  ValueTracker,
} from "../types.js";
import { evaluateExpression } from "./expression.js";
import type { SceneGraph } from "./sceneGraph.js";

type InstantOperation =
  | CreateOperation
  | DeleteOperation
  | EffectOperation
  | SetOperation
  | SetExpressionOperation
  | SetValueOperation;

const OPERATION_PRIORITY: Record<TimelineOperation["op"], number> = {
  create: 0,
  setValue: 1,
  set: 2,
  effect: 3,
  animateValue: 4,
  animate: 5,
  setExpr: 6,
  delete: 7,
};

export function applyInstantOp(
  graph: SceneGraph,
  op: InstantOperation,
  trackerValues: Record<string, number> = {},
): void {
  if (op.op === "create") graph.upsert(op.node);
  if (op.op === "delete") graph.delete(op.id);
  if (op.op === "set") graph.setPath(op.id, op.path, op.value);
  if (op.op === "setValue") trackerValues[op.id] = op.value;
  if (op.op === "setExpr")
    graph.setPath(op.id, op.path, evaluateExpression(op.expr, trackerValues));
  // Effect operations are semantic hints for future renderers; fallback
  // visibility changes are represented by ordinary animate operations.
}

export function applyTimelineAt(
  graph: SceneGraph,
  timeline: TimelineOperation[],
  seconds: number,
  values: ValueTracker[] = [],
): Record<string, number> {
  const trackerValues: Record<string, number> = Object.fromEntries(
    values.map((value) => [value.id, value.initial]),
  );

  for (const op of orderedTimeline(timeline)) {
    if (op.op === "effect") {
      continue;
    }

    if (op.op === "animate") {
      if (seconds < op.t) continue;
      const progress = op.duration <= 0 ? 1 : ease(op.easing, (seconds - op.t) / op.duration);
      graph.setPath(op.id, op.path, interpolate(op.from, op.to, progress));
    } else if (op.op === "animateValue") {
      if (seconds < op.t) continue;
      const progress = op.duration <= 0 ? 1 : ease(op.easing, (seconds - op.t) / op.duration);
      const value = interpolate(op.from, op.to, progress);
      if (typeof value === "number") trackerValues[op.id] = value;
    } else if (op.t <= seconds) {
      applyInstantOp(graph, op, trackerValues);
    }
  }

  return trackerValues;
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
