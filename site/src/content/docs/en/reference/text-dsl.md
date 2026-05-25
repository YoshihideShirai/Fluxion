---
title: Text DSL reference
description: Current syntax reference for Fluxion Text DSL.
---

Fluxion Text DSL is the current small declarative language that compiles browser-written animation descriptions into `.fluxion.json`. It is a separate frontend from the Python DSL, but both produce the same Fluxion IR.

The current Text DSL scope is intentionally small: place shapes, math, paths, and groups; define visibility timing; and play simple property animations and Manim-like animation primitives. It does not support arbitrary code execution, conditionals, loops, or external includes.


## Command quick reference

| Command | Purpose | Minimal example |
|---|---|---|
| `scene` | Canvas size and fps | `scene width=1280 height=720 fps=60` |
| `circle` | Circle node declaration | `circle dot r=34 at -380,-20 fill="#38bdf8"` |
| `rect` | Rectangle node declaration | `rect target w=120 h=88 at 180,-20 fill="#f97316"` |
| `triangle` | Triangle node declaration | `triangle t1 w=120 h=104 at 0,0 fill="#ef4444"` |
| `line` | Line node declaration | `line axis x1=-50 y1=0 x2=50 y2=0 at 0,-160 stroke="#e2e8f0"` |
| `path` | Path node declaration | `path curve d="M 0 0 C 40 80 80 80 120 0" at 0,-20 fill="none" stroke="#38bdf8"` |
| `text` | Text label node declaration | `text title "Fluxion" at 0,240 size=32 fill="#e2e8f0"` |
| `math` | Math equation node declaration | `math equation "e^{i\pi}+1=0" at 0,160 size=36 renderer=katex` |
| `group` | Grouped node declaration | `group intro title equation` |
| `surroundingRect` | Target-bounds rectangle declaration | `surroundingRect frame target=equation buff=10 stroke="#fbbf24"` |
| `axes` | Axes helper declaration | `axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2` |
| `plot` | Function plot path declaration | `plot curve fn=sin(t) range=-3.14,3.14 scaleX=80 scaleY=60` |
| `dataPolygon` | Axes data-coordinate polygon helper | `dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5` |
| `arrow` | Arrow helper declaration | `arrow vec x1=0 y1=0 x2=190 y2=80` |
| `angle` | Updating angle arc helper | `angle arc radius=60 from=0 to=theta samples=72` |
| `tracedPath` | Updating trace path helper | `tracedPath trace x=150*cos(t) y=150*sin(t) from=0 to=theta` |
| `arrange` | Group auto-layout sugar | `arrange dots direction=horizontal gap=20` |
| `nextTo` | Relative placement sugar | `nextTo label dot direction=right buff=12` |
| `cameraFrame` | Camera frame declaration | `cameraFrame at 0,0 scale=1` |
| `at` | Start an indented block at a fixed time | `at 0s:` |
| `show / hide` | Create or delete a node on the timeline | `show dot` |
| `value` | Declare a scalar tracker | `value theta = 0` |
| `set` | Apply an immediate property value or dependent expression | `set dot.x to expr="320 + 100 * cos(theta)"` |
| `animate` | Interpolate one property or scalar tracker | `animate theta from 0 to 6.28 duration=2s` |
| `animateFrame` | Interpolate the camera frame | `animateFrame to 120,40 scale=1.4 duration=1s` |
| `play` | Run Manim-like primitives | `play FadeIn(dot) duration=0.8s` |
| `wait` | Advance the current time cursor | `wait 0.4s` |

## Playground demo

Paste this demo directly into the GitHub Pages Playground. It combines node declarations, an `at` block, `show` / `hide`, `set`, `animate`, `play`, and `wait`.

