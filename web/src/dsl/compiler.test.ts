import test from "node:test";
import assert from "node:assert/strict";
import { compileTextDsl, DslCompileError } from "./compiler.js";

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
    documentData.timeline.filter((op) => op.op === "create").map((op) => op.node.id),
    ["box", "axis", "title", "c1"],
  );
  equalJson(
    documentData.timeline.filter((op) => op.op === "animate").map((op) => [op.id, op.path, op.t, op.duration, op.easing]),
    [
      ["c1", "transform.x", 0, 1.5, "easeInOut"],
      ["box", "transform.opacity", 1, 0.5, "smooth"],
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

test("reports representative compile errors with line and column details", () => {
  messageMatches("circle c1\ncircle c1", /Line 2, column 1: Duplicate node id 'c1'\./);
  messageMatches("show missing", /Line 1, column 1: Unknown node 'missing'\./);
  messageMatches("circle c1 unknown=1", /Line 1, column 1: Unknown node option 'unknown'\./);
  messageMatches("circle c1 r=nope", /Line 1, column 1: Expected number, got 'nope'\./);
  messageMatches('text title "Fluxion', /Line 1, column 19: Unclosed quoted string\./);
  messageMatches("wat c1", /Line 1, column 1: Unknown statement 'wat'\./);
  messageMatches("circle c1\nanimate c1.x from 0 to 1 duration=1s easing=bouncy", /Line 2, column 1: Unknown easing 'bouncy'\./);
});
