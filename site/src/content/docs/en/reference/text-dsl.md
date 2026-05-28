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
| `axes` | Axes helper declaration | `axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2 xNumbers=-4,0,4` |
| `numberPlane` | NumberPlane grid helper | `numberPlane plane xRange=-7,7 yRange=-4,4 unit=60` |
| `axisLabels` | Axes label helper | `axisLabels labels axes=ax x="x" y="f(x)"` |
| `plot` | Function plot path declaration | `plot curve fn=sin(t) range=-3.14,3.14 scaleX=80 scaleY=60` |
| `graphLabel` | Plot graph label helper | `graphLabel label plot=curve label="\sin(x)" xVal=1.57 direction=up` |
| `dataPolygon` | Axes data-coordinate polygon helper | `dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5` |
| `dataRect` | Axes data-coordinate rectangle helper | `dataRect area axes=ax from=0,0 to=t,25/t` |
| `dataDot` | Axes data-coordinate dot helper | `dataDot dot axes=ax point=t,25/t` |
| `dataLine` | Axes data-coordinate line helper | `dataLine marker axes=ax from=2,0 to=2,4` |
| `dynamicLine` | Expression-bound line helper | `dynamicLine connector x1=60*x y1=0 x2=72 y2=-60*y` |
| `dataArea` | Axes bounded area helper | `dataArea area axes=ax lower=t upper=2*t range=1,2` |
| `dataRiemannRects` | Axes Riemann rectangles helper | `dataRiemannRects bars axes=ax fn=4*t-t*t range=0.3,0.6 dx=0.03` |
| `gaussianSurface` | Projected Gaussian surface helper | `gaussianSurface surface range=-2,2 resolution=24 scale=2` |
| `sphereSurface` | Projected sphere surface helper | `sphereSurface sphere radius=104 resolution=15,32` |
| `threeDAxes` | Projected ThreeDAxes helper | `threeDAxes axes xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1` |
| `projectedCircle` | Projected XY-plane circle helper | `projectedCircle circle radius=1 xBasis=-56.75,25.5 yBasis=87.75,13.25` |
| `arrow` | Arrow helper declaration | `arrow vec x1=0 y1=0 x2=190 y2=80` |
| `rotatingLine` | About-point rotating line helper | `rotatingLine arm x1=-120 y1=0 x2=120 y2=0 about=-120,0 angle=-theta` |
| `rotateUpdater` | dt rotation updater expansion | `rotateUpdater arm rate=1 duration=2s` |
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
| `followCamera` | Keep camera target on a moving node | `followCamera dot start=1s duration=2s` |
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
brace brace1 target=axis direction=down label="Horizontal distance"
axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2
dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5 fill="#22d3ee"
arrow vec x1=0 y1=0 x2=190 y2=80 stroke="#22d3ee" fill="#22d3ee"
angle arc radius=60 from=0 to=theta samples=72 stroke="#f59e0b"
tracedPath trace x=150*cos(t) y=150*sin(t) from=0 to=theta samples=120
projectedCircle circle3d radius=1 xBasis=-56.75,25.5 yBasis=87.75,13.25
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
- `brace <id> target=<node-id>`
- `axes <id>`
- `plot <id> fn=<expr>`
- `dataPolygon <id> axes=<axes-id> points=<x,y;...>`
- `arrow <id> x1=<number> y1=<number> x2=<number> y2=<number>`
- `angle <id> radius=<number> from=<expr> to=<expr>`
- `tracedPath <id> x=<expr> y=<expr>`
- `projectedCircle <id> radius=<number>`

`id` values must be unique in a document.

Common options:

