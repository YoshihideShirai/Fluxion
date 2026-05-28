import test from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import { compileTextDsl, DslCompileError } from "./compiler.js";
import type { AnimateOperation, CreateOperation, SetOperation } from "../types.js";

function mustFail(source: string): DslCompileError {
  try {
    compileTextDsl(source);
  } catch (error) {
    if (error instanceof DslCompileError) return error;
    throw error;
  }
  throw new Error("Expected DSL compilation to fail.");
}

function equalJson(actual: unknown, expected: unknown): void {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
}

function messageMatches(source: string, pattern: RegExp): void {
  assert.equal(pattern.test(mustFail(source).message), true);
}

function extractPlaygroundDemo(): string {
  const html = fs.readFileSync("index.html", "utf8");
  const match = html.match(
    /<textarea id="dsl" spellcheck="false">([\s\S]*?)<\/textarea>/u,
  );
  if (!match?.[1]) throw new Error("Expected playground DSL textarea.");
  return match[1]
    .replace(/&quot;/gu, '"')
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">");
}

function assertNoOverlappingAnimations(
  documentData: ReturnType<typeof compileTextDsl>,
): void {
  const animations = documentData.timeline.filter((op) => op.op === "animate");
  for (let leftIndex = 0; leftIndex < animations.length; leftIndex += 1) {
    const left = animations[leftIndex];
    if (!left) continue;
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < animations.length;
      rightIndex += 1
    ) {
      const right = animations[rightIndex];
      if (!right) continue;
      const overlaps =
        Math.max(left.t, right.t) <
        Math.min(left.t + left.duration, right.t + right.duration);
      assert.equal(
        left.id === right.id && left.path === right.path && overlaps,
        false,
        `Overlapping animations target ${left.id}.${left.path} at ${left.t}s and ${right.t}s.`,
      );
    }
  }
}

test("compiles the playground demo without overlapping same-target animations", () => {
  const documentData = compileTextDsl(extractPlaygroundDemo());

  assert.equal(documentData.duration, 9.4);
  assertNoOverlappingAnimations(documentData);
});

test("compiles every gallery Text DSL example", () => {
  const galleryDir = "../examples/gallery";
  const files = [
    "arg-min-example.fluxion.txt",
    "boolean-operations.fluxion.txt",
    "fixed-in-frame-m-object-test.fluxion.txt",
    "gradient-image-from-array.fluxion.txt",
    "graph-area-plot.fluxion.txt",
    "heat-diagram-plot.fluxion.txt",
    "moving-angle.fluxion.txt",
    "moving-around.fluxion.txt",
    "moving-dots.fluxion.txt",
    "moving-group-to-destination.fluxion.txt",
    "moving-zoomed-scene-around.fluxion.txt",
    "moving_frame_box.fluxion.txt",
    "point-with-trace.fluxion.txt",
    "polygon-on-axes.fluxion.txt",
    "sine-curve-unit-circle.fluxion.txt",
    "vector-arrow.fluxion.txt",
  ];

  assert.equal(files.length > 0, true);
  for (const file of files) {
    const source = fs.readFileSync(`${galleryDir}/${file}`, "utf8");
    try {
      compileTextDsl(source);
    } catch (error) {
      throw new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
});

test("includes wait-only tail time in document duration", () => {
  const documentData = compileTextDsl(`circle c r=20
play FadeIn(c) duration=1s
wait 1.4s`);

  assert.equal(documentData.duration, 2.4);
});

test("includes waits inside at blocks in document duration", () => {
  const documentData = compileTextDsl(`circle c r=20
at 3s:
  play FadeIn(c) duration=1s
  wait 2s`);

  assert.equal(documentData.duration, 6);
});

test("compiles scene camera and camera animations", () => {
  const documentData = compileTextDsl(`camera at 10,20 scale=1.5 rotation=5
animate camera.x from 10 to 110 duration=2s easing=linear
animate camera.scale from 1.5 to 2 duration=2s`);

  equalJson(documentData.camera, {
    x: 10,
    y: 20,
    scale: 1.5,
    rotation: 5,
    target: { x: 0, y: 0 },
    padding: 0,
    mode: "center",
  });
  equalJson(
    documentData.timeline.map((op) =>
      op.op === "animate" ? [op.id, op.path, op.from, op.to, op.duration, op.easing] : [],
    ),
    [
      ["camera", "camera.x", 10, 110, 2, "linear"],
      ["camera", "camera.scale", 1.5, 2, 2, "smooth"],
    ],
  );
});

test("compiles nested camera target properties", () => {
  const documentData = compileTextDsl(`camera mode=target target=0,0 scale=1
value theta = 0
always camera.target.x = expr=100*cos(theta)
animate camera.target.y from 0 to 120 duration=1s
animate theta from 0 to 3.141592654 duration=1s`);

  const bind = documentData.timeline.find((op) => op.op === "bindExpr" && op.path === "camera.target.x");
  if (bind?.op !== "bindExpr") throw new Error("Expected camera target bindExpr.");
  assert.equal(bind.id, "camera");
  assert.equal(bind.expr, "100*cos(theta)");

  const animate = documentData.timeline.find((op) => op.op === "animate" && op.path === "camera.target.y");
  if (animate?.op !== "animate") throw new Error("Expected camera target animate operation.");
  assert.equal(animate.id, "camera");
  assert.equal(animate.to, 120);
});

test("compiles cameraFrame and animateFrame sugar", () => {
  const documentData = compileTextDsl(`cameraFrame at 10,20 scale=1.5 rotation=5
animateFrame to 110,45 scale=2 rotation=15 duration=2s easing=linear
animateFrame to -20,-30 scale=1.25 duration=1s easing=easeInOut`);

  equalJson(documentData.camera, {
    x: 10,
    y: 20,
    scale: 1.5,
    rotation: 5,
    target: { x: 0, y: 0 },
    padding: 0,
    mode: "center",
  });
  equalJson(
    documentData.timeline
      .filter((op): op is AnimateOperation => op.op === "animate")
      .map((op) => [op.id, op.path, op.from, op.to, op.duration, op.easing]),
    [
      ["camera", "camera.x", 10, 110, 2, "linear"],
      ["camera", "camera.y", 20, 45, 2, "linear"],
      ["camera", "camera.scale", 1.5, 2, 2, "linear"],
      ["camera", "camera.rotation", 5, 15, 2, "linear"],
      ["camera", "camera.x", 110, -20, 1, "easeInOut"],
      ["camera", "camera.y", 45, -30, 1, "easeInOut"],
      ["camera", "camera.scale", 2, 1.25, 1, "easeInOut"],
      ["camera", "camera.rotation", 15, 15, 1, "easeInOut"],
    ],
  );
});

test("compiles scene, nodes, styles, animation, and at blocks", () => {
  const documentData = compileTextDsl(`scene width=800 height=450 fps=30

circle c1 r=24 at 100,200 fill="#38bdf8" fillOpacity=0.75 stroke="#0f172a" strokeOpacity=0.6 strokeWidth=3
rect box w=80 h=40 at 300,200 fill="#f97316" opacity=0.8
line axis x1=-50 y1=0 x2=50 y2=0 at 400,350 stroke="#e2e8f0" strokeWidth=2
text title "Fluxion Text DSL" at 400,80 size=28 fill="#e2e8f0"

at 0s:
  show title
  show c1

animate c1.x from 100 to 300 duration=1.5s easing=easeInOut
at 1s:
  animate box.opacity from 0.8 to 0.25 duration=0.5s easing=smooth`);

  assert.equal(documentData.version, "0.1");
  assert.equal(documentData.width, 800);
  assert.equal(documentData.height, 450);
  assert.equal(documentData.fps, 30);
  assert.equal(documentData.duration, 1.5);
  equalJson(
    documentData.nodes.map((node) => node.id),
    ["c1", "box", "axis", "title"],
  );

  const circle = documentData.nodes.find((node) => node.id === "c1");
  assert.equal(circle?.type, "circle");
  assert.equal(circle?.transform.x, 100);
  assert.equal(circle?.transform.y, 200);
  assert.equal(circle?.geometry.r, 24);
  assert.equal(circle?.style.fill, "#38bdf8");
  assert.equal(circle?.style.fillOpacity, 0.75);
  assert.equal(circle?.style.strokeOpacity, 0.6);
  assert.equal(circle?.style.strokeWidth, 3);

  const line = documentData.nodes.find((node) => node.id === "axis");
  assert.equal(line?.geometry.x1, -50);
  assert.equal(line?.geometry.x2, 50);

  const title = documentData.nodes.find((node) => node.id === "title");
  assert.equal(title?.text, "Fluxion Text DSL");
  assert.equal(title?.geometry.fontSize, 28);

  equalJson(
    documentData.timeline
      .filter((op) => op.op === "create")
      .map((op) => op.node.id),
    ["box", "axis", "title", "c1"],
  );
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "animate")
      .map((op) => [op.id, op.path, op.t, op.duration, op.easing]),
    [
      ["c1", "transform.x", 0, 1.5, "easeInOut"],
      ["box", "transform.opacity", 1, 0.5, "smooth"],
    ],
  );
});