```text
scene width=1280 height=720 fps=60

text title "DSL command demo" at 640,90 size=36 fill="#e2e8f0"
math eq "f(x)=x^2" at 640,155 size=34 fill="#bae6fd"
circle dot r=34 at 260,420 fill="#38bdf8" stroke="#0f172a" strokeWidth=4
rect target w=120 h=88 at 820,420 fill="#f97316" opacity=0.85
line axis x1=-320 y1=0 x2=320 y2=0 at 640,540 stroke="#94a3b8" strokeWidth=3
group intro title eq

at 0s:
  show axis
  hide target
  play Write(intro) duration=1s
  play FadeIn(dot) duration=0.8s

wait 0.4s
set dot.fill to "#22c55e"
animate dot.x from 260 to 820 duration=1.4s easing=easeInOut
play Transform(dot, target) duration=1.2s easing=easeOut
play FadeOut(intro) duration=0.8s
```

## Example

```text
scene width=1280 height=720 fps=60

text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
circle c1 r=48 at 220,360 fill="#38bdf8" stroke="#0f172a" strokeWidth=4
rect c2 w=96 h=96 at 640,360 fill="#f97316"

at 0s:
  show title
  show c1

play FadeIn(title) duration=1s
wait 0.5s
play Transform(c1, c2) duration=1.5s easing=easeInOut
play TransformMatchingTex(eq1, eq2) duration=1s
```

## Lexical rules

- Write one statement per line.
- Blank lines are ignored.
- `#` starts a comment until the end of the line, except inside quoted strings.
- Quoted strings use `"`; escape a quote with `\"`.
- Tokens are separated by whitespace; whitespace inside quoted strings is preserved.
- Times accept `1`, `1.5`, `1s`, and `1.5s`; the unit is seconds.
- Colors are treated as strings. The current compiler does not validate CSS color syntax.

## Coordinate system

- `at x,y` / `x` / `y` are **scene-centered coordinates**.
- `(0,0)` is the canvas center.
- Positive `x` goes right. Positive `y` goes **up** (Manim-style).
- Example on a `1280x720` scene: left edge is about `x=-640`, right edge is about `x=640`, top is about `y=360`, bottom is about `y=-360`.

## Statements

### scene

```text
scene width=1280 height=720 fps=60
```

All options are optional. Defaults are `width=1280`, `height=720`, and `fps=60`.

Supported options:

- `width`: number
- `height`: number
- `fps`: number

### node declarations

```text
circle c1 r=40 at 220,360 fill="#38bdf8"
rect box w=120 h=80 at 640,360 fill="#f97316"
triangle tri w=120 h=104 at 760,360 fill="#ef4444"
line axis x1=-50 y1=0 x2=50 y2=0 at 640,520 stroke="#e2e8f0" strokeWidth=2
path curve d="M 0 0 C 40 80 80 80 120 0" at 640,420 fill="none" stroke="#38bdf8"
text title "Fluxion" at 640,120 size=32 fill="#e2e8f0"
math equation "e^{i\\pi}+1=0" at 640,200 size=36 expandTokens=true
group intro title equation
surroundingRect frame target=equation buff=10 stroke="#fbbf24"
axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2
dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5 fill="#22d3ee"
arrow vec x1=0 y1=0 x2=190 y2=80 stroke="#22d3ee" fill="#22d3ee"
angle arc radius=60 from=0 to=theta samples=72 stroke="#f59e0b"
tracedPath trace x=150*cos(t) y=150*sin(t) from=0 to=theta samples=120
cameraFrame at 0,0 scale=1
```

Supported node types:

- `circle <id>`
- `rect <id>`
- `triangle <id>`
- `line <id>`
- `path <id> d="<svg-path-data>"`
- `text <id> "<text>"`
- `math <id> "<latex>"`
- `group <id> [child-id...]`
- `surroundingRect <id> target=<node-id>`
- `axes <id>`
- `plot <id> fn=<expr>`
- `dataPolygon <id> axes=<axes-id> points=<x,y;...>`
- `arrow <id> x1=<number> y1=<number> x2=<number> y2=<number>`
- `angle <id> radius=<number> from=<expr> to=<expr>`
- `tracedPath <id> x=<expr> y=<expr>`

