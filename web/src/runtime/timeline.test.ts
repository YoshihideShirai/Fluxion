import test from "node:test";
import assert from "node:assert/strict";
import { SceneGraph } from "./sceneGraph.js";
import { applyTimelineAt } from "./timeline.js";
import { Player } from "./player.js";
import type { SceneNode, TimelineOperation, FluxionDocument } from "../types.js";

const node: SceneNode = {
  id: "c1",
  type: "circle",
  transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
  style: { fill: "#fff", stroke: "#000", strokeWidth: 2 },
  geometry: { r: 10 },
  children: [],
};

const groupedNode: SceneNode = {
  id: "g1",
  type: "group",
  transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
  style: {},
  geometry: {},
  children: [
    {
      id: "child-circle",
      type: "circle",
      transform: { x: 10, y: 0, scale: 1, rotation: 0, opacity: 1 },
      style: { fill: "#fff", stroke: "#000", strokeWidth: 2 },
      geometry: { r: 5 },
      children: [],
    },
  ],
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

test("applies same-time operations in deterministic runtime order", () => {
  const graph = new SceneGraph([]);
  const timeline: TimelineOperation[] = [
    { t: 0, op: "animate", id: "c1", path: "transform.x", from: 0, to: 100, duration: 1, easing: "linear" },
    { t: 0, op: "set", id: "c1", path: "style.fill", value: "#38bdf8" },
    { t: 0, op: "create", node },
  ];

  applyTimelineAt(graph, timeline, 0.5);
  assert.equal(graph.get("c1")?.style.fill, "#38bdf8");
  assert.equal(graph.get("c1")?.transform.x, 50);
});

test("lets delete win over other same-time operations", () => {
  const graph = new SceneGraph([]);
  const timeline: TimelineOperation[] = [
    { t: 0, op: "delete", id: "c1" },
    { t: 0, op: "create", node },
    { t: 0, op: "animate", id: "c1", path: "transform.x", from: 0, to: 100, duration: 1, easing: "linear" },
  ];

  applyTimelineAt(graph, timeline, 0.5);
  assert.equal(graph.get("c1"), undefined);
});

test("applies zero-duration animations as immediate final values", () => {
  const graph = new SceneGraph([node]);
  applyTimelineAt(graph, [{ t: 0, op: "animate", id: "c1", path: "transform.x", from: 0, to: 100, duration: 0, easing: "linear" }], 0);
  assert.equal(graph.get("c1")?.transform.x, 100);
});

test("interpolates CSS color animations", () => {
  const graph = new SceneGraph([node]);
  applyTimelineAt(graph, [{ t: 0, op: "animate", id: "c1", path: "style.fill", from: "#000", to: "rgb(255, 255, 255)", duration: 1, easing: "linear" }], 0.5);
  assert.equal(graph.get("c1")?.style.fill, "rgb(128, 128, 128)");
});

test("interpolates same-length number arrays", () => {
  const graph = new SceneGraph([{ ...node, geometry: { points: [0, 10, 20] } }]);
  applyTimelineAt(graph, [{ t: 0, op: "animate", id: "c1", path: "geometry.points", from: [0, 10, 20], to: [10, 30, 50], duration: 1, easing: "linear" }], 0.5);
  assert.equal(JSON.stringify(graph.get("c1")?.geometry.points), JSON.stringify([5, 20, 35]));
});

test("morphs SVG paths with matching command structure", () => {
  const graph = new SceneGraph([{ ...node, type: "path", geometry: { d: "M 0 0 L 10 10" } }]);
  applyTimelineAt(graph, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from: "M 0 0 L 10 10", to: "M 10 20 L 30 40", duration: 1, easing: "linear" }], 0.5);
  assert.equal(graph.get("c1")?.geometry.d, "M 5 10 L 20 25");
});

