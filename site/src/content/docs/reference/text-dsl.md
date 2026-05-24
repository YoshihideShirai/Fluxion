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
| `axes` | Axes helper declaration | `axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2` |
| `plot` | Function plot path declaration | `plot curve fn=sin(t) range=-3.14,3.14 scaleX=80 scaleY=60` |
| `dataPolygon` | Axes data-coordinate polygon helper | `dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5` |
| `angle` | Updating angle arc helper | `angle arc radius=60 from=0 to=theta samples=72` |
| `tracedPath` | Updating trace path helper | `tracedPath trace x=150*cos(t) y=150*sin(t) from=0 to=theta` |
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
axes ax at 0,-40 width=720 height=320 xRange=-4,4 yRange=-2,2
dataPolygon poly axes=ax points=-2,-0.5;0,1;2,0.5 fill="#22d3ee"
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
- `angle <id> radius=<number> from=<expr> to=<expr>`
- `tracedPath <id> x=<expr> y=<expr>`

`id` は document 内で一意である必要があります。

Common options:

- `at x,y`: shortcut for `transform.x` and `transform.y`
- `x`, `y`
- `scale`
- `rotation`
- `opacity`
- `fill`
- `stroke`
- `strokeWidth`

Geometry options:

- `circle`: `r`
- `rect`: `w`, `h`
- `line`: `x1`, `y1`, `x2`, `y2`
- `path`: `d` (SVG path data string)
- `text`: `size` or `fontSize`
- `math`: `size` or `fontSize`, `renderer=katex|mathjax`, `expandTokens=true|false`
- `group`: child ids are copied into `children` and removed from top-level roots
- `surroundingRect`: `target=<node-id>`, `buff=<number>`; target の宣言/推定 bounds に基づく frame-like な `rect` node として出力されます。`play Create(frame)` では `geometry.drawProgress` により Manim 風に外枠が描画されます。
- `axes`: `xRange=<min,max>`, `yRange=<min,max>`, `width`, `height`; x/y 軸の line を持つ `group` node を生成します。
- `plot`: `fn=<expr>`, `range=<min,max>`, `samples`, `scaleX`, `scaleY`, `close=true|false`; 関数をサンプリングした `path` geometry を生成します。
- `dataPolygon`: `axes=<axes-id>`, `points=<x,y;...>`; 3 点以上のデータ座標を参照先 `axes` helper で scene 座標に変換し、閉じた `path` を生成します。
- `angle`: `radius` / `r`, `from`, `to`, `samples`, `close=true|false`; 円弧の `path` と `bindPath` updater を生成します。式は value tracker を参照できるため、`to=theta` のように animated tracker に追従できます。
- `tracedPath`: `x`, `y`, `from`, `to`, `samples`, `close=true|false`; `path` と `bindPath` updater を生成します。現時点では parametric motion 用の declarative trace helper で、Manim `TracedPath` の履歴ベース追跡 clone ではありません。

Default values:

- transform: `x=0`, `y=0`, `scale=1`, `rotation=0`, `opacity=1`
- style: `fill="#ffffff"`, `stroke="none"`, `strokeWidth=0`
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

`at <time>:` は、indented statements の default start time を設定します。現在は block 内で `show`, `hide`, `set`, `wait`, `play`, `animate` を使えます。

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

Dependent expressions are intentionally static and analyzable. Fluxion does **not** execute arbitrary JavaScript and does not aim for full Manim updater compatibility. Expressions may reference declared tracker names, numeric literals, parentheses, arithmetic operators (`+`, `-`, `*`, `/`, `%`, `**`), constants (`pi`, `e`), and allowlisted math functions such as `sin`, `cos`, `tan`, `sqrt`, `abs`, `min`, `max`, and `pow`.

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

