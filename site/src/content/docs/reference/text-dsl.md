---
title: Text DSL reference
description: Fluxion Text DSL の現在の syntax reference。
---

Fluxion Text DSL は、ブラウザ上で短い宣言的なアニメーション記述を `.fluxion.json` に変換するための現在の最小仕様です。Python DSL とは別の入力フロントエンドですが、出力先は同じ Fluxion IR です。

現在の Text DSL の目的は「図形や math/path/group を置き、表示タイミングを決め、単純なプロパティ animation と Manim 風 animation primitive を再生する」ことに絞ります。任意コード実行、条件分岐、ループ、外部 include は扱いません。


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

次の demo は GitHub Pages の Playground にそのまま貼り付けて実行できます。node declaration、`at` block、`show` / `hide`、`set`、`animate`、`play`、`wait` をまとめて使います。

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
```

## Lexical Rules

- 1 行に 1 statement を書きます。
- 空行は無視します。
- `#` から行末までは comment です。ただし quoted string 内の `#` は文字として扱います。
- quoted string は `"` で囲みます。`\"` で quote を escape できます。
- token は whitespace で区切ります。quoted string 内の whitespace は保持します。
- time は `1`, `1.5`, `1s`, `1.5s` を受け付け、単位は seconds として扱います。
- color は文字列として扱います。現在は CSS color validation はしません。

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

Scene の基本設定です。すべて省略可能で、default は `width=1280`, `height=720`, `fps=60` です。

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

`id` は document 内で一意である必要があります。

Common options:

- `at x,y`: shortcut for `transform.x` and `transform.y`
- `x`, `y`
- `scale`
- `scaleX`, `scaleY`: optional nonuniform scale multipliers composed with `scale`
- `rotation`
- `opacity`
- `fixedInFrame=true|false`: top-level node を camera transform の外側、画面中央基準座標で描画し、Manim の fixed-in-frame mobject を近似します。
- `fill`, `fillOpacity`
- `stroke`, `strokeOpacity`
- `strokeWidth`, `strokeLinecap=butt|round|square`, `strokeLinejoin=miter|round|bevel`

Geometry options:

- `circle`: `r`
- `rect`: `w`, `h`
- `line`: `x1`, `y1`, `x2`, `y2`
- `path`: `d` (SVG path data string)
- `text`: `size` or `fontSize`
- `math`: `size` or `fontSize`, `renderer=katex|mathjax`, `expandTokens=true|false`
- `image`: `w`, `h`, `data=<row;row;...>`; `data` は `0,128,255;...` のようなグレースケール値行列で、Manim `ImageMobject(np.uint8(...))` 風の pixel image を生成します。
- `group`: child ids are copied into `children` and removed from top-level roots. `clipTarget=<rect-or-image-id>` clips children to the referenced node's current bounds; `clip=rect clipW=<number> clipH=<number> [clipX] [clipY]` clips to an explicit centered rectangle.
- `surroundingRect`: `target=<node-id>`, `buff=<number>`; target の宣言/推定 bounds に基づく frame-like な `rect` node として出力されます。`play Create(frame)` では `geometry.drawProgress` により Manim 風に外枠が描画されます。
- `brace`: `target=<node-id>`, `direction=up|down|left|right|perpendicular`, `buff`, `sharpness`, `label`, `labelRenderer=text|katex|mathjax`, `labelSize`, `labelColor`, `labelOffset`, `labelAlignment=start|center|end`, `labelW`, `labelH`; Manim `Brace(...)` 風に source SVG template model から塗りつぶし brace を生成し、`get_text` / `get_tex` 相当の label を計算済み tip 近傍に配置できます。
- `axes`: `xRange=<min,max>`, `yRange=<min,max>`, `width`, `height`, `xTicks=<n,n,...>`, `yTicks=<n,n,...>`, `xNumbers=<n,n,...>`, `yNumbers=<n,n,...>`, `tickLength`, `tickStrokeWidth`, `numberSize`, `numberColor`, `xNumberOffset`, `yNumberOffset`; 非対称 range の原点に x/y 軸を置き、必要に応じて tick line と number text を持つ `group` node を生成します。
- `axisLabels`: `axes=<axes-id>`, `x=<latex>`, `y=<latex>`, `size`, `xSize`, `ySize`, `fill`, `renderer`, `buff`, `xBuff`, `yBuff`, `xYOffset`, `yYOffset`; Manim `Axes.get_axis_labels(...)` 風に x/y 軸端へ math label group を生成します。
- `numberPlane`: `xRange=<min,max>`, `yRange=<min,max>`, `xStep`, `yStep`, `unit`, `xUnit`, `yUnit`, `stroke`/`backgroundLineColor`, `axisStroke`, `xAxisStroke`, `yAxisStroke`, `strokeWidth`/`backgroundLineStrokeWidth`, `axisStrokeWidth`, `xAxisStrokeWidth`, `yAxisStrokeWidth`, `opacity`/`backgroundLineOpacity`, `axisOpacity`, `xAxisOpacity`, `yAxisOpacity`, `fadedLineRatio`, `fadedStroke`, `fadedStrokeWidth`, `fadedOpacity`, `includeTicks`, `addCoordinates`/`includeNumbers`, `xNumbers`, `yNumbers`, `tickLength`, `tickStrokeWidth`, `numberSize`, `numberColor`; Manim `NumberPlane()` 風の背景 grid line / faded sub-grid line、強調 x/y 軸、任意の axis tick / coordinate label を持つ `group` node を生成します。
- `plot`: `fn=<expr>`, `range=<min,max>`, `samples`, `scaleX`, `scaleY`, `close=true|false`; 関数をサンプリングした `path` geometry を生成します。
- `graphLabel`: `plot=<plot-id>`, `label=<latex>`, `xVal`, `direction=right|left|up|down|ur|ul|dr|dl`, `buff`, `size`, `fill`, `renderer`, `w`, `h`, `xOffset`, `yOffset`; Manim `Axes.get_graph_label(...)` 風に plot helper 上の点から math label を配置します。
- `dataPolygon`: `axes=<axes-id>`, `points=<x,y;...>`; 3 点以上のデータ座標を参照先 `axes` helper で scene 座標に変換し、閉じた `path` を生成します。
- `dataLineGraph`: `axes=<axes-id>`, `points=<x,y;...>`, `lineColor`, `strokeWidth`, `vertexRadius`; Manim `Axes.plot_line_graph` 風に、参照先 `axes` のデータ座標から折れ線 path と vertex dot を持つ `group` を生成します。
- `dataRect`: `axes=<axes-id>`, `from=<x,y>`, `to=<x,y>`; 参照先 `axes` のデータ座標から `rect` の中心と幅/高さを生成します。`from`/`to` は value tracker を参照する式にでき、Manim `always_redraw(Polygon(... ax.c2p ...))` の rectangle 型ケースを `bindExpr` へ展開できます。
- `dataDot`: `axes=<axes-id>`, `point=<x,y>`, `r`; 参照先 `axes` のデータ座標から `circle` dot を生成します。`point` は value tracker を参照する式にできます。
- `dataLine`: `axes=<axes-id>`, `from=<x,y>`, `to=<x,y>`; 参照先 `axes` のデータ座標から `line` を生成します。Manim `Axes.get_vertical_line(...)` のような axis-to-graph marker を表現できます。
- `dynamicLine`: `x1=<expr>`, `y1=<expr>`, `x2=<expr>`, `y2=<expr>`; value tracker を参照する endpoint 式から `line` と `bindExpr` を生成します。Manim の `Line(...).become(...)` updater 型の connector を表現できます。
- `dataArea`: `axes=<axes-id>`, `lower=<expr>`, `upper=<expr>`, `range=<min,max>`, `samples`; 2つの関数をサンプリングし、Manim `Axes.get_area(..., bounded_graph=...)` 風の閉じた `path` を生成します。
- `dataRiemannRects`: `axes=<axes-id>`, `fn=<expr>`, `range=<min,max>`, `dx`; 関数を left-sample し、Manim `Axes.get_riemann_rectangles` 風の `rect` 群を持つ `group` を生成します。
- `gaussianSurface`: `range=<min,max>`, `uRange=<min,max>`, `vRange=<min,max>`, `resolution`, `scale`, `sigma`, `mu=<x,y>`, `xBasis=<x,y>`, `yBasis=<x,y>`, `zBasis=<x,y>`, `fillA`, `fillB`, `shade=true|false`, `shadeStrength`, `light=<x,y,z>`; Manim `Surface(param_gauss).set_fill_by_checkerboard(...)` 風の投影済み checkerboard mesh を `path` 群の `group` として生成します。shading 有効時は面法線と位置光源から Manim `get_shaded_rgb` 風の light delta を計算します。`phi` / `theta` / `gamma` を指定すると、各 mesh 頂点を Manim `ThreeDCamera` 由来の透視投影で配置します。
- `sphereSurface`: `radius`, `worldRadius`, `xBasis=<x,y>`, `yBasis=<x,y>`, `zBasis=<x,y>`, `uRange`, `vRange`, `resolution=<u,v>`, `fillA`, `fillB`, `light=<x,y,z>`, `shade=true|false`; Manim `Surface(..., checkerboard_colors=[RED_D, RED_E], resolution=(15, 32))` 風の球面 checkerboard を投影済み `path` 群として生成します。`xBasis`/`yBasis`/`zBasis` を指定すると、`worldRadius` の 3D 球面をその projection basis で描きます。`phi` / `theta` / `gamma` 指定時は Manim `ThreeDCamera` 由来の透視投影を使います。
- `threeDAxes`: `xRange=<min,max,step>`, `yRange`, `zRange`, `xBasis=<x,y>`, `yBasis=<x,y>`, `zBasis=<x,y>`, `includeTicks`, `includeTips`; Manim `ThreeDAxes()` の既定 range を投影済み line/tick/tip 群として生成します。`phi` / `theta` / `gamma` を指定すると、各 axis endpoint と tick を Manim `ThreeDCamera` 由来の透視投影で個別に配置します。
- `projectedCircle`: `radius`, `xBasis=<x,y>`, `yBasis=<x,y>`; projected 3D axes と同じ basis vector から、Manim `Circle()` を XY 平面へ投影した滑らかな閉じた cubic `path` を生成します。`phi` / `theta` / `gamma` を指定すると、Manim `ThreeDCamera` と同じ `rotation_about_z(-theta-90°) -> rotation_matrix(-phi, RIGHT) -> rotation_about_z(gamma)` と `focalDistance / (focalDistance - z)` の透視係数で circle をサンプリングし、投影済みサンプルを閉じた cubic curve へ変換します。
- `arrow`: `x1`, `y1`, `x2`, `y2`, `buff`, `tipLength`, `tipWidth`, `tipShape`, `maxTipLengthToLengthRatio`, `maxStrokeWidthToLengthRatio`; line shaft と Manim 風 tip path を持つ `group` を生成します。`tipShape` は `triangle`、`triangleFilled`（既定）、`square`、`squareFilled`、`circle`、`circleFilled`、`stealth`、または `ArrowSquareTip` などの Manim class 名を受け付けます。`tipLength` と `strokeWidth` は Manim `Arrow` と同じく drawable length に対する上限比で clamp されます。
- `rotatingLine`: `x1`, `y1`, `x2`, `y2`, `about=<x,y>`, `angle=<expr>`; 基準線分を指定点まわりに回転した `line` を生成し、`angle` が value tracker を参照する場合は endpoint を `bindExpr` で更新します。Manim の `Line(...).rotate(angle, about_point=...)` を DSL で展開する helper です。
- `rotateUpdater`: `rate=<radians-per-second>`, `duration`, `easing`, `from`; Manim の `mobject.add_updater(lambda m, dt: m.rotate_about_origin(rate * dt))` 型 callback updater を、累積した `rotation` animation として展開します。
- `angle`: `radius` / `r`, `from`, `to`, `samples`, `close=true|false`; 円弧の `path` と `bindPath` updater を生成します。式は value tracker を参照できるため、`to=theta` のように animated tracker に追従できます。
- `tracedPath`: `x`, `y`, `from`, `to`, `samples`, `close=true|false` を指定すると parametric `path` と `bindPath` updater を生成します。`target=<node-id>`, `start=<time>`, `samples`, `sampling=fixed|frame` を指定すると、seek 時に target node の中心履歴を timeline から再構築し、Manim `TracedPath(mobject.get_center)` に近い trace を生成します。`sampling=frame` は document fps に基づき、`samples` を上限として経過 frame 数に応じて trace 点を増やします。