`id` values must be unique in a document.

Common options:

- `at x,y`: shortcut for `transform.x` and `transform.y`
- `x`, `y`
- `scale`
- `rotation`
- `opacity`
- `fill`, `stroke`, `strokeWidth`
- `size` / `fontSize`
- `math` only: `renderer=katex|mathjax`, `expandTokens=true|false`
- `surroundingRect` only: `target=<node-id>`, `buff=<number>`; emits a frame-like `rect` node sized from the target node's declared/estimated bounds. `play Create(frame)` animates its border with `geometry.drawProgress` for a Manim-like outline draw.
- `axes` only: `xRange=<min,max>`, `yRange=<min,max>`, `width`, `height`; emits a `group` with x/y axis lines.
- `plot` only: `fn=<expr>`, `range=<min,max>`, `samples`, `scaleX`, `scaleY`, `close=true|false`; emits a generated `path` geometry from the sampled function.
- `dataPolygon` only: `axes=<axes-id>`, `points=<x,y;...>`; maps at least three data-coordinate points through the referenced `axes` helper and emits a closed `path`.
- `arrow` only: `x1`, `y1`, `x2`, `y2`, `tipLength`, `tipWidth`; emits a `group` with a line shaft and filled path tip.
- `angle` only: `radius` / `r`, `from`, `to`, `samples`, `close=true|false`; emits a generated `path` arc and a `bindPath` updater. Expressions can reference value trackers, so `to=theta` follows an animated tracker.
- `tracedPath` only: `x`, `y`, `from`, `to`, `samples`, `close=true|false`; emits a generated `path` and a `bindPath` updater. This is a declarative trace helper for parametric motion, not a full history-based Manim `TracedPath` clone yet.


### Path morphing constraints

- `path.d` animations with identical SVG command topology (same command sequence and numeric arity) use strict numeric interpolation of each command value.
- `path.d` animations with different topology use a resampling fallback: supported `M` / `L` / `C` / `Q` / `Z` path data is sampled into a fixed number of polyline points, then those points are interpolated. This allows common line/curve command-count differences to morph as path strings.
- If either side contains path commands outside the fallback sampler, the animation falls back to step interpolation: the source value is used before the end time, and the destination value is used at the end time.

### layout sugar

```text
arrange dots direction=horizontal gap=20
nextTo label dot direction=right buff=12
```

- `arrange <group-id> direction=horizontal|vertical gap=<number>` repositions direct children of a group around the group center.
- `nextTo <id> <target-id> direction=up|down|left|right buff=<number>` repositions one node relative to another node boundary.

### timeline blocks

```text
at 0s:
  show title
  show c1
  set c1.opacity to 1
  hide oldLabel
```

A block applies statements at a shared time. `show` creates a declared node at that time. `hide` deletes it. `set` applies an immediate property value.

### value trackers

```text
value theta = 0
animate theta from 0 to 6.28 duration=2s easing=linear
set dot.x to expr="320 + 100 * cos(theta)"
set dot.y to expr="240 + 100 * sin(theta)"
```

`value` declares a scalar tracker that lives separately from scene nodes. A tracker can be animated with `animate <name> from <number> to <number> ...`, and node properties can depend on tracker values through `set <id>.<property> to expr="..."`.

Dependent expressions are intentionally static and analyzable. Fluxion does **not** execute arbitrary JavaScript and does not aim for full Manim updater compatibility. Expressions may reference declared tracker names, numeric literals, parentheses, arithmetic operators (`+`, `-`, `*`, `/`, `%`, `**`), constants (`pi`, `e`), and allowlisted math functions such as `sin`, `cos`, `tan`, `sqrt`, `abs`, `min`, `max`, and `pow`.

### always

