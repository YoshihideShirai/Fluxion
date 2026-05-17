import { ease, interpolate } from "../easing.js";
import type { CreateOperation, DeleteOperation, EffectOperation, SetOperation, TimelineOperation } from "../types.js";
import type { SceneGraph } from "./sceneGraph.js";

type InstantOperation = CreateOperation | DeleteOperation | EffectOperation | SetOperation;

const OPERATION_PRIORITY: Record<TimelineOperation["op"], number> = {
  create: 0,
  set: 1,
  effect: 2,
  animate: 3,
  delete: 4,
};

export function applyInstantOp(graph: SceneGraph, op: InstantOperation): void {
  if (op.op === "create") graph.upsert(op.node);
  if (op.op === "delete") graph.delete(op.id);
  if (op.op === "set") graph.setPath(op.id, op.path, op.value);
  // Effect operations are semantic hints for future renderers; fallback
  // visibility changes are represented by ordinary animate operations.
}

export function applyTimelineAt(graph: SceneGraph, timeline: TimelineOperation[], seconds: number): void {
  for (const op of orderedTimeline(timeline)) {
    if (op.op === "effect") {
      continue;
    }

    if (op.op === "animate") {
      if (seconds < op.t) continue;
      const progress = op.duration <= 0 ? 1 : ease(op.easing, (seconds - op.t) / op.duration);
      graph.setPath(op.id, op.path, interpolate(op.from, op.to, progress));
    } else if (op.t <= seconds) {
      applyInstantOp(graph, op);
    }
  }
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