- `at x,y`: shortcut for `transform.x` and `transform.y`
- `x`, `y`
- `scale`
- `scaleX`, `scaleY`: optional nonuniform scale multipliers composed with `scale`
- `rotation`
- `opacity`
- `fixedInFrame=true|false`: renders the top-level node in screen-centered coordinates outside the camera transform, matching Manim fixed-in-frame mobjects.
- `fill`, `fillOpacity`, `stroke`, `strokeOpacity`, `strokeWidth`, `strokeLinecap=butt|round|square`, `strokeLinejoin=miter|round|bevel`
- `size` / `fontSize`
- `math` only: `renderer=katex|mathjax`, `expandTokens=true|false`
- `image` only: `w`, `h`, `data=<row;row;...>`; `data` is a grayscale value matrix such as `0,128,255;...`, producing a pixel image similar to Manim `ImageMobject(np.uint8(...))`.
- `group` only: `clipTarget=<rect-or-image-id>` clips the group's children to the referenced node's current bounds; `clip=rect clipW=<number> clipH=<number> [clipX] [clipY]` clips to an explicit centered rectangle.
- `surroundingRect` only: `target=<node-id>`, `buff=<number>`; emits a frame-like `rect` node sized from the target node's declared/estimated bounds. `play Create(frame)` animates its border with `geometry.drawProgress` for a Manim-like outline draw.
- `brace` only: `target=<node-id>`, `direction=up|down|left|right|perpendicular`, `buff`, `sharpness`, `label`, `labelRenderer=text|katex|mathjax`, `labelSize`, `labelColor`, `labelOffset`, `labelAlignment=start|center|end`, `labelW`, `labelH`; emits a Manim `Brace(...)`-style filled brace using the source SVG template model and can place `get_text` / `get_tex`-style labels at the computed brace tip.
- `axes` only: `xRange=<min,max>`, `yRange=<min,max>`, `width`, `height`, `xTicks=<n,n,...>`, `yTicks=<n,n,...>`, `xNumbers=<n,n,...>`, `yNumbers=<n,n,...>`, `tickLength`, `tickStrokeWidth`, `numberSize`, `numberColor`, `xNumberOffset`, `yNumberOffset`; places x/y axis lines at the origin for asymmetric ranges and optionally emits tick lines plus number text.
- `axisLabels` only: `axes=<axes-id>`, `x=<latex>`, `y=<latex>`, `size`, `xSize`, `ySize`, `fill`, `renderer`, `buff`, `xBuff`, `yBuff`, `xYOffset`, `yYOffset`; emits a math label group at the x/y axis endpoints, similar to Manim `Axes.get_axis_labels(...)`.
- `numberPlane` only: `xRange=<min,max>`, `yRange=<min,max>`, `xStep`, `yStep`, `unit`, `xUnit`, `yUnit`, `stroke`/`backgroundLineColor`, `axisStroke`, `xAxisStroke`, `yAxisStroke`, `strokeWidth`/`backgroundLineStrokeWidth`, `axisStrokeWidth`, `xAxisStrokeWidth`, `yAxisStrokeWidth`, `opacity`/`backgroundLineOpacity`, `axisOpacity`, `xAxisOpacity`, `yAxisOpacity`, `fadedLineRatio`, `fadedStroke`, `fadedStrokeWidth`, `fadedOpacity`, `includeTicks`, `addCoordinates`/`includeNumbers`, `xNumbers`, `yNumbers`, `tickLength`, `tickStrokeWidth`, `numberSize`, `numberColor`; emits a Manim `NumberPlane()`-style `group` with background grid lines, faded sub-grid lines, emphasized x/y axes, and optional axis tick/coordinate labels.
- `plot` only: `fn=<expr>`, `range=<min,max>`, `samples`, `scaleX`, `scaleY`, `close=true|false`; emits a generated `path` geometry from the sampled function.
- `graphLabel` only: `plot=<plot-id>`, `label=<latex>`, `xVal`, `direction=right|left|up|down|ur|ul|dr|dl`, `buff`, `size`, `fill`, `renderer`, `w`, `h`, `xOffset`, `yOffset`; positions a math label from a point on a plot helper, similar to Manim `Axes.get_graph_label(...)`.
- `dataPolygon` only: `axes=<axes-id>`, `points=<x,y;...>`; maps at least three data-coordinate points through the referenced `axes` helper and emits a closed `path`.
- `dataLineGraph` only: `axes=<axes-id>`, `points=<x,y;...>`, `lineColor`, `strokeWidth`, `vertexRadius`; maps data-coordinate points through the referenced `axes` helper and emits a Manim `Axes.plot_line_graph`-style `group` with a line path and vertex dots.
- `dataRect` only: `axes=<axes-id>`, `from=<x,y>`, `to=<x,y>`; maps two data-coordinate points through the referenced `axes` helper and emits a `rect` center plus width/height. `from`/`to` may reference value trackers, which expands Manim rectangle-shaped `always_redraw(Polygon(... ax.c2p ...))` cases into `bindExpr`.
- `dataDot` only: `axes=<axes-id>`, `point=<x,y>`, `r`; maps a data-coordinate point through the referenced `axes` helper and emits a `circle` dot. `point` may reference value trackers.
- `dataLine` only: `axes=<axes-id>`, `from=<x,y>`, `to=<x,y>`; maps two data-coordinate points through the referenced `axes` helper and emits a `line`, useful for Manim-style axis-to-graph markers such as `Axes.get_vertical_line(...)`.
- `dynamicLine` only: `x1=<expr>`, `y1=<expr>`, `x2=<expr>`, `y2=<expr>`; emits a `line` and `bindExpr` operations from endpoint expressions that may reference value trackers. This represents Manim connector updaters shaped like `Line(...).become(...)` and defaults to round stroke caps and joins like the other curve helpers.
- `dataArea` only: `axes=<axes-id>`, `lower=<expr>`, `upper=<expr>`, `range=<min,max>`, `samples`; samples two functions and emits a closed `path` similar to Manim `Axes.get_area(..., bounded_graph=...)`.
- `dataRiemannRects` only: `axes=<axes-id>`, `fn=<expr>`, `range=<min,max>`, `dx`; left-samples a function and emits a `group` of `rect` children similar to Manim `Axes.get_riemann_rectangles`.
- `gaussianSurface` only: `range=<min,max>`, `uRange=<min,max>`, `vRange=<min,max>`, `resolution`, `scale`, `sigma`, `mu=<x,y>`, `xBasis=<x,y>`, `yBasis=<x,y>`, `zBasis=<x,y>`, `fillA`, `fillB`, `shade=true|false`, `shadeStrength`, `light=<x,y,z>`; emits a `group` of projected checkerboard mesh `path` faces similar to Manim `Surface(param_gauss).set_fill_by_checkerboard(...)`. When shading is enabled, face colors use the sampled surface normal and positional light with a Manim `get_shaded_rgb`-style light delta. When `phi` / `theta` / `gamma` are provided, each mesh vertex is placed through the Manim `ThreeDCamera` perspective projection.
- `sphereSurface` only: `radius`, `worldRadius`, `xBasis=<x,y>`, `yBasis=<x,y>`, `zBasis=<x,y>`, `uRange`, `vRange`, `resolution=<u,v>`, `fillA`, `fillB`, `light=<x,y,z>`, `shade=true|false`; emits projected checkerboard sphere `path` faces similar to Manim `Surface(..., checkerboard_colors=[RED_D, RED_E], resolution=(15, 32))`. When `xBasis`/`yBasis`/`zBasis` are set, the helper projects a 3D sphere with the given `worldRadius` through that projection basis. When `phi` / `theta` / `gamma` are provided, it uses the Manim `ThreeDCamera` perspective projection.
- `threeDAxes` only: `xRange=<min,max,step>`, `yRange`, `zRange`, `xBasis=<x,y>`, `yBasis=<x,y>`, `zBasis=<x,y>`, `includeTicks`, `includeTips`; emits projected line/tick/tip groups for Manim `ThreeDAxes()` default ranges. When `phi` / `theta` / `gamma` are provided, each axis endpoint and tick is placed through the Manim `ThreeDCamera` perspective projection.
- `projectedCircle` only: `radius`, `xBasis=<x,y>`, `yBasis=<x,y>`; emits a smooth closed cubic `path` for a Manim `Circle()` projected into the XY plane using the same basis vectors as projected 3D axes. When `phi` / `theta` / `gamma` are provided, it samples the circle with Manim `ThreeDCamera`'s `rotation_about_z(-theta-90deg) -> rotation_matrix(-phi, RIGHT) -> rotation_about_z(gamma)` order and `focalDistance / (focalDistance - z)` perspective factor, then converts those projected samples into a closed cubic curve.
- `arrow` only: `x1`, `y1`, `x2`, `y2`, `buff`, `tipLength`, `tipWidth`, `tipShape`, `maxTipLengthToLengthRatio`, `maxStrokeWidthToLengthRatio`; emits a `group` with a line shaft and Manim-style tip path. `tipShape` accepts `triangle`, `triangleFilled` (default), `square`, `squareFilled`, `circle`, `circleFilled`, `stealth`, or matching Manim names such as `ArrowSquareTip`. `tipLength` and `strokeWidth` are clamped against drawable length ratios like Manim `Arrow`.
- `rotatingLine` only: `x1`, `y1`, `x2`, `y2`, `about=<x,y>`, `angle=<expr>`; emits a `line` made by rotating the reference segment around the given point, and updates endpoints with `bindExpr` when `angle` references a value tracker. This expands Manim-style `Line(...).rotate(angle, about_point=...)` into DSL.
- `rotateUpdater` only: `rate=<radians-per-second>`, `duration`, `easing`, `from`; expands Manim callback updaters shaped like `mobject.add_updater(lambda m, dt: m.rotate_about_origin(rate * dt))` into cumulative `rotation` animation.
- `angle` only: `radius` / `r`, `from`, `to`, `samples`, `close=true|false`; emits a generated `path` arc and a `bindPath` updater. Expressions can reference value trackers, so `to=theta` follows an animated tracker.
- `tracedPath` only: either `x`, `y`, `from`, `to`, `samples`, `close=true|false` for a generated parametric `path` plus `bindPath` updater, or `target=<node-id>`, `start=<time>`, `samples`, `sampling=fixed|frame` to rebuild the target node's center history from the timeline at seek time, similar to Manim `TracedPath(mobject.get_center)`. `sampling=frame` uses the document fps up to `samples`, so partial traces grow with elapsed frames.


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

