import { ease, interpolate } from "../easing.js";
import type { CreateOperation, DeleteOperation, SetOperation, TimelineOperation } from "../types.js";
import type { SceneGraph } from "./sceneGraph.js";

type InstantOperation = CreateOperation | DeleteOperation | SetOperation;

export function applyInstantOp(graph: SceneGraph, op: InstantOperation): void {
  if (op.op === "create") graph.upsert(op.node);
  if (op.op === "delete") graph.delete(op.id);
  if (op.op === "set") graph.setPath(op.id, op.path, op.value);
}

export function applyTimelineAt(graph: SceneGraph, timeline: TimelineOperation[], seconds: number): void {
  for (const op of timeline) {
    if (op.op === "animate") {
      if (seconds < op.t) continue;
      const progress = ease(op.easing, (seconds - op.t) / op.duration);
      graph.setPath(op.id, op.path, interpolate(op.from, op.to, progress));
    } else if (op.t <= seconds) {
      applyInstantOp(graph, op);
    }
  }
}