test("falls back to step switching for unsupported string animations", () => {
  const beforeEnd = new SceneGraph([node]);
  applyTimelineAt(beforeEnd, [{ t: 0, op: "animate", id: "c1", path: "style.fill", from: "currentColor", to: "none", duration: 1, easing: "linear" }], 0.5);
  assert.equal(beforeEnd.get("c1")?.style.fill, "currentColor");

  const atEnd = new SceneGraph([node]);
  applyTimelineAt(atEnd, [{ t: 0, op: "animate", id: "c1", path: "style.fill", from: "currentColor", to: "none", duration: 1, easing: "linear" }], 1);
  assert.equal(atEnd.get("c1")?.style.fill, "none");
});

test("falls back to step switching for incompatible SVG path morphs", () => {
  const beforeEnd = new SceneGraph([{ ...node, type: "path", geometry: { d: "M 0 0 L 10 10" } }]);
  applyTimelineAt(beforeEnd, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from: "M 0 0 L 10 10", to: "M 10 20 C 30 40 50 60 70 80", duration: 1, easing: "linear" }], 0.5);
  assert.equal(beforeEnd.get("c1")?.geometry.d, "M 0 0 L 10 10");

  const atEnd = new SceneGraph([{ ...node, type: "path", geometry: { d: "M 0 0 L 10 10" } }]);
  applyTimelineAt(atEnd, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from: "M 0 0 L 10 10", to: "M 10 20 C 30 40 50 60 70 80", duration: 1, easing: "linear" }], 1);
  assert.equal(atEnd.get("c1")?.geometry.d, "M 10 20 C 30 40 50 60 70 80");
});

test("player starts from an empty graph when documents contain create operations", () => {
  let rendered: SceneNode[] = [];
  const renderer = { render: (nodes: SceneNode[]) => (rendered = nodes) };
  const documentData: FluxionDocument = {
    version: "0.1",
    width: 1280,
    height: 720,
    fps: 60,
    duration: 1,
    nodes: [node],
    timeline: [{ t: 0.5, op: "create", node }],
  };

  const player = new Player(documentData, renderer as never);
  player.seek(0);
  assert.equal(rendered.length, 0);

  player.seek(0.5);
  assert.equal(rendered[0]?.id, "c1");
});

test("ignores semantic effect operations while applying fallback animations", () => {
  const graph = new SceneGraph([]);
  const hiddenNode: SceneNode = structuredClone(node);
  hiddenNode.transform.opacity = 0;
  const timeline: TimelineOperation[] = [
    { t: 0, op: "create", node: hiddenNode },
    { t: 0, op: "effect", id: "c1", effect: "fadeIn", duration: 1, easing: "linear" },
    { t: 0, op: "animate", id: "c1", path: "transform.opacity", from: 0, to: 1, duration: 1, easing: "linear" },
  ];

  applyTimelineAt(graph, timeline, 0.5);
  assert.equal(graph.get("c1")?.transform.opacity, 0.5);
});

test("targets child nodes inside groups with timeline operations", () => {
  const graph = new SceneGraph([groupedNode]);

  graph.setPath("child-circle", "style.fill", "#38bdf8");
  assert.equal(graph.get("child-circle")?.style.fill, "#38bdf8");
  assert.equal(graph.get("g1")?.children[0]?.style.fill, "#38bdf8");
  assert.equal(JSON.stringify(graph.all().map((root) => root.id)), JSON.stringify(["g1"]));

  graph.delete("child-circle");
  assert.equal(graph.get("child-circle"), undefined);
  assert.equal(JSON.stringify(graph.get("g1")?.children), JSON.stringify([]));
});

test("applies timeline animations to child nodes inside groups", () => {
  const graph = new SceneGraph([groupedNode]);

  applyTimelineAt(
    graph,
    [{ t: 0, op: "animate", id: "child-circle", path: "transform.x", from: 10, to: 30, duration: 2, easing: "linear" }],
    1,
  );

  assert.equal(graph.get("child-circle")?.transform.x, 20);
  assert.equal(graph.get("g1")?.children[0]?.transform.x, 20);
});