test("compiles triangle nodes with width and height geometry", () => {
  const documentData = compileTextDsl(
    `triangle tri w=120 h=96 at 360,220 fill="#ef4444" stroke="#111827" strokeWidth=3`,
  );

  const triangle = documentData.nodes[0];
  assert.equal(triangle?.type, "triangle");
  assert.equal(triangle?.geometry.w, 120);
  assert.equal(triangle?.geometry.h, 96);
  assert.equal(triangle?.transform.x, 360);
  assert.equal(triangle?.transform.y, 220);
  assert.equal(triangle?.style.fill, "#ef4444");
  assert.equal(triangle?.style.stroke, "#111827");
});

test("compiles path nodes with SVG d geometry", () => {
  const documentData = compileTextDsl(
    `path curve d="M 0 0 C 20 40 40 40 60 0" at 100,120 fill="none" stroke="#38bdf8" strokeWidth=4`,
  );

  const path = documentData.nodes[0];
  assert.equal(path?.type, "path");
  assert.equal(path?.geometry.d, "M 0 0 C 20 40 40 40 60 0");
  assert.equal(path?.transform.x, 100);
  assert.equal(path?.transform.y, 120);
  assert.equal(path?.style.fill, "none");
  assert.equal(path?.style.stroke, "#38bdf8");
  assert.equal(path?.style.strokeWidth, 4);
  equalJson(
    documentData.timeline.map((op) =>
      op.op === "create" ? [op.node.id, op.node.geometry.d] : [],
    ),
    [["curve", "M 0 0 C 20 40 40 40 60 0"]],
  );
});

test("compiles path-to-path Transform as drawable morph", () => {
  const square =
    "M 0 -84.853 C 0 -84.853 84.853 0 84.853 0 C 84.853 0 0 84.853 0 84.853 C 0 84.853 -84.853 0 -84.853 0 C -84.853 0 0 -84.853 0 -84.853 Z";
  const circle =
    "M 0 -56 C 30.928 -56 56 -30.928 56 0 C 56 30.928 30.928 56 0 56 C -30.928 56 -56 30.928 -56 0 C -56 -30.928 -30.928 -56 0 -56 Z";
  const documentData = compileTextDsl(`path square d="${square}" fill="#ec4899" fillOpacity=0 stroke="#ffffff" strokeWidth=4
path circle d="${circle}" fill="#ec4899" fillOpacity=0.5 stroke="#ffffff" strokeWidth=4
play Transform(square, circle) duration=1s`);

  const animations = documentData.timeline.filter(
    (op): op is AnimateOperation => op.op === "animate" && op.id === "square",
  );
  assert.equal(animations.some((op) => op.path === "geometry.d" && op.from === square && op.to === circle), true);
  assert.equal(animations.some((op) => op.path === "style.fillOpacity" && op.from === 0 && op.to === 0.5), true);
});

test("compiles brace sharpness and label placement options", () => {
  const documentData = compileTextDsl(`line segment x1=-80 y1=20 x2=80 y2=-20 stroke="#ff862f"
brace br target=segment direction=perpendicular buff=22 sharpness=2 label="x-x_1" labelRenderer=katex labelW=90 labelH=70 labelOffset=4 labelAlignment=end fill="#ffffff"`);

  const brace = documentData.nodes.find((node) => node.id === "br");
  assert.equal(brace?.type, "brace");
  assert.equal(brace?.geometry.target, "segment");
  assert.equal(brace?.geometry.direction, "perpendicular");
  assert.equal(brace?.geometry.buff, 22);
  assert.equal(brace?.geometry.sharpness, 2);
  assert.equal(brace?.geometry.labelOffset, 4);
  assert.equal(brace?.geometry.labelAlignment, "end");
  assert.equal(brace?.geometry.label, "x-x_1");
  assert.equal(brace?.geometry.labelRenderer, "katex");
  assert.equal(brace?.geometry.labelW, 90);
  assert.equal(brace?.geometry.labelH, 70);
});

test("compiles Create as draw-progress animations for drawable groups", () => {
  const documentData = compileTextDsl(`line base x1=0 y1=0 x2=100 y2=0 stroke="#fff"
arrow vec x1=0 y1=0 x2=100 y2=80 stroke="#22d3ee" tipLength=20 tipWidth=16

at 0s:
  play AnimationGroup(Create(base), Create(vec), lagRatio=0.1) duration=2s`);

  const createBase = documentData.timeline.find(
    (op): op is CreateOperation => op.op === "create" && op.node.id === "base",
  );
  if (!createBase) throw new Error("Expected create operation for base.");
  assert.equal(createBase.node.geometry.drawProgress, 0);

  const createArrow = documentData.timeline.find(
    (op): op is CreateOperation => op.op === "create" && op.node.id === "vec",
  );
  if (!createArrow) throw new Error("Expected create operation for vec.");
  assert.equal(createArrow.node.children?.[0]?.geometry.drawProgress, 0);
  assert.equal(createArrow.node.children?.[1]?.geometry.drawProgress, 0);

  equalJson(
    documentData.timeline
      .filter((op): op is AnimateOperation => op.op === "animate")
      .map((op) => [op.id, op.path, op.from, op.to]),
    [
      ["base", "geometry.drawProgress", 0, 1],
      ["vec:shaft", "geometry.drawProgress", 0, 1],
      ["vec:tip", "geometry.drawProgress", 0, 1],
    ],
  );
});

test("places axes at the scene origin by default", () => {
  const documentData = compileTextDsl("axes ax width=760 height=360");

  const axes = documentData.nodes[0];
  assert.equal(axes?.type, "group");
  assert.equal(axes?.children[0]?.transform.x, 0);
  assert.equal(axes?.children[0]?.transform.y, 0);
  assert.equal(axes?.children[1]?.transform.x, 0);
  assert.equal(axes?.children[1]?.transform.y, 0);
  assert.equal(axes?.geometry.xMin, -5);
  assert.equal(axes?.geometry.xMax, 5);
  assert.equal(axes?.geometry.yMin, -3);
  assert.equal(axes?.geometry.yMax, 3);
  assert.equal(axes?.geometry.centerX, 0);
  assert.equal(axes?.geometry.centerY, 0);
});

