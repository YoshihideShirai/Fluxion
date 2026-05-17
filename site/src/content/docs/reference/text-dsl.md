---
title: Text DSL
description: Fluxion Text DSL v0.2 の syntax reference。
---


Fluxion Text DSL v0.2 は、ブラウザ上で短い宣言的なアニメーション記述を `.fluxion.json` に変換するための最小仕様です。Python DSL とは別の入力フロントエンドですが、出力先は同じ Fluxion IR です。

v0.2 の目的は「図形や math/path/group を置き、表示タイミングを決め、単純なプロパティ animation と Manim 風 animation primitive を再生する」ことに絞ります。任意コード実行、条件分岐、ループ、外部 include は扱いません。


## Command quick reference

| Command | Purpose | Minimal example |
|---|---|---|
| `scene` | Canvas size and fps | `scene width=1280 height=720 fps=60` |
| `circle`, `rect`, `line`, `path` | Shape node declarations | `circle dot r=34 at 260,420 fill="#38bdf8"` |
| `text`, `math`, `group` | Labels, equations, and grouped nodes | `group intro title eq` |
| `at` | Start an indented block at a fixed time | `at 0s:` |
| `show`, `hide` | Create or delete a node on the timeline | `show dot` |
| `value` | Declare a scalar tracker | `value theta = 0` |
| `set` | Apply an immediate property value or dependent expression | `set dot.x to expr="320 + 100 * cos(theta)"` |
| `animate` | Interpolate one property or scalar tracker | `animate theta from 0 to 6.28 duration=2s` |
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
- color は文字列として扱います。v0.2 では CSS color validation はしません。

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
line axis x1=-50 y1=0 x2=50 y2=0 at 640,520 stroke="#e2e8f0" strokeWidth=2
path curve d="M 0 0 C 40 80 80 80 120 0" at 640,420 fill="none" stroke="#38bdf8"
text title "Fluxion" at 640,120 size=32 fill="#e2e8f0"
math equation "e^{i\\pi}+1=0" at 640,200 size=36 expandTokens=true
group intro title equation
```

Supported node types:

- `circle <id>`
- `rect <id>`
- `line <id>`
- `path <id> d="<svg-path-data>"`
- `text <id> "<text>"`
- `math <id> "<latex>"`
- `group <id> [child-id...]`

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

`at <time>:` は、indented statements の default start time を設定します。v0.2 では block 内で `show`, `hide`, `set`, `wait`, `play`, `animate` を使えます。

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
play Succession(<Primitive>(...), <Primitive>(...)) [duration=<time>] [easing=<name>]
```

`play` の call parser は nested call を理解するため、`AnimationGroup(FadeIn(a), FadeIn(b), lagRatio=0.2)` や `Succession(Create(a), Transform(a, b))` のように、並列/逐次 composition を 1 statement で表せます。

Options:

- `duration`: animation duration。省略時は `1`
- `easing`: easing name。省略時は `smooth`

Supported primitives:

- `FadeIn(id)`: hidden opacity の `create`、semantic `effect=fadeIn`、`transform.opacity` animation を生成します。
- `FadeOut(id)`: semantic `effect=fadeOut`、`transform.opacity` animation、duration 終了時の `delete` を生成します。
- `Create(id)`: `create` と semantic `effect=create` を生成します。
- `Write(id)`: `create` と semantic `effect=write` を生成します。
- `Transform(a, b)`: `a` を target として、`b` と異なる transform/style/geometry property ごとに `animate` operation を生成します。
- `TransformMatchingTex(a, b)`: `math` node の token child を同一 token 文字列で対応付け、対応 token は `Transform`、消える token は `FadeOut`、新規 token は `FadeIn` に展開します。
- `ReplacementTransform(from, to)`: `from` の `FadeOut` と `to` の `FadeIn` を同時に生成します。
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

### animate

```text
animate c1.x from 220 to 640 start=0s duration=1.5s easing=easeInOut
```

指定した property を `animate` operation に変換します。

Syntax:

```text
animate <id>.<property> from <value> to <value> [start=<time>] [duration=<time>] [easing=<name>]
animate <value-id> from <number> to <number> [start=<time>] [duration=<time>] [easing=<name>]
```

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

v0.2 の runtime は numeric interpolation を主対象にします。string value の animation は IR としては出力できますが、滑らかな補間は保証しません。
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

## Out Of Scope For v0.2

以下は v0.2 では仕様外です。

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
set camera.x to -120
animate camera.scale from 1 to 1.6 duration=2s easing=easeInOut
```

`camera` は document-level の `camera: { x, y, scale, rotation }` を設定します。既定値は `x=0`, `y=0`, `scale=1`, `rotation=0` です。`set` / `animate` は `camera.x`, `camera.y`, `camera.scale`, `camera.rotation` を target にできます。

Renderer は root `<g>` に `translate(camera.x, camera.y) rotate(camera.rotation) scale(camera.scale)` を適用してから node を描画します。合成順序は `Camera * ParentNode * ChildNode` です。つまり camera は scene 全体の pan / zoom / rotation、node transform は各 node の local transform として扱われます。
