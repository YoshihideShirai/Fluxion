---
title: Text DSL
description: Syntax reference for Fluxion Text DSL v0.2.
---

Fluxion Text DSL v0.2 is a small declarative language that compiles browser-written animation descriptions into `.fluxion.json`. It is a separate frontend from the Python DSL, but both produce the same Fluxion IR.

The v0.2 scope is intentionally small: place shapes, math, paths, and groups; define visibility timing; and play simple property animations and Manim-like animation primitives. It does not support arbitrary code execution, conditionals, loops, or external includes.

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

## Lexical rules

- Write one statement per line.
- Blank lines are ignored.
- `#` starts a comment until the end of the line, except inside quoted strings.
- Quoted strings use `"`; escape a quote with `\"`.
- Tokens are separated by whitespace; whitespace inside quoted strings is preserved.
- Times accept `1`, `1.5`, `1s`, and `1.5s`; the unit is seconds.
- Colors are treated as strings. v0.2 does not validate CSS color syntax.

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

`id` values must be unique in a document.

Common options:

- `at x,y`: shortcut for `transform.x` and `transform.y`
- `x`, `y`
- `scale`
- `rotation`
- `opacity`
- `fill`, `stroke`, `strokeWidth`
- `size` / `fontSize`

### timeline blocks

```text
at 0s:
  show title
  show c1
  set c1.opacity 1
  hide oldLabel
```

A block applies statements at a shared time. `show` creates a declared node at that time. `hide` deletes it. `set` applies an immediate property value.

### animate

```text
animate c1.x from 220 to 640 duration=1.5s easing=easeInOut
animate title.opacity from 0 to 1 start=0s duration=1s
```

`animate` interpolates a target property. Numeric values interpolate; non-numeric values switch to `to` at completion.

### play and wait

```text
play FadeIn(title) duration=1s
wait 0.5s
play Transform(c1, c2) duration=1.5s easing=easeInOut
```

`play` provides Manim-like primitives. `wait` advances the current cursor time.

Supported primitives include:

- `FadeIn(id)`
- `FadeOut(id)`
- `Create(id)`
- `Uncreate(id)`
- `Transform(source, target)`

## Safety model

The Text DSL compiler runs in the browser and does not execute Python or arbitrary JavaScript from the input. It only parses the supported statements and emits Fluxion IR.
