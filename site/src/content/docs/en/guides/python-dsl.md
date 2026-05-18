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
- `Circle`, `Rectangle`, `Line`, `Path`, `Text`, `Math`, `Group`: node types renderable by the Runtime.
- `self.add()`: adds nodes to the scene and contributes to the initial graph / create operations.
- `self.play()`: turns `.animate` builders and animation helpers into Timeline operations.

## Related pages

- Use [Examples](../examples/) for repository samples.
- Use [Fluxion JSON / Scene Graph](../../reference/ir/) to inspect the exported document shape.
- Use [Timeline](../../reference/timeline/) to understand operations produced by `self.play()`.