test("compiles dataPolygon points through axes coordinates", () => {
  const documentData = compileTextDsl(`axes ax at 0,-30 width=760 height=340 xRange=-4,4 yRange=-2,2
dataPolygon poly axes=ax points=-2,-0.5;-0.4,1.1;1.8,0.4 fill="#22d3ee" opacity=0.2`);

  const polygon = documentData.nodes.find((node) => node.id === "poly");
  assert.equal(polygon?.type, "path");
  assert.equal(polygon?.transform.x, 0);
  assert.equal(polygon?.transform.y, -30);
  assert.equal(polygon?.geometry.dataPolygon, true);
  assert.equal(polygon?.geometry.axes, "ax");
  assert.equal(polygon?.style.fill, "#22d3ee");
  assert.equal(polygon?.transform.opacity, 0.2);
  assert.equal(
    polygon?.geometry.d,
    "M -190 42.5 L -38 -93.5 L 171 -34 Z",
  );
});

test("compiles dataLineGraph through Manim-style axes coordinates", () => {
  const documentData = compileTextDsl(`axes ax at 0,-20 width=540 height=360 xRange=0,40 yRange=-8,32 stroke="#fff" strokeWidth=3 xTicks=10 xNumbers=0,5 yNumbers=-5,0 numberSize=18
dataLineGraph graph axes=ax points=0,20;8,0;38,0;39,-5 lineColor="#FFFF00" strokeWidth=4 vertexRadius=5`);

  const axes = documentData.nodes.find((node) => node.id === "ax");
  assert.equal(axes?.children[0]?.geometry.y1, 108);
  assert.equal(axes?.children[1]?.geometry.x1, -270);
  assert.equal(axes?.children.some((child) => child.id === "ax:x_tick:10"), true);
  assert.equal(axes?.children.some((child) => child.id === "ax:x_number:10"), false);
  assert.equal(axes?.children.some((child) => child.id === "ax:x_tick:5"), true);
  assert.equal(axes?.children.find((child) => child.id === "ax:x_number:5")?.text, "5");
  assert.equal(axes?.children.find((child) => child.id === "ax:y_number:m5")?.text, "-5");
  assert.equal(axes?.children.find((child) => child.id === "ax:y_tick:m5")?.transform.y, 133);

  const graph = documentData.nodes.find((node) => node.id === "graph");
  assert.equal(graph?.type, "group");
  assert.equal(graph?.transform.x, 0);
  assert.equal(graph?.transform.y, -20);
  assert.equal(graph?.children[0]?.geometry.d, "M -270 -72 L -162 108 L 243 108 L 256.5 153");
  assert.equal(graph?.children[1]?.transform.x, -270);
  assert.equal(Math.round(Number(graph?.children[1]?.transform.y)), -72);
  assert.equal(graph?.children[1]?.style.fill, "#FFFF00");
});

test("compiles numberPlane helper as background grid lines", () => {
  const documentData = compileTextDsl(`numberPlane plane xRange=-2,2 yRange=-1,1 unit=60 stroke="#00bcd4" axisStroke="#dff9ff"`);

  const plane = documentData.nodes[0];
  assert.equal(plane?.type, "group");
  assert.equal(plane?.geometry.numberPlane, true);
  assert.equal(plane?.children.length, 8);
  const xAxis = plane?.children.find((child) => child.id === "plane:h:0");
  const yAxis = plane?.children.find((child) => child.id === "plane:v:0");
  assert.equal(xAxis?.style.stroke, "#dff9ff");
  assert.equal(yAxis?.style.stroke, "#dff9ff");
  assert.equal(plane?.children.find((child) => child.id === "plane:v:m2")?.geometry.x1, -120);
  assert.equal(plane?.children.find((child) => child.id === "plane:h:m1")?.geometry.y1, 60);
});

test("compiles dataRect and dataDot through dynamic axes coordinates", () => {
  const documentData = compileTextDsl(`value t = 5
axes ax at 0,0 width=480 height=360 xRange=0,10 yRange=0,10
dataRect area axes=ax from=0,0 to=t,25/t fill="#58C4DD" fillOpacity=0.5
dataDot dot axes=ax point=t,25/t r=8`);

  const area = documentData.nodes.find((node) => node.id === "area");
  assert.equal(area?.type, "rect");
  assert.equal(area?.geometry.dataRect, true);
  assert.equal(area?.geometry.w, 240);
  assert.equal(area?.geometry.h, 180);
  assert.equal(area?.transform.x, -120);
  assert.equal(area?.transform.y, 90);

  const dot = documentData.nodes.find((node) => node.id === "dot");
  assert.equal(dot?.type, "circle");
  assert.equal(dot?.geometry.dataDot, true);
  assert.equal(dot?.transform.x, 0);
  assert.equal(dot?.transform.y, 0);

  const areaBindings = documentData.timeline.filter((op) => op.op === "bindExpr" && op.id === "area");
  assert.equal(areaBindings.length, 4);
  assert.equal(areaBindings.every((op) => op.op === "bindExpr" && op.deps?.includes("t")), true);
});

test("compiles dynamicLine helper into endpoint bindings", () => {
  const documentData = compileTextDsl(`value x = 0
value y = 0
dynamicLine connector x1=60*x y1=0 x2=72 y2=-60*y stroke="#FC6255" strokeWidth=4`);

  const connector = documentData.nodes[0];
  assert.equal(connector?.type, "line");
  assert.equal(connector?.geometry.dynamicLine, true);
  assert.equal(connector?.geometry.x2, 72);
  assert.equal(connector?.style.stroke, "#FC6255");

  const bindings = documentData.timeline.filter((op) => op.op === "bindExpr" && op.id === "connector");
  assert.equal(bindings.length, 4);
  assert.equal(bindings.some((op) => op.op === "bindExpr" && op.path === "geometry.x1" && op.expr === "60*x"), true);
  assert.equal(bindings.some((op) => op.op === "bindExpr" && op.path === "geometry.y2" && op.expr === "-60*y"), true);
});

test("compiles graph area helpers through axes coordinates", () => {
  const documentData = compileTextDsl(`axes ax at 0,15 width=500 height=330 xRange=0,5 yRange=0,6
dataLine line_1 axes=ax from=2,0 to=2,4*2-2*2 stroke="#FFFF00" strokeWidth=4
dataArea area axes=ax lower=0.8*t*t-3*t+4 upper=4*t-t*t range=2,3 samples=6 fill="#888888" fillOpacity=0.5
dataRiemannRects riemann axes=ax fn=4*t-t*t range=0.3,0.6 dx=0.03 fill="#0000FF" fillOpacity=0.5`);

  const line = documentData.nodes.find((node) => node.id === "line_1");
  assert.equal(line?.type, "line");
  assert.equal(Math.round(Number(line?.geometry.x1)), -50);
  assert.equal(line?.geometry.y1, 180);
  assert.equal(Math.round(Number(line?.geometry.x2)), -50);
  assert.equal(Math.round(Number(line?.geometry.y2)), -40);

  const area = documentData.nodes.find((node) => node.id === "area");
  assert.equal(area?.type, "path");
  assert.equal(area?.geometry.dataArea, true);
  assert.equal(String(area?.geometry.d).startsWith("M -50 -40 L "), true);
  assert.equal(String(area?.geometry.d).endsWith(" Z"), true);

  const riemann = documentData.nodes.find((node) => node.id === "riemann");
  assert.equal(riemann?.type, "group");
  assert.equal(riemann?.geometry.dataRiemannRects, true);
  assert.equal(riemann?.children.length, 10);
  assert.equal(Math.round(Number(riemann?.children[0]?.geometry.w)), 3);
});

test("compiles gaussianSurface into checkerboard surface faces", () => {
  const documentData = compileTextDsl(
    `gaussianSurface surface at -38,124 range=-2,2 resolution=4 scale=2 sigma=0.4 fillA="#FF862F" fillB="#58C4DD" stroke="#83C167" fillOpacity=0.5`,
  );

  const surface = documentData.nodes[0];
  assert.equal(surface?.type, "group");
  assert.equal(surface?.geometry.gaussianSurface, true);
  assert.equal(surface?.geometry.resolution, 4);
  assert.equal(surface?.children.length, 16);
  assert.equal(surface?.children.every((child) => child.type === "path"), true);
  assert.equal(surface?.children.some((child) => child.style.fill === "#FF862F"), true);
  assert.equal(surface?.children.some((child) => child.style.fill === "#58C4DD"), true);
  assert.equal(surface?.children[0]?.style.fillOpacity, 0.5);
  assert.equal(String(surface?.children[0]?.geometry.d).endsWith(" Z"), true);
});

