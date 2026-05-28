import test from "node:test";
import assert from "node:assert/strict";
import { SceneGraph } from "./sceneGraph.js";
import { applyTimelineAt } from "./timeline.js";
import { applyTargetTraces, Player } from "./player.js";
import { buildCameraTransform } from "../renderers/svgRenderer.js";
import { ease } from "../easing.js";
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

test("matches Manim smooth rate function samples", () => {
  assert.equal(ease("smooth", -0.5), 0);
  assert.equal(ease("smooth", 0), 0);
  assert.equal(ease("smooth", 0.5), 0.5);
  assert.equal(ease("smooth", 1), 1);
  assert.equal(ease("smooth", 1.5), 1);
  assert.equal(Math.abs(ease("smooth", 0.25) - 0.07010371654510815) < 1e-12, true);
  assert.equal(Math.abs(ease("smooth", 0.75) - 0.9298962834548918) < 1e-12, true);
  assert.equal(ease("easeInOut", 0.25), ease("smooth", 0.25));
});

test("applies camera animation interpolation", () => {
  const graph = new SceneGraph([node]);
  const camera = { x: 0, y: 0, scale: 1, rotation: 0 };
  applyTimelineAt(
    graph,
    [
      { t: 0, op: "animate", id: "camera", path: "camera.x", from: 0, to: 100, duration: 2, easing: "linear" },
      { t: 0, op: "animate", id: "camera", path: "camera.scale", from: 1, to: 2, duration: 2, easing: "linear" },
    ],
    1,
    [],
    camera,
  );
  assert.equal(camera.x, 50);
  assert.equal(camera.scale, 1.5);
});

test("updates camera target from followed node after animations", () => {
  const graph = new SceneGraph([node]);
  const camera = { x: 0, y: 0, scale: 1, rotation: 0, target: { x: 0, y: 0 }, mode: "target" as const };
  applyTimelineAt(
    graph,
    [
      { t: 0, op: "animate", id: "c1", path: "transform.x", from: 0, to: 100, duration: 2, easing: "linear" },
      { t: 0, op: "animate", id: "c1", path: "transform.y", from: 0, to: -40, duration: 2, easing: "linear" },
      { t: 0, op: "followCamera", id: "c1", duration: 2 },
    ],
    1,
    [],
    camera,
  );
  assert.equal(JSON.stringify(camera.target), JSON.stringify({ x: 50, y: -20 }));
});

test("builds camera transforms around the scene center", () => {
  assert.equal(
    buildCameraTransform({ x: 0, y: 0, scale: 1, rotation: 0 }, 1280, 720),
    "translate(640 360) rotate(0) scale(1) translate(0 0)",
  );
  assert.equal(
    buildCameraTransform({ x: -24, y: 18, scale: 1.6, rotation: 15 }, 1280, 720),
    "translate(616 378) rotate(15) scale(1.6) translate(0 0)",
  );
});

test("builds camera transforms around explicit targets", () => {
  assert.equal(
    buildCameraTransform({ x: 0, y: 0, scale: 2, rotation: 0, target: { x: 100, y: 120 }, mode: "target" }, 1280, 720),
    "translate(640 360) rotate(0) scale(2) translate(-100 -120)",
  );
  assert.equal(
    buildCameraTransform({ x: 0, y: 0, scale: 2, rotation: 0, target: { x: 100, y: 120 }, padding: 90, mode: "frame-fit" }, 1280, 720),
    "translate(640 360) rotate(0) scale(1.5) translate(-100 -120)",
  );
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

test("resamples SVG paths with different command topology before morphing", () => {
  const graph = new SceneGraph([{ ...node, type: "path", geometry: { d: "M 0 0 L 10 10" } }]);
  applyTimelineAt(graph, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from: "M 0 0 L 10 10", to: "M 10 20 C 30 40 50 60 70 80", duration: 1, easing: "linear" }], 0.5);

  const d = graph.get("c1")?.geometry.d;
  assert.equal(typeof d, "string");
  assert.equal(d !== "M 0 0 L 10 10", true);
  assert.equal(d !== "M 10 20 C 30 40 50 60 70 80", true);
  assert.equal(/^M 5 10 L /u.test(d as string), true);
});

test("keeps original SVG path topology at animation endpoints", () => {
  const from = "M 0 0 L 10 10";
  const to = "M 10 20 C 30 40 50 60 70 80";

  const atStart = new SceneGraph([{ ...node, type: "path", geometry: { d: from } }]);
  applyTimelineAt(atStart, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from, to, duration: 1, easing: "linear" }], 0);
  assert.equal(atStart.get("c1")?.geometry.d, from);

  const atEnd = new SceneGraph([{ ...node, type: "path", geometry: { d: from } }]);
  applyTimelineAt(atEnd, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from, to, duration: 1, easing: "linear" }], 1);
  assert.equal(atEnd.get("c1")?.geometry.d, to);
});