Default values:

- transform: `x=0`, `y=0`, `scale=1`, `rotation=0`, `opacity=1`; `scaleX` / `scaleY` are optional and default to `1`
- style: `fill="#ffffff"`, `fillOpacity=1`, `stroke="none"`, `strokeOpacity=1`, `strokeWidth=0`; curve helpers such as `plot`, `angle`, `tracedPath`, `dynamicLine`, and `dataLineGraph` default to `strokeLinecap=round`, `strokeLinejoin=round`
- circle: `r=40`
- rect: `w=100`, `h=80`
- line: `x1=0`, `y1=0`, `x2=100`, `y2=0`
- path: `d=""`
- text: `fontSize=32`
- math: `fontSize=36`, `renderer=katex`, `expandTokens=false`
- group: empty geometry and `children=[]`

### Path morphing constraints

- `path.d` animations with identical SVG command topology (same command sequence and numeric arity) use strict numeric interpolation of each command value.
- `path.d` animations with different topology use a resampling fallback: supported `M` / `L` / `C` / `Q` / `Z` path data is sampled into a fixed number of polyline points, then those points are interpolated. This allows common line/curve command-count differences to morph as path strings.
- If either side contains path commands outside the fallback sampler, the animation falls back to step interpolation: the source value is used before the end time, and the destination value is used at the end time.

