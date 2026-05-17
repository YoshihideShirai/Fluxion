---
title: MVP Scope / Roadmap
description: The DSL, IR, runtime, and compiler scope included in the Fluxion MVP.
---

This page separates what is available in Fluxion today from future ideas that are not fixed as part of the current MVP.

The current MVP generates the same `.fluxion.json` from a Manim-like Python DSL and a browser-friendly Text DSL, then plays it in a browser SVG Runtime. Text DSL is already a primary playground entry point.

## Available today

- Python DSL: `Scene`, `Mobject`, `Circle`, `Rectangle`, `Line`, `Text`, `Math`, `Group`
- Timeline IR: `create`, `delete`, `set`, `animate`
- JSON export: `Scene.export_json()` and `export_scene()`
- Web Runtime: TypeScript `.fluxion.json` loader, scene graph, timeline player, SVG renderer, and diff patch helper
- Text DSL compiler: browser compiler that converts compact declarative text into `.fluxion.json`
- Browser editor: live compile, playback controls, scrubber, and generated JSON preview
- Schema: `schemas/fluxion.schema.json`
- Example: `examples/simple_circle.py` and generated `examples/simple_circle.fluxion.json`

## Text DSL

Text DSL converts short animation descriptions into `.fluxion.json` in the browser without executing arbitrary Python or JavaScript code. The pipeline is Text DSL parser → `.fluxion.json` → Web Runtime.

```text
scene width=1280 height=720 fps=60
camera at 0,0 scale=1

value phase = 0
text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
math equation "e^{i\\pi}+1=0" at 640,190 size=34 expandTokens=true
circle c1 r=48 at 220,360 fill="#38bdf8" stroke="#0f172a" strokeWidth=4
rect box w=96 h=96 at 640,360 fill="#f97316"
line axis x1=-120 y1=0 x2=120 y2=0 at 640,520 stroke="#e2e8f0" strokeWidth=2
path curve d="M 0 0 C 40 80 80 80 120 0" at 640,455 fill="none" stroke="#38bdf8"
group intro title equation

at 0s:
  show intro
  show c1
  set title.fill to "#38bdf8"

wait 0.25s
play FadeIn(axis) duration=0.5s
animate c1.x from 220 to 640 duration=1.5s easing=easeInOut
animate phase from 0 to 6.283 duration=1.5s
set c1.y to expr="360 + 40 * sin(phase)"
play Transform(c1, box) duration=1s easing=easeInOut
hide c1 at 3.5s
```

The current syntax includes:

- `scene width=1280 height=720 fps=60`
- `circle`, `rect`, `line`, `path`, `text`, `math`, `group`
- `camera` and `value` trackers
- `at x,y`, `fill`, `stroke`, `strokeWidth`, `size` / `fontSize`, and geometry options
- `x`, `y`, `scale`, `rotation`, `opacity`, camera properties, and style / geometry aliases
- `set id.property to value` and `set id.property to expr="..."`
- `show`, `hide`, and `wait`
- `animate id.property from A to B ...` and `animate valueId from A to B ...`
- `play FadeIn(...)`, `FadeOut(...)`, `Create(...)`, `Transform(...)`, `TransformMatchingTex(...)`, `AnimationGroup(...)`, and `Succession(...)`
- `show`, `hide`, `set`, `wait`, `play`, and `animate` inside `at 0s:` blocks

Nodes that are not explicitly shown are automatically added as `create` operations at `t=0` for easier previewing.

See the [Text DSL reference](../../reference/text-dsl/) for the detailed syntax, defaults, and current limitations.

## Web Runtime

The runtime reconstructs a Scene Graph from `.fluxion.json` `nodes` and `timeline` data and passes it to the SVG renderer. The current playback semantics are:

- Documents containing `create` operations start from an empty graph.
- Documents without `create` operations use `nodes` as the initial graph.
- Same-time operations are applied in `create` → `set` → `setExpr` → `animate` → `setValue` → `animateValue` → `delete` priority order.
- Same-time operations with the same operation type keep source array order.
- Animations with `duration <= 0` immediately apply their final value.
- Non-numeric animations switch to their `to` value at completion.
- Value trackers are initialized, `setValue` / `animateValue` operations are applied, and then `setExpr` operations are evaluated.

See the [Web Runtime reference](../../reference/runtime/) for details.

## Future ideas

The following are not part of the current MVP scope and remain future candidates:

- Text DSL `include`, `theme`, `component`, loops, conditionals, and nested blocks
- CSS color validation and stronger compiler-side schema validation
- Expanded Manim compatibility syntax
- Exact glyph alignment for complex TeX layout
- Richer editor diagnostics and code actions
- Python DSL / Text DSL conversion in either direction
- Fenced code block embedding
