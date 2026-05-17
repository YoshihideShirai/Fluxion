import { ease, interpolate } from "../easing.js";
import type { CreateOperation, DeleteOperation, SetOperation, TimelineOperation } from "../types.js";
import type { SceneGraph } from "./sceneGraph.js";

type InstantOperation = CreateOperation | DeleteOperation | SetOperation;

const OPERATION_PRIORITY: Record<TimelineOperation["op"], number> = {
  create: 0,
  set: 1,
  animate: 2,
  delete: 3,
};

export function applyInstantOp(graph: SceneGraph, op: InstantOperation): void {
  if (op.op === "create") graph.upsert(op.node);
  if (op.op === "delete") graph.delete(op.id);
  if (op.op === "set") graph.setPath(op.id, op.path, op.value);
}

export function applyTimelineAt(graph: SceneGraph, timeline: TimelineOperation[], seconds: number): void {
  for (const op of orderedTimeline(timeline)) {
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