### at block

```text
at 1.5s:
  show c1
  animate c1.opacity from 1 to 0.5 duration=0.5s
```

`at <time>:` は、indented statements の current cursor を指定時刻に設定します。現在は block 内で `show`, `hide`, `set`, `wait`, `play`, `animate` を使えます。`play` と `wait` は block cursor を進めるため、Manim 風の逐次手順を1つの block 内に書けます。同時開始したい処理には `AnimationGroup` か個別の `at` block を使います。

Indentation は block 判定にだけ使います。空白数の厳密な意味はありません。

### show

```text
show c1
```

指定した node を timeline に `create` operation として追加します。

Top-level の `show` は compiler の current time を使います（初期値は `0`）。`at` block 内の `show` は block time を使います。

明示的に `show` されなかった node は、preview しやすいように `t=0` の `create` operation として自動追加します。自動追加の順序は source 内の node declaration 順です。


### hide

```text
hide c1
```

指定した node を timeline に `delete` operation として追加します。Top-level では compiler の current time、`at` block 内では block time を使います。

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

`always` は毎フレーム実行される updater を登録します。`expr=...` は単一プロパティを更新し、`path(...)` はパラメトリック曲線をサンプルして（通常は `geometry.d` に）SVG path 文字列を書き戻します。`path(...)` の必須項目は `x` / `y`（`t` を使える式）で、`from` / `to` / `samples` / `close` は省略可能です（既定: `0`, `2*pi`, `96`, `false`）。

### set

```text
set title.fill to "#38bdf8"
set c1.x to 320
```

指定した property を timeline に `set` operation として追加します。`expr="..."` を指定した場合は dependent expression として保持され、runtime が各時刻の tracker 値で評価します。

Syntax:

```text
set <id>.<property> to <value>
```

`<property>` は `animate` と同じ alias rules で IR path に変換されます。

### wait

```text
wait 0.5s
```

Compiler state の current time を指定秒数だけ進めます。Top-level では top-level current time を進め、`at` block 内ではその block の current time を進めます。`wait` 自体は timeline operation を生成しません。

### play

```text
play FadeIn(title) duration=1s
play AnimationGroup(FadeIn(a), FadeIn(b), lagRatio=0.2) duration=1s
play Succession(Create(a), Transform(a, b)) duration=2s
play Transform(a, b) duration=1.5s easing=easeInOut
play TransformMatchingTex(eq1, eq2) duration=1s
```

Manim 風の animation primitive を timeline operations に変換します。`play` は top-level と `at` block の両方で使えます。`play` は compiler state の current time から始まり、primitive の duration 分だけ current time を進めます。

Syntax:

```text
play <Primitive>(<args...>) [duration=<time>] [easing=<name>]
play AnimationGroup(<Primitive>(...), <Primitive>(...), [lagRatio=<number>]) [duration=<time>] [easing=<name>]
play LaggedStart(<Primitive>(...), <Primitive>(...), [lagRatio=<number>]) [duration=<time>] [easing=<name>]
play Succession(<Primitive>(...), <Primitive>(...)) [duration=<time>] [easing=<name>]
```

`play` の call parser は nested call を理解するため、`AnimationGroup(FadeIn(a), FadeIn(b), lagRatio=0.2)` や `Succession(Create(a), Transform(a, b))` のように、並列/逐次 composition を 1 statement で表せます。

Options:

