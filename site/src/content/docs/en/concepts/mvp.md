---
title: MVP Scope
description: The DSL, IR, runtime, and compiler scope included in the Fluxion MVP.
---

This MVP generates `.fluxion.json` from a Manim-like Python DSL and plays it in a browser SVG Runtime. The next phase treats a Mermaid/PlantUML-like Text DSL as a primary entry point for generating and previewing the same `.fluxion.json` format on the web.

## Included pieces

- Python DSL: `Scene`, `Mobject`, `Circle`, `Rectangle`, `Line`, `Text`, `Math`, `Group`
- Timeline IR: `create`, `delete`, `set`, `animate`
- JSON export: `Scene.export_json()` and `export_scene()`
- Web Runtime: TypeScript `.fluxion.json` loader, scene graph, timeline player, SVG renderer, and diff patch helper
- Text DSL compiler: browser compiler that converts compact declarative text into `.fluxion.json`
- Browser editor: live compile, playback controls, scrubber, and generated JSON preview
- Schema: `schemas/fluxion.schema.json`
- Example: `examples/simple_circle.py` and generated `examples/simple_circle.fluxion.json`

## Text DSL v0.1

The Text DSL converts short animation descriptions into `.fluxion.json` in the browser without executing arbitrary Python code.

```text
scene width=1280 height=720 fps=60
text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
circle c1 r=40 at 220,360 fill="#38bdf8"

at 0s:
  show title
  show c1

animate c1.x from 220 to 640 duration=2s easing=smooth
```

The v0.1 surface includes:

- `scene width=1280 height=720 fps=60`
- `circle`, `rect`, `line`, `text`
- `at x,y`, `fill`, `stroke`, `strokeWidth`, `size` / `fontSize`, geometry options
- `x`, `y`, `scale`, `rotation`, `opacity`
- `animate id.property from A to B start=0s duration=1s easing=smooth`
- `at 0s:` blocks and `show id`

Nodes that are not explicitly shown are automatically added as `create` operations at `t=0` for easier previewing.

See the [Text DSL reference](../../reference/text-dsl/) for the frozen syntax.

## Web Runtime v0.1

The runtime reconstructs a Scene Graph from `.fluxion.json` `nodes` and `timeline` data and passes it to the SVG renderer. The v0.1 playback semantics are fixed as follows:

- Documents containing `create` operations start from an empty graph.
- Documents without `create` operations use `nodes` as the initial graph.
- Same-time operations are applied in `create` → `set` → `animate` → `delete` order.
- Animations with `duration <= 0` immediately apply their final value.
- Non-numeric animations switch to their `to` value at completion.

See the [Web Runtime reference](../../reference/runtime/) for details.