```text
always dot.x = expr=240 + 96*cos(theta)
always curve.d = path(x=240+96*cos(t),y=270+96*sin(t),from=0,to=2*pi,samples=128,close=true)
```

`always` registers a per-frame updater. `expr=...` updates one property each frame. `path(...)` samples a parametric curve and writes an SVG path string (typically `geometry.d`) every frame. In `path(...)`, `x`/`y` are required expressions over parameter `t`; `from`, `to`, `samples`, and `close` are optional (`from=0`, `to=2*pi`, `samples=96`, `close=false`).

### animate

```text
animate c1.x from 220 to 640 duration=1.5s easing=easeInOut
animate title.opacity from 0 to 1 start=0s duration=1s
animateFrame to 120,40 scale=1.4 duration=1s easing=easeInOut
```

`animate` interpolates a target property or a declared scalar value tracker. Numeric values interpolate; non-numeric node property values switch to `to` at completion.

`animateFrame` is camera-frame sugar. It expands to synchronized `camera.x`, `camera.y`, `camera.scale`, and `camera.rotation` animations from the compiler's current camera frame cursor. Use `cameraFrame at x,y scale=<number>` to set the initial frame cursor. `animateFrame` supports `to x,y`, `scale`, `rotation`, `start`, `duration`, and `easing`.

### play and wait

```text
play FadeIn(title) duration=1s
wait 0.5s
play AnimationGroup(FadeIn(a), FadeIn(b), lagRatio=0.2) duration=1s
play Succession(Create(a), Transform(a, b)) duration=2s
play Transform(c1, c2) duration=1.5s easing=easeInOut
play TransformMatchingTex(eq1, eq2) duration=1s
```

`play` provides Manim-like primitives and accepts nested calls for parallel or sequential composition. `wait` advances the current cursor time.

Syntax:

```text
play <Primitive>(<args...>) [duration=<time>] [easing=<name>]
play AnimationGroup(<Primitive>(...), <Primitive>(...), [lagRatio=<number>]) [duration=<time>] [easing=<name>]
play LaggedStart(<Primitive>(...), <Primitive>(...), [lagRatio=<number>]) [duration=<time>] [easing=<name>]
play Succession(<Primitive>(...), <Primitive>(...)) [duration=<time>] [easing=<name>]
```

Supported primitives include:

- `FadeIn(id)`: creates the node at hidden opacity, emits `effect=fadeIn`, and animates `transform.opacity`.
- `FadeOut(id)`: emits `effect=fadeOut`, animates `transform.opacity` to `0`, and deletes the node when the duration ends.
- `Create(id)`: creates the node and emits `effect=create`. For `surroundingRect` frames, it also animates `geometry.drawProgress` so the border is drawn on.
- `Write(id)`: creates writable leaves with `geometry.writeProgress=0`, emits `effect=write`, and reveals each leaf with width-paced left-to-right timing to approximate Manim's written-on appearance.
- `Transform(source, target)`: animates the source node toward transform/style/geometry properties from the target node.
- `TransformMatchingTex(source, target)`: matches expanded `math` token children by identical token text. Matched tokens expand to `Transform`, source-only tokens expand to `FadeOut`, and target-only tokens expand to `FadeIn`.
- `ReplacementTransform(from, to)`: expands into a simultaneous `FadeOut(from)` and `FadeIn(to)`.
- `Circumscribe(id)`: emits a semantic circumscribe effect for renderers that support highlight outlines. `color=<css-color>` is accepted on the play statement or inside the call.
- `AnimationGroup(<animations...>, lagRatio=0)`: expands child animations in parallel. `lagRatio` offsets child starts by a ratio of child duration, and the group is normalized to fit the outer `duration`.
- `LaggedStart(<animations...>, lagRatio=0.05)`: alias of `AnimationGroup` tuned for staggered starts (Manim-like naming).
- `Succession(<animations...>)`: expands child animations from left to right. Each child receives an equal share of the outer `duration`.

