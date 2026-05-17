# Fluxion Text DSL v0.2

Fluxion Text DSL v0.2 は、ブラウザ上で短い宣言的なアニメーション記述を `.fluxion.json` に変換するための最小仕様です。Python DSL とは別の入力フロントエンドですが、出力先は同じ Fluxion IR です。

v0.2 の目的は「図形や math/path/group を置き、表示タイミングを決め、単純なプロパティ animation と Manim 風 animation primitive を再生する」ことに絞ります。任意コード実行、条件分岐、ループ、外部 include は扱いません。

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
math equation "e^{i\\pi}+1=0" at 640,200 size=36
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
- `math`: `size` or `fontSize`, `renderer=katex|mathjax`
- `group`: child ids are copied into `children` and removed from top-level roots

Default values:

- transform: `x=0`, `y=0`, `scale=1`, `rotation=0`, `opacity=1`
- style: `fill="#ffffff"`, `stroke="none"`, `strokeWidth=0`
- circle: `r=40`
- rect: `w=100`, `h=80`
- line: `x1=0`, `y1=0`, `x2=100`, `y2=0`
- path: `d=""`
- text: `fontSize=32`
- math: `fontSize=36`, `renderer=katex`
- group: empty geometry and `children=[]`

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

### set

```text
set title.fill to "#38bdf8"
set c1.x to 320
```

指定した property を timeline に `set` operation として追加します。

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
play Transform(a, b) duration=1.5s easing=easeInOut
```

Manim 風の animation primitive を timeline operations に変換します。`play` は top-level と `at` block の両方で使えます。`play` は compiler state の current time から始まり、primitive の duration 分だけ current time を進めます。

Syntax:

```text
play <Primitive>(<args...>) [duration=<time>] [easing=<name>]
```

Options:

- `duration`: animation duration。省略時は `1`
- `easing`: easing name。省略時は `smooth`

Supported primitives:

- `FadeIn(id)`: hidden opacity の `create`、semantic `effect=fadeIn`、`transform.opacity` animation を生成します。
- `FadeOut(id)`: semantic `effect=fadeOut`、`transform.opacity` animation、duration 終了時の `delete` を生成します。
- `Create(id)`: `create` と semantic `effect=create` を生成します。
- `Write(id)`: `create` と semantic `effect=write` を生成します。
- `Transform(a, b)`: `a` を target として、`b` と異なる transform/style/geometry property ごとに `animate` operation を生成します。

### animate

```text
animate c1.x from 220 to 640 start=0s duration=1.5s easing=easeInOut
```

指定した property を `animate` operation に変換します。

Syntax:

```text
animate <id>.<property> from <value> to <value> [start=<time>] [duration=<time>] [easing=<name>]
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
