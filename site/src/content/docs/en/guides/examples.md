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

## Browser example

The Playground includes a Text DSL editor. Paste snippets from [Text DSL reference](../../reference/text-dsl/) or [Playground tour](../playground/) and compile them directly in the browser.

## Suggested learning order

1. Run [Getting Started](../getting-started/) to generate and preview the sample IR.
2. Modify `examples/simple_circle.py` with the [Python DSL](../python-dsl/) concepts.
3. Recreate a similar animation in [Text DSL reference](../../reference/text-dsl/).
4. Compare both outputs with [Fluxion JSON / Scene Graph](../../reference/ir/) and [Timeline](../../reference/timeline/).