test("compiles gaussianSurface with optional height shading", () => {
  const documentData = compileTextDsl(
    `gaussianSurface surface range=-2,2 resolution=4 scale=2 sigma=0.4 fillA="#FF862F" fillB="#58C4DD" shade=true shadeStrength=0.18`,
  );

  const surface = documentData.nodes[0];
  assert.equal(surface?.geometry.shade, true);
  assert.equal(surface?.children.some((child) => child.style.fill !== "#FF862F" && child.style.fill !== "#58C4DD"), true);
});

test("compiles sphereSurface into shaded checkerboard surface faces", () => {
  const documentData = compileTextDsl(
    `sphereSurface sphere at 0,28 radius=104 resolution=3,4 fillA="#E65A4C" fillB="#CF5044" light=0,-0.35,1`,
  );

  const sphere = documentData.nodes[0];
  assert.equal(sphere?.type, "group");
  assert.equal(sphere?.geometry.sphereSurface, true);
  assert.equal(sphere?.geometry.uResolution, 3);
  assert.equal(sphere?.geometry.vResolution, 4);
  assert.equal(sphere?.children.length, 12);
  assert.equal(sphere?.children.every((child) => child.type === "path"), true);
  assert.equal(sphere?.children.every((child) => String(child.geometry.d).endsWith(" Z")), true);
  assert.equal(sphere?.children.some((child) => child.style.fill !== "#E65A4C" && child.style.fill !== "#CF5044"), true);
});

test("compiles threeDAxes into projected axes with ticks and tips", () => {
  const documentData = compileTextDsl(
    `threeDAxes axes at -40,42 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 includeTips=true`,
  );

  const axes = documentData.nodes[0];
  assert.equal(axes?.type, "group");
  assert.equal(axes?.geometry.threeDAxes, true);
  equalJson(axes?.geometry.xRange, [-6, 6, 1]);
  assert.equal(axes?.children.filter((child) => child.type === "line").length, 33);
  assert.equal(axes?.children.filter((child) => child.type === "path").length, 3);
  assert.equal(axes?.children.some((child) => child.id === "axes:x:tip"), true);
});

test("compiles threeDAxes without ticks when requested", () => {
  const documentData = compileTextDsl(`threeDAxes axes includeTicks=false includeTips=true`);

  const axes = documentData.nodes[0];
  assert.equal(axes?.children.filter((child) => child.type === "line").length, 3);
  assert.equal(axes?.children.filter((child) => child.type === "path").length, 3);
});

test("compiles projectedCircle into a projected XY-plane path", () => {
  const documentData = compileTextDsl(
    `projectedCircle circle_xy radius=0.67 at 0,28 xBasis=-56.75,25.5 yBasis=87.75,13.25 fill="none" stroke="#FFFFFF" strokeWidth=4`,
  );

  const circle = documentData.nodes[0];
  assert.equal(circle?.type, "path");
  assert.equal(circle?.geometry.projectedCircle, true);
  assert.equal(circle?.geometry.radius, 0.67);
  assert.equal(circle?.geometry.d, "M -38.0225 17.085 C -5.552299 21.987908 37.793253 18.313285 58.7925 8.8775 C 79.791747 -0.558285 70.492701 -12.182092 38.0225 -17.085 C 5.552299 -21.987908 -37.793253 -18.313285 -58.7925 -8.8775 C -79.791747 0.558285 -70.492701 12.182092 -38.0225 17.085 Z");
  assert.equal(circle?.transform.y, 28);
  assert.equal(circle?.style.fill, "none");
});

test("compiles arrow helper as grouped shaft and tip paths", () => {
  const documentData = compileTextDsl(
    `arrow vec x1=0 y1=0 x2=190 y2=80 at 0,-20 stroke="#22d3ee" strokeWidth=6 tipLength=20 tipWidth=18`,
  );

  const arrow = documentData.nodes[0];
  assert.equal(arrow?.type, "group");
  assert.equal(arrow?.geometry.arrow, true);
  assert.equal(arrow?.transform.y, -20);
  equalJson(
    arrow?.children.map((child) => [child.id, child.type]),
    [
      ["vec:shaft", "line"],
      ["vec:tip", "path"],
    ],
  );
  assert.equal(arrow?.children[0]?.style.stroke, "#22d3ee");
  assert.equal(arrow?.children[0]?.style.strokeWidth, 6);
  assert.equal(String(arrow?.children[1]?.geometry.d).startsWith("M 190 80 L "), true);
});

test("compiles arrow helper with Manim-like buff and length-ratio clamps", () => {
  const documentData = compileTextDsl(
    `arrow vec x1=0 y1=0 x2=100 y2=0 buff=10 strokeWidth=100 maxStrokeWidthToLengthRatio=0.1 tipLength=50 tipWidth=20 maxTipLengthToLengthRatio=0.25`,
  );

  const arrow = documentData.nodes[0];
  assert.equal(arrow?.geometry.buff, 10);
  assert.equal(arrow?.geometry.tipLength, 20);
  assert.equal(arrow?.children[0]?.geometry.x1, 10);
  assert.equal(arrow?.children[0]?.geometry.x2, 70);
  assert.equal(arrow?.children[0]?.style.strokeWidth, 8);
  assert.equal(arrow?.children[1]?.geometry.d, "M 90 0 L 70 10 L 70 -10 Z");
});

test("compiles image helper with grayscale array data", () => {
  const documentData = compileTextDsl(
    `image img w=160 h=80 data="0,128,255;255,128,0"`,
  );

  const image = documentData.nodes[0];
  assert.equal(image?.type, "image");
  assert.equal(image?.geometry.w, 160);
  assert.equal(image?.geometry.h, 80);
  assert.equal(image?.geometry.data, "0,128,255;255,128,0");
});

test("compiles plot with close and style overrides", () => {
  const documentData = compileTextDsl(
    `plot area fn=sin(t) range=-3.14,3.14 samples=64 scaleX=60 scaleY=50 close=true fill="#38bdf8" opacity=0.3 stroke="#0ea5e9" strokeWidth=2`,
  );

  const area = documentData.nodes[0];
  assert.equal(area?.type, "path");
  assert.equal(area?.style.fill, "#38bdf8");
  assert.equal(area?.transform.opacity, 0.3);
  assert.equal(area?.style.stroke, "#0ea5e9");
  assert.equal(area?.style.strokeWidth, 2);
  assert.equal(String(area?.geometry.d).endsWith(" Z"), true);
});

test("compiles nonuniform transform scale properties", () => {
  const documentData = compileTextDsl(`rect display w=360 h=60 at 220,-120 scaleX=0.5 scaleY=1.5
animate display.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
animate display.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut`);

  const display = documentData.nodes[0];
  assert.equal(display?.transform.scaleX, 0.5);
  assert.equal(display?.transform.scaleY, 1.5);

  const animations = documentData.timeline.filter((op) => op.op === "animate");
  assert.equal(animations[0]?.op, "animate");
  assert.equal(animations[0]?.path, "transform.scaleX");
  assert.equal(animations[1]?.op, "animate");
  assert.equal(animations[1]?.path, "transform.scaleY");
});

