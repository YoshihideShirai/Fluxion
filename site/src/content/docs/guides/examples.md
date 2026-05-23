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

Use it when you want to verify the Python DSL → Fluxion JSON → Web Runtime path.

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

移植比較は次の読み方で統一します。

- `fidelity: faithful`（忠実移植）: Manim の流れ・意図をできるだけ保持。
- `fidelity: visual_approximation`（視覚近似）: 見た目を優先し、内部実装や挙動の一部は近似。

| Python example / source | Gallery demo | Porting strategy | Fidelity | Notes |
| --- | --- | --- | --- | --- |
| `examples/simple_circle.py` | `site/src/content/gallery/simple-circle.md` | `faithful` | `faithful` | Browserごとの差は最小限。 |
| `examples/basic_concepts_square_to_circle.py` | `site/src/content/gallery/square-to-circle.md` | `faithful` | `faithful` | Transform内部の補間は近似を含む。 |
| `examples/animations_using_animate.py` | `site/src/content/gallery/animations-using-animate.md` | `faithful` | `faithful` | easing既定値差分の可能性あり。 |
| `examples/plotting_with_manim.py` | `site/src/content/gallery/plotting-sin-cos.md` | `visual_approximation` | `visual_approximation` | 軸スケールとサンプリングを簡略化。 |
| `examples/special_camera_settings.py` | `site/src/content/gallery/special-camera.md` | `visual_approximation` | `visual_approximation` | カメラモデルは現行実装で近似。 |
| Manim `MovingFrameBox` | `site/src/content/gallery/moving-frame-box.md` | `visual_approximation` | `visual_approximation` | `SurroundingRectangle` は `surroundingRect` で表現。MathTex parts は宣言 bounds による近似。 |

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
- `ported`: runnable in Fluxion DSL (差分メモは残る場合があります).
- `partial`: partially ported; known gaps are larger or unresolved.
- `blocker`: blocked by missing primitives/runtime capability.
