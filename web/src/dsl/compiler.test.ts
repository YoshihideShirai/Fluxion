import test from "node:test";
import assert from "node:assert/strict";
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

test("compiles scene, nodes, styles, animation, and at blocks", () => {
  const documentData = compileTextDsl(`scene width=800 height=450 fps=30

circle c1 r=24 at 100,200 fill="#38bdf8" stroke="#0f172a" strokeWidth=3
rect box w=80 h=40 at 300,200 fill="#f97316" opacity=0.8
line axis x1=-50 y1=0 x2=50 y2=0 at 400,350 stroke="#e2e8f0" strokeWidth=2
text title "Fluxion v0.1" at 400,80 size=28 fill="#e2e8f0"

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
  assert.equal(title?.text, "Fluxion v0.1");
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

test("compiles v0.2 play, wait, hide, and set statements", () => {
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
