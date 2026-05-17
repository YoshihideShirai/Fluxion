import type { DiffStream } from "../types.js";
import type { SceneGraph } from "./sceneGraph.js";
import { applyInstantOp } from "./timeline.js";

export function applyDiff(graph: SceneGraph, diff: DiffStream): void {
  for (const op of diff.ops ?? []) applyInstantOp(graph, { t: 0, ...op });
}
