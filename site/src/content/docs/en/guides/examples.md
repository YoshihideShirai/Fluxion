---
title: Examples
description: Repository examples and recommended paths for trying Fluxion authoring flows.
---

Examples connect the authoring docs to concrete files in the repository.

## Python example

`examples/simple_circle.py` builds a small scene with Python DSL and exports `examples/simple_circle.fluxion.json`.

```bash
PYTHONPATH=python python examples/simple_circle.py
```

Use it to verify the Python DSL → Fluxion JSON → Web Runtime path.

## Basic Concepts demo (Square to Circle)

`examples/basic_concepts_square_to_circle.py` reproduces the Manim Basic Concepts style flow (`Create` → `Transform` → `FadeOut`) and exports `examples/basic_concepts_square_to_circle.fluxion.json`.

```bash
PYTHONPATH=python python examples/basic_concepts_square_to_circle.py
```

## Animations demo (Using `.animate`)

`examples/animations_using_animate.py` reproduces the Manim Animations-style `MovingAround` flow (shift → fill change → scale → rotate) and exports `examples/animations_using_animate.fluxion.json`.

```bash
PYTHONPATH=python python examples/animations_using_animate.py
```

## Plotting demo (Sin/Cos)

`examples/plotting_with_manim.py` reproduces the Manim Plotting-style flow by drawing axes and function curves (`sin(x)`, `cos(x)`) and exports `examples/plotting_with_manim.fluxion.json`.

```bash
PYTHONPATH=python python examples/plotting_with_manim.py
```

## Special Camera Settings demo

`examples/special_camera_settings.py` reproduces the Manim Special Camera Settings style flow by animating camera position/scale changes around scene content and exports `examples/special_camera_settings.fluxion.json`.

```bash
PYTHONPATH=python python examples/special_camera_settings.py
```


## Python example ↔ Text DSL gallery mapping

Use this table as the canonical mapping for migration tracking and regression checks when upstream Manim examples change.

| Python example / source | Gallery demo | Porting strategy | Notes |
| --- | --- | --- | --- |
| `examples/simple_circle.py` | `site/src/content/gallery/simple-circle.md` | `faithful` (忠実移植) | Core flow is fully matched. |
| `examples/basic_concepts_square_to_circle.py` | `site/src/content/gallery/square-to-circle.md` | `faithful` (忠実移植) | Create → Transform → FadeOut is preserved. |
| `examples/animations_using_animate.py` | `site/src/content/gallery/animations-using-animate.md` | `faithful` (忠実移植) | `.animate` sequence is preserved. |
| `examples/plotting_with_manim.py` | `site/src/content/gallery/plotting-sin-cos.md` | `visual_approximation` (視覚近似) | Curves/axes are approximated for web runtime parity. |
| `examples/special_camera_settings.py` | `site/src/content/gallery/special-camera.md` | `visual_approximation` (視覚近似) | Camera behavior is approximated to current camera model. |

For gallery entries that are not yet backed by a runnable Python example, `source_example_path` points to the planned/placeholder path under `examples/gallery/` so impact can still be tracked systematically.

## Browser example

The Playground includes a Text DSL editor. Paste snippets from [Text DSL reference](../../reference/text-dsl/) or [Playground tour](../playground/) and compile them directly in the browser.

## Suggested learning order

1. Run [Getting Started](../getting-started/) to generate and preview the sample IR.
2. Modify `examples/simple_circle.py` with the [Python DSL](../python-dsl/) concepts.
3. Recreate a similar animation in [Text DSL reference](../../reference/text-dsl/).
4. Compare both outputs with [Fluxion JSON / Scene Graph](../../reference/ir/) and [Timeline](../../reference/timeline/).

## Manim coverage matrix（移植率）

See the live matrix in [Gallery](/gallery/) (English page: [/en/gallery/](/en/gallery/)).

Status meanings:
- `ported`: fully runnable in Fluxion DSL.
- `partial`: partially ported; some instructions are missing.
- `blocker`: blocked by missing primitives/runtime capability.