- `duration`: animation duration。省略時は `1`
- `easing`: easing name。省略時は `smooth`

Supported primitives:

- `FadeIn(id, shift=UP)`: hidden opacity の `create`、semantic `effect=fadeIn`、`transform.opacity` animation を生成します。`shift` を指定すると、Manim と同じく `target - shift` から target へ移動します。
- `FadeOut(id, shift=DOWN)`: semantic `effect=fadeOut`、`transform.opacity` animation、duration 終了時の `delete` を生成します。`shift` を指定すると、target から `target + shift` へ移動します。
- `Animate(id, shift=LEFT|(x,y), opacity=<number>, fill=<css-color>, fillOpacity=<number>, stroke=<css-color>, strokeOpacity=<number>, strokeWidth=<number>, scale=<factor>, rotate=<radians>, rotation=<degrees>)`: target-state clone を作り、指定した Manim 風 mobject method/option を適用して、差分を transform/style animation に展開します。
- `Create(id)`: `create` と semantic `effect=create` を生成します。`surroundingRect` frame では `geometry.drawProgress` も animation し、外枠を描き出します。
- `Write(id)`: writable leaf を `geometry.writeProgress=0` で `create` し、semantic `effect=write` と、幅に応じた left-to-right reveal を生成して Manim の書き出し表示を近似します。
- `MoveAlongPath(id, path)`: `circle` path node では、Manim の circular path proportion に合わせ、右端から反時計回りに 1 周する `transform.x/y` binding と value animation に展開します。`plot` path では `easing=linear` の場合、描画に使う smoothed cubic plot curve の曲線長に沿った位置 animation に展開し、Manim の `path.point_from_proportion(...)` 挙動へ寄せます。
- `Rotating(id[, angle], about=(x,y), axis=OUT)`: node 自身の中心または明示した点を中心に回転します。Manim の `Rotating` に合わせ、`angle=TAU`、OUT axis を既定とし、`easing=linear` では等速の tracker motion になります。
- `Transform(a, b)`: `a` を target として、`b` と異なる transform/style/geometry property ごとに `animate` operation を生成します。
- `TransformMatchingTex(a, b)`: `math` node の token child を同一 token 文字列で対応付け、対応 token は `Transform`、消える token は `FadeOut`、新規 token は `FadeIn` に展開します。
- `ReplacementTransform(from, to)`: `from` を `to` へ morph し、終了時に `from` を削除して `to` を materialize します。
- `Circumscribe(id)`: highlight outline 用の semantic circumscribe effect を生成します。`color=<css-color>` は play statement 側または call 内で指定できます。
- `AnimationGroup(<animations...>, lagRatio=0)`: child animation を並列に展開します。`lagRatio` は child start のずれを child duration に対する比率で指定し、group 全体は `duration` に収まるように正規化されます。
- `Succession(<animations...>)`: child animation を左から右へ逐次展開します。各 child の duration は `play` の `duration` を child 数で等分します。

#### TransformMatchingTex and token matching

`TransformMatchingTex(a, b)` は `math` node 専用です。両方の node を `expandTokens=true` 付きで宣言しておく必要があります。

```text
math eq1 "a+b" expandTokens=true at 320,180
math eq2 "bca" expandTokens=true at 640,180
play TransformMatchingTex(eq1, eq2) duration=1s
```

Token 化は LaTeX 文字列を command（例: `\pi`, `\frac`）、escape 済み 1 文字、`^` / `_`、brace、通常文字に分割し、whitespace は捨てます。matching は token の `latex` 文字列が完全一致する child 同士で行い、source 側の出現順で destination 側の未使用 token を先頭から 1 つ消費します。同じ token が複数ある場合はこの安定した出現順 matching になります。

未対応 token の扱いは次の通りです。

- source にだけある token: `FadeOut(token)` に展開し、duration 終了時に delete します。
- destination にだけある token: hidden opacity の create から `FadeIn(token)` に展開します。
- 両方にある token: source token id を target にした `Transform(sourceToken, destinationToken)` に展開します。

制約: `expandTokens=true` がない `math` node、または token child を持たない node には使えません。現在の token child の位置は semantic anchor であり、複雑な TeX layout 全体を再現するものではありません。

renderer 側では、KaTeX/MathJax fragment を inline baseline marker と比較して実測し、renderer / font size / LaTeX ごとの bounded `baselineOffset` として cache します。`geometry.baselineOffset` が明示されている場合はその値を優先します。KaTeX/MathJax 未読込時・計測失敗時は `0` に fallback し、決定的な出力を維持します。

