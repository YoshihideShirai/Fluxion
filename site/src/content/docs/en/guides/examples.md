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

| Python example / source | Gallery demo | Porting strategy | Fidelity | Notes |
| --- | --- | --- | --- |
| `examples/gallery/simple-circle.fluxion.txt` | `site/src/content/gallery/simple-circle.md` | `faithful` (忠実移植) | `faithful` | The quickstart `Circle().set_fill(PINK, opacity=0.5)` and `Create(circle)` are expanded at Manim frame scale; minor browser rendering differences may remain. |
| `examples/gallery/square-to-circle.fluxion.txt` | `site/src/content/gallery/square-to-circle.md` | `faithful` (忠実移植) | `faithful` | The quickstart `Square().rotate(PI / 4)` and `Circle().set_fill(PINK, opacity=0.5)` are expanded at Manim frame scale, preserving Create → Transform → FadeOut with interpolation caveats. |
| `examples/gallery/animations-using-animate.fluxion.txt` | `site/src/content/gallery/animations-using-animate.md` | `faithful` (忠実移植) | `faithful` | The official `MovingAround` `.animate.shift(LEFT)`, `.set_fill(ORANGE)`, `.scale(0.3)`, and `.rotate(0.4)` sequence is preserved at Manim frame scale. |
| `examples/gallery/plotting-sin-cos.fluxion.txt` | `site/src/content/gallery/plotting-sin-cos.md` | `faithful` | `faithful` | `Axes(..., x_length=10)` and the default `y_length=6` are expanded to 675x405px; `axes.plot(...)`, the `x=2π` vertical marker, and graph labels are represented by Text DSL helpers. |
| `examples/gallery/special-camera.fluxion.txt` | `site/src/content/gallery/special-camera.md` | `faithful` | `faithful` | Official Axes default lengths and Dot radius are expanded at Manim frame scale; MovingCameraScene's invisible frame updater is represented with `followCamera` plus restore camera operations for the same visible behavior. |
| Manim `MovingFrameBox` | `site/src/content/gallery/moving-frame-box.md` | `faithful` | `faithful` | `SurroundingRectangle` is represented by `surroundingRect`, and `ReplacementTransform(framebox1, framebox2)` morphs the frame before replacing it with the target. |

Interpretation rule: `fidelity=faithful` means behavior-oriented parity, while `fidelity=visual_approximation` means visual-first approximation with explicit known gaps.

Gallery `source_manim_url` values point to anchored pages in the stable Manim documentation. Gallery `source_example_path` values point to `examples/gallery/*.fluxion.txt`, and the gallery page body is kept in sync with that Text DSL source. Each gallery Text DSL source maps to exactly one gallery page. Python DSL / JSON export samples remain available as separate authoring examples.

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
- `ported`: runnable in Fluxion DSL (with possible known gaps).
- `partial`: partially ported; known gaps are larger or unresolved.
- `blocker`: blocked by missing primitives/runtime capability.