test("compiles angle helper into an updating path", () => {
  const documentData = compileTextDsl(`value theta = 0
angle arc at 0,-20 radius=60 from=0 to=theta samples=72 stroke="#f59e0b" strokeWidth=5`);

  const arc = documentData.nodes[0];
  assert.equal(arc?.type, "path");
  assert.equal(arc?.geometry.angle, true);
  assert.equal(arc?.geometry.radius, 60);
  assert.equal(arc?.transform.y, -20);
  assert.equal(arc?.style.stroke, "#f59e0b");

  const bind = documentData.timeline.find((op) => op.op === "bindPath");
  assert.equal(bind?.op, "bindPath");
  if (bind?.op !== "bindPath") throw new Error("Expected angle bindPath operation.");
  assert.equal(bind.id, "arc");
  assert.equal(bind.path, "geometry.d");
  assert.equal(bind.tMaxExpr, "theta");
  equalJson(bind.deps, ["theta"]);
});

test("compiles rotatingLine helper around an explicit about point", () => {
  const documentData = compileTextDsl(`value theta = 1.570796327
rotatingLine line_moving x1=-120 y1=0 x2=120 y2=0 about=-120,0 angle=-theta stroke="#ffffff" strokeWidth=4`);

  const line = documentData.nodes.find((node) => node.id === "line_moving");
  assert.equal(line?.type, "line");
  assert.equal(line?.geometry.x1, -120);
  assert.equal(Math.round(Number(line?.geometry.x2)), -120);
  assert.equal(Math.round(Number(line?.geometry.y2)), -240);
  assert.equal(line?.geometry.rotationAboutX, -120);
  assert.equal(line?.geometry.rotationAngle, "-theta");

  const bindings = documentData.timeline.filter((op) => op.op === "bindExpr" && op.id === "line_moving");
  assert.equal(bindings.length, 4);
  assert.equal(bindings.some((op) => op.op === "bindExpr" && op.path === "geometry.x2" && op.deps?.includes("theta")), true);
});

test("compiles rotateUpdater helper as cumulative dt rotation", () => {
  const documentData = compileTextDsl(`line arm x1=0 y1=0 x2=-180 y2=0
rotateUpdater arm rate=1 duration=2s
rotateUpdater arm rate=-1 duration=2s`);

  const rotations = documentData.timeline.filter(
    (op): op is AnimateOperation => op.op === "animate" && op.id === "arm" && op.path === "transform.rotation",
  );
  assert.equal(rotations.length, 2);
  assert.equal(rotations[0]?.op, "animate");
  assert.equal(Math.round(Number(rotations[0]?.to) * 1000) / 1000, 114.592);
  assert.equal(rotations[1]?.op, "animate");
  assert.equal(rotations[1]?.t, 2);
  assert.equal(Math.round(Number(rotations[1]?.to) * 1000) / 1000, 0);
});

test("compiles tracedPath helper into an updating path", () => {
  const documentData = compileTextDsl(`value theta = 0
tracedPath trace x=150*cos(t) y=150*sin(t) from=0 to=theta samples=120 at 0,-20 stroke="#22d3ee"`);

  const trace = documentData.nodes[0];
  assert.equal(trace?.type, "path");
  assert.equal(trace?.geometry.tracedPath, true);
  assert.equal(trace?.transform.y, -20);

  const bind = documentData.timeline.find((op) => op.op === "bindPath");
  assert.equal(bind?.op, "bindPath");
  if (bind?.op !== "bindPath") throw new Error("Expected tracedPath bindPath operation.");
  assert.equal(bind.id, "trace");
  assert.equal(bind.xExpr, "150*cos(t)");
  assert.equal(bind.yExpr, "150*sin(t)");
  assert.equal(bind.samples, 120);
});

test("compiles surroundingRect nodes from target bounds", () => {
  const documentData = compileTextDsl(`math term "f(x)\\frac{d}{dx}g(x)" at 120,80 size=30 w=260 h=72
surroundingRect frame target=term buff=10 stroke="#fbbf24" strokeWidth=4`);

  const frame = documentData.nodes.find((node) => node.id === "frame");
  assert.equal(frame?.type, "rect");
  assert.equal(frame?.transform.x, 120);
  assert.equal(frame?.transform.y, 80);
  assert.equal(frame?.geometry.w, 280);
  assert.equal(frame?.geometry.h, 92);
  assert.equal(frame?.geometry.shapeMatcher, "surroundingRect");
  assert.equal(frame?.style.fill, "none");
  assert.equal(frame?.style.stroke, "#fbbf24");
  assert.equal(frame?.style.strokeWidth, 4);
});

test("expands Create on surroundingRect into border draw progress", () => {
  const documentData = compileTextDsl(`math term "f(x)" at 120,80 size=30 w=100 h=72
surroundingRect frame target=term buff=10 stroke="#fbbf24" strokeWidth=4
play Create(frame) duration=0.75s easing=linear`);

  const create = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "frame",
  );
  assert.equal(create?.op, "create");
  if (create?.op !== "create") throw new Error("Expected frame create op.");
  assert.equal(create.node.geometry.drawProgress, 0);

  equalJson(
    documentData.timeline
      .filter((op): op is AnimateOperation => op.op === "animate")
      .map((op) => [op.id, op.path, op.from, op.to, op.duration, op.easing]),
    [["frame", "geometry.drawProgress", 0, 1, 0.75, "linear"]],
  );
});

test("compiles math nodes with renderer and font size", () => {
  const documentData = compileTextDsl(
    `math equation "e^{i\\pi}+1=0" at 320,180 size=42 renderer=mathjax fill="#f8fafc"`,
  );

  const equation = documentData.nodes[0];
  assert.equal(equation?.type, "math");
  assert.equal(equation?.latex, "e^{i\\pi}+1=0");
  assert.equal(equation?.renderer, "mathjax");
  assert.equal(equation?.geometry.fontSize, 42);
  assert.equal(equation?.transform.x, 320);
  assert.equal(equation?.transform.y, 180);
  assert.equal(equation?.style.fill, "#f8fafc");
});

test("compiles play, wait, hide, and set statements", () => {
  const documentData = compileTextDsl(`text title "Intro" at 100,80 opacity=1
circle a r=20 at 0,0 fill="#000"
rect b w=40 h=40 at 100,50 fill="#fff"

play FadeIn(title) duration=1s easing=linear
wait 0.5s
play Transform(a, b) duration=2s
set title.fill to "#38bdf8"
hide title
at 5s:
  play FadeOut(a) duration=0.5s`);

  equalJson(
    documentData.timeline.map((op) => [
      op.t,
      op.op,
      "id" in op ? op.id : op.op === "create" ? op.node.id : "",
    ]),
    [
      [0, "create", "a"],
      [0, "create", "title"],
      [0, "effect", "title"],
      [0, "animate", "title"],
      [1.5, "effect", "a"],
      [1.5, "animate", "a"],
      [1.5, "animate", "a"],
      [1.5, "animate", "a"],
      [1.5, "animate", "a"],
      [1.5, "animate", "a"],
      [1.5, "animate", "a"],
      [3.5, "set", "title"],
      [3.5, "delete", "title"],
      [5, "effect", "a"],
      [5, "animate", "a"],
      [5.5, "delete", "a"],
    ],
  );

  const fadeInCreate = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "title",
  );
  assert.equal(fadeInCreate?.op, "create");
  if (fadeInCreate?.op !== "create")
    throw new Error("Expected FadeIn create operation.");
  assert.equal(fadeInCreate.node.transform.opacity, 0);

  const transformAnimations = documentData.timeline.filter(
    (op): op is AnimateOperation => op.op === "animate" && op.id === "a",
  );
  assert.equal(
    transformAnimations.some(
      (op) => op.path === "transform.x" && op.to === 100,
    ),
    true,
  );
  assert.equal(
    transformAnimations.some((op) => op.path === "transform.y" && op.to === 50),
    true,
  );
  assert.equal(
    transformAnimations.some((op) => op.path === "geometry.w" && op.to === 40),
    true,
  );

  const setOperation = documentData.timeline.find((op) => op.op === "set");
  assert.equal(setOperation?.op, "set");
  if (setOperation?.op !== "set") throw new Error("Expected set operation.");
  assert.equal(setOperation.path, "style.fill");
  assert.equal(setOperation.value, "#38bdf8");
});

