import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileTextDsl, DslCompileError } from "./compiler.js";
import type { AnimateOperation } from "../types.js";

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
  const html = readFileSync("index.html", "utf8");
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

  assert.equal(documentData.duration, 9);
  assertNoOverlappingAnimations(documentData);
});

test("compiles scene camera and camera animations", () => {
  const documentData = compileTextDsl(`camera at 10,20 scale=1.5 rotation=5
animate camera.x from 10 to 110 duration=2s easing=linear
animate camera.scale from 1.5 to 2 duration=2s`);

  equalJson(documentData.camera, { x: 10, y: 20, scale: 1.5, rotation: 5 });
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

test("compiles scene, nodes, styles, animation, and at blocks", () => {
  const documentData = compileTextDsl(`scene width=800 height=450 fps=30

circle c1 r=24 at 100,200 fill="#38bdf8" stroke="#0f172a" strokeWidth=3
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

test("keeps play statements inside at blocks anchored to the block time", () => {
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
      [2, "animate", "dot"],
      [2, "effect", "caption"],
      [2, "animate", "caption"],
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
    [["a:tex:1", 1]],
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
    `math equation "x^2+y^2=(r)^2" expandTokens=true size=58 renderer=katex`,
  );

  const equation = documentData.nodes.find((node) => node.id === "equation");
  const widths = new Map(
    equation?.children.map((child) => [child.latex, Number(child.geometry.w)]) ?? [],
  );

  assert.equal((widths.get("x^2") ?? 0) > 58, true);
  assert.equal((widths.get("+") ?? 0) > 48, true);
  assert.equal((widths.get("=") ?? 0) > 48, true);
  assert.equal((widths.get(")^2") ?? 0) > 50, true);
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

test("expands ReplacementTransform into simultaneous FadeOut and FadeIn", () => {
  const documentData = compileTextDsl(`circle from at 0,0 opacity=0.75
rect to at 100,0 opacity=0.5

play ReplacementTransform(from, to) duration=1.25s easing=linear`);

  equalJson(
    documentData.timeline
      .filter((op) => op.op === "effect")
      .map((op) => [op.id, op.effect, op.t, op.duration, op.easing]),
    [
      ["from", "fadeOut", 0, 1.25, "linear"],
      ["to", "fadeIn", 0, 1.25, "linear"],
    ],
  );

  const toCreate = documentData.timeline.find(
    (op) => op.op === "create" && op.node.id === "to",
  );
  assert.equal(toCreate?.op, "create");
  if (toCreate?.op !== "create")
    throw new Error("Expected ReplacementTransform target create.");
  assert.equal(toCreate.node.transform.opacity, 0);

  equalJson(
    documentData.timeline
      .filter((op): op is AnimateOperation => op.op === "animate")
      .map((op) => [op.id, op.path, op.from, op.to, op.t, op.duration]),
    [
      ["from", "transform.opacity", 0.75, 0, 0, 1.25],
      ["to", "transform.opacity", 0, 0.5, 0, 1.25],
    ],
  );
  equalJson(
    documentData.timeline
      .filter((op) => op.op === "delete")
      .map((op) => [op.id, op.t]),
    [["from", 1.25]],
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
      op.op === "create" ? op.node.id : op.op === "effect" ? op.id : "",
    ),
    ["diagram", "diagram"],
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
set dot.y to expr="240 + 100 * sin(theta)"`);

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