- `FadeIn(id)`: hidden opacity の `create`、semantic `effect=fadeIn`、`transform.opacity` animation を生成します。
- `FadeOut(id)`: semantic `effect=fadeOut`、`transform.opacity` animation、duration 終了時の `delete` を生成します。
- `Create(id)`: `create` と semantic `effect=create` を生成します。`surroundingRect` frame では `geometry.drawProgress` も animation し、外枠を描き出します。
- `Write(id)`: writable leaf を `geometry.writeProgress=0` で `create` し、semantic `effect=write` と、幅に応じた left-to-right reveal を生成して Manim の書き出し表示を近似します。
- `Transform(a, b)`: `a` を target として、`b` と異なる transform/style/geometry property ごとに `animate` operation を生成します。
- `TransformMatchingTex(a, b)`: `math` node の token child を同一 token 文字列で対応付け、対応 token は `Transform`、消える token は `FadeOut`、新規 token は `FadeIn` に展開します。
- `ReplacementTransform(from, to)`: `from` の `FadeOut` と `to` の `FadeIn` を同時に生成します。
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

制約: `expandTokens=true` がない `math` node、または token child を持たない node には使えません。現在の token child の位置は近似的な semantic anchor であり、複雑な TeX layout の厳密な glyph 位置合わせは renderer の責務として未対応です。

長期的に見た目を安定させたい場合は、renderer 側で glyph metrics（ascent / descent / baseline）を実測し、token child に baseline 補正を反映する実装を推奨します。最小差分の実装案（目安）:

1. `web/src/dsl/compiler.ts` の token 生成で baseline フィールドを追加（約 3〜6 行）
   - `latexToTokenNodes(...)` 内で `child.geometry.baselineOffset = 0` を初期化する。
2. `web/src/renderers/svgRenderer.ts` の math 描画で baseline 補正を適用（約 8〜15 行）
   - `createMathElement(...)` で `const baselineOffset = Number(node.geometry.baselineOffset ?? 0);` を読み、`foreignObject` の `y` を `-height/2 + baselineOffset` にする。
3. `web/src/renderers/svgRenderer.ts` に renderer 単位キャッシュ付き計測 helper を追加（約 25〜45 行）
   - 例: `private readonly baselineCache = new Map<string, number>();`
   - 例: `private getBaselineOffset(latex: string, renderer: MathRendererName, fontSize: number): number`
   - cache key は `renderer + "::" + fontSize + "::" + latex`。
4. `createMathElement(...)` から helper を呼ぶ 1 行を追加（約 1〜3 行）
   - `node.geometry.baselineOffset` が未指定の場合のみ `getBaselineOffset(...)` を使う。
5. fallback 方針
   - KaTeX/MathJax 未読込時・計測失敗時は `0` を返し、現行挙動を維持する。

この構成なら compiler 側の後方互換を保ちながら、`TransformMatchingTex` の token morph で起きる `r^2` / `R^2` の上下ズレを renderer 側で段階的に抑制できます。

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

- `x`, `y`, `scale`, `rotation`, `opacity` -> `transform.*`
- `fill`, `stroke`, `strokeWidth` -> `style.*`
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
set camera.x to -120
animate camera.scale from 1 to 1.6 duration=2s easing=easeInOut
animateFrame to -120,20 scale=1.6 duration=2s easing=easeInOut
```

`camera` は document-level の `camera: { x, y, scale, rotation }` を設定します。既定値は `x=0`, `y=0`, `scale=1`, `rotation=0` です。`set` / `animate` は `camera.x`, `camera.y`, `camera.scale`, `camera.rotation` を target にできます。

`cameraFrame` は camera frame cursor を設定する Manim 風 alias です。`animateFrame` は通常の camera timeline operation を出力しつつ、gallery example では frame movement を単一の高水準 command として記述できます。

Renderer は scene origin `(0,0)` を viewport center に移してから zoom / rotation / pan を適用します: `translate(centerX + camera.x, centerY + camera.y) rotate(camera.rotation) scale(camera.scale) translate(0, 0)`。`mode=target` / `mode=frame-fit` では最後の translate が target 座標を中心へ合わせます。合成順序は `Camera * ParentNode * ChildNode` です。つまり camera は scene 全体の pan / zoom / rotation、node transform は各 node の local transform として扱われます。