test("advances play statements inside at blocks from the block time", () => {
  const documentData = compileTextDsl(`circle dot r=24 at 100,100 fill="#38bdf8" opacity=1
text caption "Ready" at 100,160 fill="#e2e8f0" opacity=1

at 2s:
  play FadeIn(dot) duration=0.4s easing=easeOut
  animate dot.rotation from 0 to 180 duration=1s easing=linear
  play FadeIn(caption) duration=0.8s easing=easeOut`);

  equalJson(
    documentData.timeline
      .flatMap((op) =>
        (op.op === "effect" || op.op === "animate") &&
        (op.id === "dot" || op.id === "caption")
          ? [[op.t, op.op, op.id]]
          : [],
      ),
    [
      [2, "effect", "dot"],
      [2, "animate", "dot"],
      [2.4, "animate", "dot"],
      [2.4, "effect", "caption"],
      [2.4, "animate", "caption"],
    ],
  );
});

test("expands math tokens and TransformMatchingTex matches by token text", () => {
  const documentData = compileTextDsl(`math a "a+b" expandTokens=true at 100,100
math b "bca" expandTokens=true at 200,100

play TransformMatchingTex(a, b) duration=1s easing=easeInOut`);

  const source = documentData.nodes.find((node) => node.id === "a");
  equalJson(source?.children.map((child) => child.latex), ["a", "+", "b"]);

  equalJson(
    documentData.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.effect, op.t, op.duration, op.easing]),
    [
      ["a:tex:0", "transform", 0, 1, "easeInOut"],
      ["a:tex:1", "fadeOut", 0, 1, "easeInOut"],
      ["a:tex:2", "transform", 0, 1, "easeInOut"],
      ["b:tex:1", "fadeIn", 0, 1, "easeInOut"],
    ],
  );

  assert.equal(
    documentData.timeline.some(
      (op) =>
        op.op === "animate" &&
        op.id === "a:tex:0" &&
        op.path === "transform.x",
    ),
    true,
  );
  assert.equal(
    documentData.timeline.some(
      (op) =>
        op.op === "animate" &&
        op.id === "a:tex:1" &&
        op.path === "transform.opacity" &&
        op.to === 0,
    ),
    true,
  );
  const unmatchedCreate = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "b:tex:1",
  );
  assert.equal(unmatchedCreate?.op, "create");
  if (unmatchedCreate?.op !== "create")
    throw new Error("Expected unmatched TransformMatchingTex target create.");
  assert.equal(unmatchedCreate.node.transform.x > 100, true);
  assert.equal(unmatchedCreate.node.transform.y, 100);
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "delete")
      .map((op) => [op.id, op.t]),
    [
      ["a:tex:0", 1],
      ["a:tex:1", 1],
      ["a:tex:2", 1],
    ],
  );
});

test("moves matched math tokens to the target math node position", () => {
  const documentData = compileTextDsl(`math source "x" expandTokens=true at 100,120
math target "x" expandTokens=true at 260,180

play TransformMatchingTex(source, target) duration=1s easing=linear`);

  equalJson(
    documentData.timeline
      .flatMap((op) =>
        op.op === "animate" && op.id === "source:tex:0"
          ? [[op.path, op.from, op.to]]
          : [],
      )
      .filter(([path]) => path === "transform.x" || path === "transform.y"),
    [
      ["transform.x", 0, 160],
      ["transform.y", 0, 60],
    ],
  );
});

test("matches duplicate TransformMatchingTex tokens left-to-right by first unmatched target", () => {
  const documentData = compileTextDsl(`math src "a+a+a" expandTokens=true
math dst "a+a+a" expandTokens=true at 120,0
play TransformMatchingTex(src, dst) duration=1s easing=linear`);

  const xAnimations = documentData.timeline
    .filter((op): op is AnimateOperation => op.op === "animate" && op.path === "transform.x" && op.id.startsWith("src:tex:"))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((op) => Number(op.to));
  assert.equal(xAnimations.length, 5);
  assert.equal(
    xAnimations.every(
      (value, index, values) => index === 0 || value > (values[index - 1] as number),
    ),
    true,
  );
});

test("copies math token styles after all node options are applied", () => {
  const documentData = compileTextDsl(
    `math equation "x+y" expandTokens=true size=42 fill="#bae6fd" renderer=katex`,
  );

  const equation = documentData.nodes.find((node) => node.id === "equation");
  equalJson(
    equation?.children.map((child) => [
      child.latex,
      child.geometry.fontSize,
      child.style.fill,
      child.renderer,
    ]),
    [
      ["x", 42, "#bae6fd", "katex"],
      ["+", 42, "#bae6fd", "katex"],
      ["y", 42, "#bae6fd", "katex"],
    ],
  );
});


test("does not set explicit baselineOffset for expanded math tokens", () => {
  const documentData = compileTextDsl(`math equation "x+y" expandTokens=true size=42 renderer=katex`);
  const equation = documentData.nodes.find((node) => node.id === "equation");
  equalJson(
    equation?.children.map((child) => Object.hasOwn(child.geometry, "baselineOffset")),
    [false, false, false],
  );
});

test("keeps superscript and subscript groups renderable when expanding math tokens", () => {
  const documentData = compileTextDsl(
    `math equation "e^{i\\pi}+x_1^2" expandTokens=true size=42 renderer=katex`,
  );

  const equation = documentData.nodes.find((node) => node.id === "equation");
  equalJson(
    equation?.children.map((child) => child.latex),
    ["e^{i\\pi}", "+", "x_1^2"],
  );
});

test("gives scripted math tokens enough layout width for TransformMatchingTex", () => {
  const documentData = compileTextDsl(
    `math equation "x^2+y^2=(r)^2" expandTokens=true size=58 renderer=katex
math target "x^2+y^2=(R)^2" expandTokens=true size=58 renderer=katex`,
  );

  const equation = documentData.nodes.find((node) => node.id === "equation");
  const target = documentData.nodes.find((node) => node.id === "target");
  equalJson(
    equation?.children.map((child) => child.latex),
    ["x^2", "+", "y^2", "=", "(r)^2"],
  );
  equalJson(
    target?.children.map((child) => child.latex),
    ["x^2", "+", "y^2", "=", "(R)^2"],
  );
  const widths = new Map(
    [...(equation?.children ?? []), ...(target?.children ?? [])].map((child) => [
      child.latex,
      Number(child.geometry.w),
    ]),
  );

  assert.equal((widths.get("x^2") ?? 0) > 58, true);
  assert.equal((widths.get("+") ?? 0) > 48, true);
  assert.equal((widths.get("=") ?? 0) > 48, true);
  assert.equal((widths.get("(r)^2") ?? 0) > 135, true);
  assert.equal((widths.get("(R)^2") ?? 0) > 135, true);
});

test("does not auto-create a root group when a descendant is shown by TransformMatchingTex", () => {
  const documentData = compileTextDsl(`math equation "r" expandTokens=true
math equation2 "R" expandTokens=true
group hero equation
group heroNext equation2
play Write(hero) duration=0.5s
play TransformMatchingTex(equation, equation2) duration=0.5s`);

  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "create" && op.node.id === "heroNext",
    ),
    false,
  );
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "create")
      .filter((op) => op.t === 0)
      .map((op) => op.node.id),
    ["hero"],
  );
});