### animate

```text
animate c1.x from 220 to 640 start=0s duration=1.5s easing=easeInOut
animateFrame to 120,40 scale=1.4 duration=1s easing=easeInOut
```

指定した property を `animate` operation に変換します。

Syntax:

```text
animate <id>.<property> from <value> to <value> [start=<time>] [duration=<time>] [easing=<name>]
animate <value-id> from <number> to <number> [start=<time>] [duration=<time>] [easing=<name>]
animateFrame to <x,y> [scale=<number>] [rotation=<number>] [start=<time>] [duration=<time>] [easing=<name>]
```

`animateFrame` は camera frame 用の sugar です。compiler が保持する現在の camera frame cursor から、同期した `camera.x`, `camera.y`, `camera.scale`, `camera.rotation` animation に展開します。初期 frame cursor は `cameraFrame at x,y scale=<number>` で設定できます。

Options:

- `start`: animation start time。省略時は top-level では compiler の current time、`at` block 内では block time
- `duration`: animation duration。省略時は `1`
- `easing`: easing name。省略時は `smooth`

Supported easing names:

- `linear`
- `smooth`
- `easeInOut`
- `easeIn`
- `easeOut`

Supported property aliases:

- `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotation`, `opacity` -> `transform.*`
- `fill`, `fillOpacity`, `stroke`, `strokeOpacity`, `strokeWidth`, `strokeLinecap`, `strokeLinejoin` -> `style.*`
- `r`, `w`, `h`, `fontSize`, `x1`, `y1`, `x2`, `y2`, `d` -> `geometry.*`
- `text` -> `text`

現在の runtime は numeric interpolation を主対象にします。string value の animation は IR としては出力できますが、滑らかな補間は保証しません。
Runtime では non-numeric value は animation 完了時に `to` value へ切り替わります。

## Error Reporting

Compiler は `DslCompileError` を投げます。message は `Line <line>, column <column>: <message>` 形式です。

代表的な error:

- unknown statement
- duplicate node id
- unknown node reference
- unknown option
- unknown easing
- malformed `at` block
- malformed `animate` syntax
- malformed `play`, `set`, or `wait` syntax
- unclosed quoted string

## Out Of Scope For Current Text DSL

以下は現在の Text DSL では仕様外です。

- nested blocks
- loops, conditionals, variables
- `include`, `theme`, `component`
- CSS color validation
- schema validation inside the compiler
- full Manim compatibility syntax beyond the supported `play` primitives
- nested groups declared before their children
- live mutation of compiler node declarations after `set`
- richer editor diagnostics using `DslCompileError.line` and `column`

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

`camera` は document-level の `camera: { x, y, scale, rotation }` を設定します。既定値は `x=0`, `y=0`, `scale=1`, `rotation=0` です。`set` / `animate` は `camera.x`, `camera.y`, `camera.scale`, `camera.rotation`, `camera.target.x`, `camera.target.y` を target にできます。

`cameraFrame` は camera frame cursor を設定する Manim 風 alias です。id を付けた `cameraFrame frame ...` は `geometry.cameraFrame=true` の不可視 `rect` mobject も作成し、Manim の `self.camera.frame` 状態を追跡する用途に使えます。`animateFrame` は通常の camera timeline operation を出力しつつ、gallery example では frame movement を単一の高水準 command として記述できます。

`followCamera <node-id> [frame=<frame-id>] [start=<time>] [duration=<time>]` は animation を適用した後の node center を `camera.target` に反映します。`frame` を指定すると、参照した frame node の `transform.x/y` も同時に更新します。Manim の `self.camera.frame.add_updater(lambda mob: mob.move_to(target.get_center()))` に近い camera follow を表すための updater sugar です。`duration` を省略すると、start 以降ずっと追従します。

Renderer は scene origin `(0,0)` を viewport center に移してから zoom / rotation / pan を適用します: `translate(centerX + camera.x, centerY + camera.y) rotate(camera.rotation) scale(camera.scale) translate(0, 0)`。`mode=target` / `mode=frame-fit` では最後の translate が target 座標を中心へ合わせます。合成順序は `Camera * ParentNode * ChildNode` です。つまり camera は scene 全体の pan / zoom / rotation、node transform は各 node の local transform として扱われます。