test("falls back to step switching for unsupported SVG path morph fallback commands", () => {
  const beforeEnd = new SceneGraph([{ ...node, type: "path", geometry: { d: "M 0 0 A 10 10 0 0 1 20 20" } }]);
  applyTimelineAt(beforeEnd, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from: "M 0 0 A 10 10 0 0 1 20 20", to: "M 10 20 L 30 40 L 50 60", duration: 1, easing: "linear" }], 0.5);
  assert.equal(beforeEnd.get("c1")?.geometry.d, "M 0 0 A 10 10 0 0 1 20 20");

  const atEnd = new SceneGraph([{ ...node, type: "path", geometry: { d: "M 0 0 A 10 10 0 0 1 20 20" } }]);
  applyTimelineAt(atEnd, [{ t: 0, op: "animate", id: "c1", path: "geometry.d", from: "M 0 0 A 10 10 0 0 1 20 20", to: "M 10 20 L 30 40 L 50 60", duration: 1, easing: "linear" }], 1);
  assert.equal(atEnd.get("c1")?.geometry.d, "M 10 20 L 30 40 L 50 60");
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
    camera: { x: 0, y: 0, scale: 1, rotation: 0 },
    nodes: [node],
    timeline: [{ t: 0.5, op: "create", node }],
  };

  const player = new Player(documentData, renderer as never);
  player.seek(0);
  assert.equal(rendered.length, 0);

  player.seek(0.5);
  assert.equal(rendered[0]?.id, "c1");
});

test("player preserves extended camera settings while seeking", () => {
  let renderedCamera;
  const renderer = { render: (_nodes: SceneNode[], camera: unknown) => (renderedCamera = camera) };
  const documentData: FluxionDocument = {
    version: "0.1",
    width: 1280,
    height: 720,
    fps: 60,
    duration: 1,
    camera: { x: 0, y: 0, scale: 1, rotation: 0, target: { x: 100, y: 120 }, padding: 90, mode: "frame-fit" },
    nodes: [node],
    timeline: [],
  };

  const player = new Player(documentData, renderer as never);
  player.seek(0);
  assert.equal(JSON.stringify(renderedCamera), JSON.stringify(documentData.camera));
  assert.equal(renderedCamera === documentData.camera, false);
});

test("rebuilds target traced paths from sampled timeline history", () => {
  const traceNode: SceneNode = {
    id: "trace",
    type: "path",
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    style: { fill: "none", stroke: "#fff", strokeWidth: 2 },
    geometry: { d: "", tracedPath: true, tracedTarget: "c1", traceStart: 0, traceSamples: 3 },
    children: [],
  };
  const documentData: FluxionDocument = {
    version: "0.1",
    width: 1280,
    height: 720,
    fps: 60,
    duration: 2,
    camera: { x: 0, y: 0, scale: 1, rotation: 0 },
    nodes: [node, traceNode],
    timeline: [
      { t: 0, op: "animate", id: "c1", path: "transform.x", from: 0, to: 100, duration: 2, easing: "linear" },
      { t: 0, op: "animate", id: "c1", path: "transform.y", from: 0, to: -50, duration: 2, easing: "linear" },
    ],
  };
  const graph = new SceneGraph(documentData.nodes);
  applyTimelineAt(graph, documentData.timeline, 2, documentData.values);
  applyTargetTraces(graph, documentData, 2);
  assert.equal(
    graph.get("trace")?.geometry.d,
    "M 0 0 C 8.333333333333334 -4.166666666666667 33.33333333333333 -16.666666666666664 50 -25 C 66.66666666666667 -33.333333333333336 91.66666666666667 -45.833333333333336 100 -50",
  );
});

test("builds bound angle arcs as circular cubic paths", () => {
  const arcNode: SceneNode = {
    id: "arc",
    type: "path",
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    style: { fill: "none", stroke: "#fff", strokeWidth: 4 },
    geometry: { d: "" },
    children: [],
  };
  const documentData: FluxionDocument = {
    version: "0.1",
    width: 1280,
    height: 720,
    fps: 60,
    duration: 1,
    camera: { x: 0, y: 0, scale: 1, rotation: 0 },
    nodes: [arcNode],
    timeline: [
      {
        t: 0,
        op: "bindPath",
        id: "arc",
        path: "geometry.d",
        pathType: "arc",
        radius: 60,
        samples: 72,
        tMinExpr: "0",
        tMaxExpr: "theta",
        xExpr: "60*cos(t)",
        yExpr: "60*sin(t)",
      },
    ],
    values: [{ id: "theta", initial: Math.PI / 2 }],
  };
  const graph = new SceneGraph(documentData.nodes);
  applyTimelineAt(graph, documentData.timeline, 0, documentData.values);
  assert.equal(
    graph.get("arc")?.geometry.d,
    "M 60 0 C 60 33.1370849898476 33.13708498984761 60 3.67394039744206e-15 60",
  );
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

test("evaluates value tracker animations before dependent property expressions", () => {
  const graph = new SceneGraph([node]);
  const values = [{ id: "theta", initial: 0 }];
  const timeline: TimelineOperation[] = [
    { t: 0, op: "animateValue", id: "theta", from: 0, to: Math.PI, duration: 2, easing: "linear" },
    { t: 0, op: "setExpr", id: "c1", path: "transform.x", expr: "320 + 100 * cos(theta)" },
    { t: 0, op: "setExpr", id: "c1", path: "transform.y", expr: "240 + 100 * sin(theta)" },
  ];

  const trackerValues = applyTimelineAt(graph, timeline, 1, values).trackerValues;
  assert.equal(Math.round(graph.get("c1")?.transform.x ?? 0), 320);
  assert.equal(Math.round(graph.get("c1")?.transform.y ?? 0), 340);
  assert.equal(trackerValues.theta, Math.PI / 2);
});


test("runs bindExpr after animateValue on each tick", () => {
  const graph = new SceneGraph([node]);
  const values = [{ id: "phase", initial: 0 }];
  applyTimelineAt(graph, [
    { t: 0, op: "animateValue", id: "phase", from: 0, to: 10, duration: 2, easing: "linear" },
    { t: 0, op: "bindExpr", id: "c1", path: "transform.x", expr: "phase * 2" },
  ], 1, values);
  assert.equal(graph.get("c1")?.transform.x, 10);
});