test("materializes hidden TransformMatchingTex targets for chained transforms", () => {
  const documentData = compileTextDsl(`math eq1 "x+y" expandTokens=true
math eq2 "a+y" expandTokens=true opacity=0
math eq3 "a-y" expandTokens=true opacity=0
play TransformMatchingTex(eq1, eq2) duration=1s
play TransformMatchingTex(eq2, eq3) duration=1s`);

  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "delete" && op.id === "eq2" && op.t < 0,
    ),
    true,
  );
  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "create" && op.node.id === "eq2:tex:1" && op.t === 1,
    ),
    true,
  );
  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "delete" && op.id === "eq1:tex:1" && op.t === 1,
    ),
    true,
  );
  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "delete" && op.id === "eq3" && op.t > 0.9 && op.t < 1,
    ),
    true,
  );
});

test("matches TransformMatchingTex tokens from nested source groups", () => {
  const documentData = compileTextDsl(`math varA "a" at -80,80
math varB "b" at 0,80
group variables varA varB
math eq1 "x+b" expandTokens=true
math eq2 "a+b" expandTokens=true opacity=0
group source eq1 variables
show eq1
show variables
play TransformMatchingTex(source, eq2) duration=1s`);

  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "effect" && op.id === "varA" && op.effect === "transform",
    ),
    true,
  );
  assert.equal(
    documentData.timeline.some(
      (op) =>
        op.op === "animate" &&
        op.id === "varA" &&
        op.path === "transform.y" &&
        typeof op.to === "number" &&
        op.to < 80,
    ),
    true,
  );
  assert.equal(
    documentData.timeline.some(
      (op) => op.op === "delete" && op.id === "varA" && op.t === 1,
    ),
    true,
  );
});

test("expands Write on groups into width-paced child write-progress reveals", () => {
  const documentData = compileTextDsl(`math a "a" at 0,0 opacity=0.8
math b "b" at 40,0
group text a b
play Write(text) duration=1s easing=linear`);

  const create = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "text",
  );
  assert.equal(create?.op, "create");
  if (create?.op !== "create") throw new Error("Expected Write create op.");
  equalJson(
    create.node.children.map((child) => [child.id, child.geometry.writeProgress]),
    [
      ["a", 0],
      ["b", 0],
    ],
  );

  equalJson(
    documentData.timeline
      .filter((op): op is AnimateOperation => op.op === "animate")
      .map((op) => [op.id, op.path, op.from, op.to, op.t, op.duration]),
    [
      ["a", "geometry.writeProgress", 0, 1, 0, 0.58],
      ["b", "geometry.writeProgress", 0, 1, 0.46, 0.54],
    ],
  );
});

test("expands ReplacementTransform into source morph plus target replacement", () => {
  const documentData = compileTextDsl(`rect from w=40 h=40 at 0,0 opacity=0.75
rect to w=80 h=90 at 100,0 opacity=0.5

play ReplacementTransform(from, to) duration=1.25s easing=linear`);

  equalJson(
    documentData.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.effect, op.t, op.duration, op.easing]),
    [["from", "replacementTransform", 0, 1.25, "linear"]],
  );

  const toCreate = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "to",
  );
  assert.equal(toCreate?.op, "create");
  if (toCreate?.op !== "create")
    throw new Error("Expected ReplacementTransform target create.");
  assert.equal(toCreate.t, 1.25);
  assert.equal(toCreate.node.transform.opacity, 0.5);

  equalJson(
    documentData.timeline
      .filter((op): op is AnimateOperation => op.op === "animate")
      .map((op) => [op.id, op.path, op.from, op.to, op.t, op.duration]),
    [
      ["from", "transform.x", 0, 100, 0, 1.25],
      ["from", "transform.opacity", 0.75, 0.5, 0, 1.25],
      ["from", "geometry.w", 40, 80, 0, 1.25],
      ["from", "geometry.h", 40, 90, 0, 1.25],
    ],
  );
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "delete")
      .map((op) => [op.id, op.t]),
    [["from", 1.25]],
  );
});

test("fades hidden nodes in to visible opacity", () => {
  const documentData = compileTextDsl(`text title "Intro" at 100,80 opacity=0

play FadeIn(title) duration=1s easing=linear`);

  const fadeInOpacity = documentData.timeline.find(
    (op): op is AnimateOperation =>
      op.op === "animate" &&
      op.id === "title" &&
      op.path === "transform.opacity",
  );
  assert.equal(fadeInOpacity?.from, 0);
  assert.equal(fadeInOpacity?.to, 1);
});

test("writes hidden text nodes at visible opacity", () => {
  const documentData = compileTextDsl(`math title "x^2" opacity=0

play Write(title) duration=1s`);

  const create = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "title",
  );
  assert.equal(create?.op, "create");
  if (create?.op !== "create") throw new Error("Expected Write create op.");
  assert.equal(create.node.transform.opacity, 1);
  assert.equal(create.node.geometry.writeProgress, 0);
});

test("creates hidden group children as visible targets", () => {
  const documentData = compileTextDsl(`path h d="M 0 0 L 20 0" opacity=0
path v d="M 0 0 L 0 20" opacity=0
group grid h v

play Create(grid) duration=1s`);

  const create = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "grid",
  );
  assert.equal(create?.op, "create");
  if (create?.op !== "create") throw new Error("Expected group create op.");
  equalJson(
    create.node.children.map((child) => [child.id, child.transform.opacity]),
    [
      ["h", 1],
      ["v", 1],
    ],
  );
});

test("transforms toward visible hidden targets", () => {
  const documentData = compileTextDsl(`text source "A" opacity=1
text target "B" at 40,0 opacity=0

play Transform(source, target) duration=1s`);

  const opacityAnimation = documentData.timeline.find(
    (op): op is AnimateOperation =>
      op.op === "animate" &&
      op.id === "source" &&
      op.path === "transform.opacity",
  );
  assert.equal(opacityAnimation, undefined);
  const textSet = documentData.timeline.find(
    (op): op is SetOperation =>
      op.op === "set" && op.id === "source" && op.path === "text",
  );
  assert.equal(textSet?.op, "set");
  assert.equal(textSet?.t, 1);
  assert.equal(textSet?.value, "B");
});

test("transforms math content to the target latex at the end", () => {
  const documentData = compileTextDsl(`math source "\\text{Before}" renderer=katex
math target "\\text{After}" renderer=mathjax opacity=0

play Transform(source, target) duration=1.5s`);

  equalJson(
    documentData.timeline
      .filter(
        (op): op is SetOperation => op.op === "set" && op.id === "source",
      )
      .map((op) => [op.t, op.path, op.value]),
    [
      [1.5, "latex", "\\text{After}"],
      [1.5, "renderer", "mathjax"],
    ],
  );
});

test("compiles Circumscribe with top-level color option", () => {
  const documentData = compileTextDsl(`circle dot r=20 at 0,0
play Circumscribe(dot) duration=0.7s color="#fbbf24"`);

  equalJson(
    documentData.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.effect, op.t, op.duration, op.easing]),
    [["dot", "circumscribe:#fbbf24", 0, 0.7, "smooth"]],
  );
});

test("expands AnimationGroup with nested calls and lagRatio", () => {
  const documentData = compileTextDsl(`circle a
circle b

play AnimationGroup(FadeIn(a), FadeIn(b), lagRatio=0.2) duration=1s easing=easeOut`);

  const childDuration = 1 / 1.2;
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.effect, op.t, op.duration, op.easing]),
    [
      ["a", "fadeIn", 0, childDuration, "easeOut"],
      ["b", "fadeIn", childDuration * 0.2, childDuration, "easeOut"],
    ],
  );
  assert.equal(documentData.duration, 1);
});

test("expands nested lagged groups and keeps total duration normalized", () => {
  const documentData = compileTextDsl(`circle a
circle b
circle c
play AnimationGroup(LaggedStart(FadeIn(a), FadeIn(b), lagRatio=0.5), FadeIn(c), lagRatio=0.25) duration=2s easing=linear`);

  assert.equal(documentData.duration, 2);
  const effectTimes = documentData.timeline
    .filter((op) => op.op === "effect")
    .map((op) => [op.id, op.t, op.duration]);
  assert.equal(effectTimes.length >= 3, true);
});

