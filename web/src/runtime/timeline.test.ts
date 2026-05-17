import test from "node:test";
import assert from "node:assert/strict";
import { SceneGraph } from "./sceneGraph.js";
import { applyTimelineAt } from "./timeline.js";
import type { SceneNode, TimelineOperation } from "../types.js";

const node: SceneNode = {
  id: "c1",
  type: "circle",
  transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
  style: { fill: "#fff", stroke: "#000", strokeWidth: 2 },
  geometry: { r: 10 },
  children: [],
};

test("applies numeric animation interpolation", () => {
  const graph = new SceneGraph([node]);
  applyTimelineAt(graph, [{ t: 0, op: "animate", id: "c1", path: "transform.x", from: 0, to: 100, duration: 2, easing: "linear" }], 1);
  assert.equal(graph.get("c1")?.transform.x, 50);
});

test("applies create, set, and delete operations", () => {
  const graph = new SceneGraph([]);
  const timeline: TimelineOperation[] = [
    { t: 0, op: "create", node },
    { t: 0.5, op: "set", id: "c1", path: "style.fill", value: "#38bdf8" },
    { t: 1, op: "delete", id: "c1" },
  ];
  applyTimelineAt(graph, timeline, 0.75);
  assert.equal(graph.get("c1")?.style.fill, "#38bdf8");
  applyTimelineAt(graph, [{ t: 1, op: "delete", id: "c1" }], 1);
  assert.equal(graph.get("c1"), undefined);
});