A block sets the current cursor to the given time for its indented statements. `show` creates a declared node at that time, `hide` deletes it, and `set` applies an immediate property value. `play` and `wait` advance the block cursor, so sequential Manim-style scripts can be written inside one block. Use `AnimationGroup` or separate `at` blocks when operations must share the same start time.

### value trackers

```text
value theta = 0
animate theta from 0 to 6.28 duration=2s easing=linear
set dot.x to expr="320 + 100 * cos(theta)"
set dot.y to expr="240 + 100 * sin(theta)"
```

`value` declares a scalar tracker that lives separately from scene nodes. A tracker can be animated with `animate <name> from <number> to <number> ...`, and node properties can depend on tracker values through `set <id>.<property> to expr="..."`.

Dependent expressions are intentionally static and analyzable. Fluxion does **not** execute arbitrary JavaScript and does not aim for full Manim updater compatibility. Expressions may reference declared tracker names, numeric literals, parentheses, arithmetic operators (`+`, `-`, `*`, `/`, `%`, `**`), constants (`pi`, `e`), and allowlisted math functions such as `sin`, `cos`, `tan`, `sqrt`, `abs`, `min`, `max`, `pow`, `clip01`, and `clipPi`.

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
followCamera dot frame=frame start=1s duration=2s
```

`animate` interpolates a target property or a declared scalar value tracker. Numeric values interpolate; non-numeric node property values switch to `to` at completion.

`animateFrame` is camera-frame sugar. It expands to synchronized `camera.x`, `camera.y`, `camera.scale`, and `camera.rotation` animations from the compiler's current camera frame cursor. Use `cameraFrame at x,y scale=<number>` to set the initial frame cursor. With an id (`cameraFrame frame ...`), it also creates an invisible `rect` mobject with `geometry.cameraFrame=true` to track Manim `self.camera.frame` state. `animateFrame` supports `to x,y`, `scale`, `rotation`, `start`, `duration`, and `easing`.

`followCamera <node-id> [frame=<frame-id>] [start=<time>] [duration=<time>]` applies after animations and writes the node center to `camera.target`. When `frame` is provided, the referenced frame node's `transform.x/y` are updated too. It is updater sugar for Manim-like `self.camera.frame.add_updater(lambda mob: mob.move_to(target.get_center()))` camera following. If `duration` is omitted, following remains active after `start`.

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

- `FadeIn(id, shift=UP)`: creates the node at hidden opacity, emits `effect=fadeIn`, and animates `transform.opacity`. With `shift`, it moves from `target - shift` to the target, matching Manim.
- `FadeOut(id, shift=DOWN)`: emits `effect=fadeOut`, animates `transform.opacity` to `0`, and deletes the node when the duration ends. With `shift`, it moves from the target to `target + shift`.
- `Animate(id, shift=LEFT|(x,y), opacity=<number>, fill=<css-color>, fillOpacity=<number>, stroke=<css-color>, strokeOpacity=<number>, strokeWidth=<number>, scale=<factor>, rotate=<radians>, rotation=<degrees>)`: builds a target-state clone, applies the listed Manim-like mobject methods/options, and expands the resulting transform/style differences into animations.
- `Create(id)`: creates the node and emits `effect=create`. For `surroundingRect` frames, it also animates `geometry.drawProgress` so the border is drawn on.
- `Write(id)`: creates writable leaves with `geometry.writeProgress=0`, emits `effect=write`, and reveals each leaf with width-paced left-to-right timing to approximate Manim's written-on appearance.
- `MoveAlongPath(id, path)`: for `circle` path nodes, expands to `transform.x/y` bindings plus a value animation that traverses the circle once from the rightmost point. For `plot` paths with `easing=linear`, expands to arc-length-segmented position animations over the smoothed cubic plot curve, matching Manim's `path.point_from_proportion(...)` behavior more closely than raw sample-point interpolation.
- `Rotating(id[, angle], about=(x,y), axis=OUT)`: rotates the node around its own center or the explicit point using Manim's `Rotating` defaults: `angle=TAU`, OUT axis, and linear-style tracker motion when the play easing is `linear`.
- `Transform(source, target)`: animates the source node toward transform/style/geometry properties from the target node.
- `TransformMatchingTex(source, target)`: matches expanded `math` token children by identical token text. Matched tokens expand to `Transform`, source-only tokens expand to `FadeOut`, and target-only tokens expand to `FadeIn`.
- `ReplacementTransform(from, to)`: morphs `from` toward `to`, deletes `from`, and materializes `to` at the end.
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

Unsupported tokens are handled explicitly: source-only tokens fade out and are deleted at the end of the duration; target-only tokens are created at hidden opacity and fade in; matched tokens transform from the source token id toward the destination token state. The current token child positions are semantic anchors, not a full TeX layout engine for complex formulas.

For renderer-side stability, math rendering measures each KaTeX/MathJax fragment against an inline baseline marker and caches a bounded `baselineOffset` per renderer/font/LaTeX tuple. Explicit `geometry.baselineOffset` values still win when supplied. If KaTeX/MathJax is unavailable or measurement fails, the renderer falls back to `0`, preserving deterministic output.

## Safety model

The Text DSL compiler runs in the browser and does not execute Python or arbitrary JavaScript from the input. It only parses the supported statements and emits Fluxion IR.

## Camera

```text
camera at 0,0 scale=1 rotation=0
cameraFrame at 0,0 scale=1
cameraFrame frame at 0,0 scale=1 opacity=0
set camera.x to -120
animate camera.scale from 1 to 1.6 duration=2s easing=easeInOut
animateFrame to -120,20 scale=1.6 duration=2s easing=easeInOut
followCamera dot frame=frame start=1s duration=2s
```

`camera` configures the document-level `camera: { x, y, scale, rotation }`. Defaults are `x=0`, `y=0`, `scale=1`, and `rotation=0`. `set` / `animate` can target `camera.x`, `camera.y`, `camera.scale`, `camera.rotation`, `camera.target.x`, and `camera.target.y`.

`cameraFrame` is a Manim-style alias for configuring the camera frame cursor. With an id (`cameraFrame frame ...`), it also creates an invisible `rect` mobject with `geometry.cameraFrame=true` to track Manim `self.camera.frame` state. `animateFrame` emits ordinary camera timeline operations, but lets gallery examples describe frame movement as a single high-level command.

`followCamera <node-id> [frame=<frame-id>] [start=<time>] [duration=<time>]` applies after animations and writes the node center to `camera.target`. When `frame` is provided, the referenced frame node's `transform.x/y` are updated too.

The renderer maps the scene origin `(0,0)` to the viewport center, then applies camera pan / zoom / rotation: `translate(centerX + camera.x, centerY + camera.y) rotate(camera.rotation) scale(camera.scale) translate(0, 0)`. With `mode=target` / `mode=frame-fit`, the final translate centers the target coordinate instead. Composition order is `Camera * ParentNode * ChildNode`, so the camera pans / zooms / rotates the entire scene while node transforms stay local.
