---
title: Python DSL
description: Authoring guide for generating Fluxion JSON from the Manim-like Python API.
---

The Python DSL is a Manim-like authoring frontend: write scenes with `Scene` and object APIs, then export `.fluxion.json` instead of video.

## Minimal example

```python
from fluxion import Circle, Scene


class Demo(Scene):
    def construct(self):
        c = Circle(id="c1", r=40).move_to(220, 360)
        self.add(c)
        self.play(c.animate.move_to(640, 360), run_time=2)
```

## Run it

From the repository root, run the example scene.

```bash
PYTHONPATH=python python examples/simple_circle.py
```

The generated `examples/simple_circle.fluxion.json` is Fluxion IR that can be loaded by the Web Runtime and Playground.

## Core concepts

- `Scene`: root object that stores nodes and timeline operations, then writes `.fluxion.json` with `export_json()`.
- `Mobject`: Scene Graph node with transform, style, geometry, and children.
- `Circle`, `Rectangle`, `Line`, `Path`, `Text`, `Math`, `ImageMobject`, `ThreeDAxes`, `ProjectedCircle`, `GaussianSurface`, `SphereSurface`, `Group`: node types renderable by the Runtime.
- `self.add()`: adds nodes to the scene and contributes to the initial graph / create operations.
- `self.play()`: turns `.animate` builders and animation helpers into Timeline operations.

`ImageMobject` mirrors Manim's `ImageMobject(np.uint8(...))` use case by exporting a 2D grayscale matrix as an `image` node with `geometry.data`.

```python
from fluxion import ImageMobject

image = ImageMobject(id="gradient", data=[[0, 128, 255], [0, 128, 255]], w=240, h=120)
```

`ThreeDAxes`, `ProjectedCircle`, `GaussianSurface`, and `SphereSurface` export the projected geometry used by the Manim gallery 3D ports. They are not native 3D runtime objects; they generate the same IR shape as the Text DSL `threeDAxes` / `projectedCircle` / `gaussianSurface` / `sphereSurface` helpers from Python. `ThreeDAxes` defaults to Manim's axis lengths: `x_length=10.5`, `y_length=10.5`, and `z_length=6.5`. With `phi=75, theta=30, ...`, they can export projected geometry sampled with Manim `ThreeDCamera`'s rotation-matrix order and perspective factor.

```python
from fluxion import GaussianSurface, ThreeDAxes

axes = ThreeDAxes(id="axes")
surface = GaussianSurface(id="gauss", resolution=24, sigma=0.4, mu=(0, 0), shade=True)
```

## Related pages

- Use [Examples](../examples/) for repository samples.
- Use [Fluxion JSON / Scene Graph](../../reference/ir/) to inspect the exported document shape.
- Use [Timeline](../../reference/timeline/) to understand operations produced by `self.play()`.