test("handles lagRatio boundary values", () => {
  const zeroLag = compileTextDsl(`circle a
circle b
play LaggedStart(FadeIn(a), FadeIn(b), lagRatio=0) duration=2s easing=linear`);
  equalJson(
    zeroLag.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.t, op.duration]),
    [
      ["a", 0, 2],
      ["b", 0, 2],
    ],
  );

  const unitLag = compileTextDsl(`circle a
circle b
play LaggedStart(FadeIn(a), FadeIn(b), lagRatio=1) duration=2s easing=linear`);
  equalJson(
    unitLag.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.t, op.duration]),
    [
      ["a", 0, 1],
      ["b", 1, 1],
    ],
  );
});

test("expands Succession into sequential nested animations", () => {
  const documentData = compileTextDsl(`circle a at 0,0
rect b at 100,50

play Succession(Create(a), Transform(a, b)) duration=2s`);

  equalJson(
    documentData.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.effect, op.t, op.duration]),
    [
      ["a", "create", 0, 1],
      ["a", "transform", 1, 1],
    ],
  );

  const transformAnimations = documentData.timeline.filter(
    (op): op is AnimateOperation => op.op === "animate" && op.id === "a",
  );
  assert.equal(
    transformAnimations.some(
      (op) => op.path === "transform.x" && op.t === 1 && op.to === 100,
    ),
    true,
  );
  assert.equal(
    transformAnimations.some(
      (op) => op.path === "transform.y" && op.t === 1 && op.to === 50,
    ),
    true,
  );
  assert.equal(documentData.duration, 2);
});

test("compiles group roots with math and path children", () => {
  const documentData = compileTextDsl(`path curve d="M 0 0 L 10 10"
math eq "x^2" renderer=katex size=24
group diagram curve eq at 320,180
play Create(diagram) duration=0.25s`);

  equalJson(
    documentData.nodes.map((node) => node.id),
    ["diagram"],
  );
  const group = documentData.nodes[0];
  assert.equal(group?.type, "group");
  equalJson(
    group?.children.map((child) => [child.id, child.type]),
    [
      ["curve", "path"],
      ["eq", "math"],
    ],
  );
  assert.equal(group?.transform.x, 320);
  assert.equal(group?.transform.y, 180);
  equalJson(
    documentData.timeline.map((op) =>
      op.op === "create"
        ? [op.op, op.node.id]
        : op.op === "effect"
          ? [op.op, op.id]
          : op.op === "animate"
            ? [op.op, op.id, op.path]
            : [],
    ),
    [
      ["create", "diagram"],
      ["effect", "diagram"],
      ["animate", "curve", "geometry.drawProgress"],
      ["animate", "eq", "transform.opacity"],
    ],
  );
});

test("auto-creates unshown nodes in source order", () => {
  const documentData = compileTextDsl(`circle first
circle second
circle third`);

  equalJson(
    documentData.timeline.map((op) => (op.op === "create" ? op.node.id : "")),
    ["first", "second", "third"],
  );
});

test("keeps comments outside quoted strings and unescapes quoted text", () => {
  const documentData = compileTextDsl(
    `text label "A \\"quoted\\" # value" at 10,20 fill="#fff" # trailing comment`,
  );

  const label = documentData.nodes[0];
  assert.equal(label?.text, 'A "quoted" # value');
  assert.equal(label?.style.fill, "#fff");
});

test("reports representative compile errors with line and column details", () => {
  messageMatches(
    "circle c1\ncircle c1",
    /Line 2, column 1: Duplicate node id 'c1'\./,
  );
  messageMatches("show missing", /Line 1, column 1: Unknown node 'missing'\./);
  messageMatches(
    "circle c1 unknown=1",
    /Line 1, column 1: Unknown node option 'unknown'\./,
  );
  messageMatches(
    "circle c1 r=nope",
    /Line 1, column 1: Expected number, got 'nope'\./,
  );
  messageMatches(
    'text title "Fluxion',
    /Line 1, column 19: Unclosed quoted string\./,
  );
  messageMatches("wat c1", /Line 1, column 1: Unknown statement 'wat'\./);
  messageMatches(
    "circle c1\nanimate c1.x from 0 to 1 duration=1s easing=bouncy",
    /Line 2, column 1: Unknown easing 'bouncy'\./,
  );
  messageMatches("at 1s", /Line 1, column 1: Expected ':' after at block\./);
  messageMatches(
    "circle c1\nanimate c1.x from 0 duration=1s",
    /Line 2, column 1: Expected animate syntax/,
  );
});

test("compiles scalar value trackers and dependent expressions", () => {
  const documentData = compileTextDsl(`circle dot r=8 at 320,240
value theta = 0
animate theta from 0 to 6.28 duration=2s easing=linear
set dot.x to expr="320 + 100 * cos(theta)"
set dot.y to expr="240 + 100 * sin(theta)"
set dot.rotation to expr="clipPi(theta)+clip01(theta-1)"`);

  equalJson(documentData.values, [{ id: "theta", initial: 0 }]);
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "animateValue")
      .map((op) => [op.id, op.from, op.to, op.duration, op.easing]),
    [["theta", 0, 6.28, 2, "linear"]],
  );
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "setExpr")
      .map((op) => [op.id, op.path, op.expr]),
    [
      ["dot", "transform.x", "320 + 100 * cos(theta)"],
      ["dot", "transform.y", "240 + 100 * sin(theta)"],
      ["dot", "transform.rotation", "clipPi(theta)+clip01(theta-1)"],
    ],
  );
});

test("rejects dependent expressions with unknown identifiers", () => {
  messageMatches(
    `circle dot
set dot.x to expr="missing + 1"`,
    /Invalid expression: Unknown identifier 'missing'/u,
  );
});

test("supports LaggedStart as AnimationGroup alias", () => {
  const documentData = compileTextDsl(`circle a r=20 at 0,0 fill="#000"
circle b r=20 at 60,0 fill="#fff"
play LaggedStart(FadeIn(a), FadeIn(b), lagRatio=0.5) duration=2s easing=linear`);

  const animated = documentData.timeline.filter((op) => op.op === "animate" && op.path === "transform.opacity");
  assert.equal(animated.length >= 2, true);
  const starts = animated.map((op) => op.t).sort((x, y) => x - y);
  assert.equal(starts[0], 0);
  assert.equal(starts.includes(2 / 3), true);
});

test("compiles always updater bindings", () => {
  const documentData = compileTextDsl(`value t = 0
circle dot r=10 at 0,0
always dot.x = expr=100*cos(t)`);

  const bind = documentData.timeline.find((op) => op.op === "bindExpr");
  assert.equal(bind?.op, "bindExpr");
  if (bind?.op !== "bindExpr") throw new Error("Expected bindExpr operation");
  assert.equal(bind.path, "transform.x");
  assert.equal(bind.expr, "100*cos(t)");
});

test("arrange places group children with equal gaps", () => {
  const documentData = compileTextDsl(`circle a r=10
circle b r=10
group g a b
arrange g direction=horizontal gap=20`);
  const sets = documentData.timeline.filter((op) => op.op === "set");
  equalJson(
    sets.map((op) => [op.id, op.path, op.value]),
    [
      ["a", "transform.x", -20],
      ["b", "transform.x", 20],
    ],
  );
});

test("nextTo places node next to target", () => {
  const documentData = compileTextDsl(`rect target w=100 h=40 at 50,0
circle c r=10
nextTo c target direction=right buff=10`);
  const set = documentData.timeline.find((op) => op.op === "set" && op.id === "c");
  assert.equal(set?.op, "set");
  if (set?.op === "set") assert.equal(set.value, 120);
});