### TransformMatchingTex and token matching

`TransformMatchingTex(source, target)` only supports `math` nodes declared with `expandTokens=true` on both sides.

```text
math eq1 "a+b" expandTokens=true at 320,180
math eq2 "bca" expandTokens=true at 640,180
play TransformMatchingTex(eq1, eq2) duration=1s
```

Tokenization splits LaTeX into commands such as `\pi` or `\frac`, escaped single-character symbols, `^` / `_`, braces, and ordinary characters. Whitespace is ignored. Matching uses exact `latex` token-string equality. Source tokens are processed in source order and consume the first unused destination token with the same string, so duplicate tokens match in stable occurrence order.

Unsupported tokens are handled explicitly: source-only tokens fade out and are deleted at the end of the duration; target-only tokens are created at hidden opacity and fade in; matched tokens transform from the source token id toward the destination token state. The current token child positions are approximate semantic anchors, not precise glyph layout for complex TeX.

For long-term visual stability, prefer a renderer-driven baseline alignment pipeline that measures glyph metrics (ascent/descent/baseline) and feeds corrective offsets back into token children. A minimal-diff implementation plan:

1. Add a baseline field during token expansion in `web/src/dsl/compiler.ts` (about 3-6 lines).
   - In `latexToTokenNodes(...)`, initialize `child.geometry.baselineOffset = 0`.
2. Apply baseline correction in math rendering in `web/src/renderers/svgRenderer.ts` (about 8-15 lines).
   - In `createMathElement(...)`, read `const baselineOffset = Number(node.geometry.baselineOffset ?? 0);` and shift foreignObject `y` to `-height/2 + baselineOffset`.
3. Add a renderer-scoped cached measurement helper in `web/src/renderers/svgRenderer.ts` (about 25-45 lines).
   - Example: `private readonly baselineCache = new Map<string, number>();`
   - Example: `private getBaselineOffset(latex: string, renderer: MathRendererName, fontSize: number): number`
   - Cache key: `renderer + "::" + fontSize + "::" + latex`.
4. Add 1 call site in `createMathElement(...)` (about 1-3 lines).
   - Use `getBaselineOffset(...)` only when `node.geometry.baselineOffset` is not explicitly set.
5. Fallback behavior.
   - Return `0` when KaTeX/MathJax is unavailable or measurement fails, preserving current deterministic behavior.

This keeps compiler compatibility intact while incrementally reducing vertical drift (`r^2` vs `R^2`) in renderer-side token morphing for `TransformMatchingTex`.

## Safety model

The Text DSL compiler runs in the browser and does not execute Python or arbitrary JavaScript from the input. It only parses the supported statements and emits Fluxion IR.

## Camera

```text
camera at 0,0 scale=1 rotation=0
cameraFrame at 0,0 scale=1
set camera.x to -120
animate camera.scale from 1 to 1.6 duration=2s easing=easeInOut
animateFrame to -120,20 scale=1.6 duration=2s easing=easeInOut
```

`camera` configures the document-level `camera: { x, y, scale, rotation }`. Defaults are `x=0`, `y=0`, `scale=1`, and `rotation=0`. `set` / `animate` can target `camera.x`, `camera.y`, `camera.scale`, and `camera.rotation`.

`cameraFrame` is a Manim-style alias for configuring the camera frame cursor. `animateFrame` emits ordinary camera timeline operations, but lets gallery examples describe frame movement as a single high-level command.

The renderer maps the scene origin `(0,0)` to the viewport center, then applies camera pan / zoom / rotation: `translate(centerX + camera.x, centerY + camera.y) rotate(camera.rotation) scale(camera.scale) translate(0, 0)`. With `mode=target` / `mode=frame-fit`, the final translate centers the target coordinate instead. Composition order is `Camera * ParentNode * ChildNode`, so the camera pans / zooms / rotates the entire scene while node transforms stay local.
