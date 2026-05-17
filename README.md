# Fluxion

Fluxion is an MVP for generating editable animation IR instead of rendered video frames.
It provides a Manim-like Python DSL that exports `.vanim.json`, plus a browser SVG runtime that loads and plays the generated scene graph timeline.

## Quick start

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

Open `http://localhost:8000/web/` and press **Play**.

## Python example

```python
from fluxion import Circle, Scene


class Demo(Scene):
    def construct(self):
        c = Circle(id="c1", r=40).move_to(220, 360)
        self.add(c)
        self.play(c.animate.move_to(640, 360), run_time=2)
```

## Project layout

- `python/fluxion/`: Python DSL and JSON exporter
- `web/src/`: TypeScript SVG runtime, scene graph, timeline player, diff helper
- `schemas/vanim.schema.json`: MVP JSON schema
- `examples/`: runnable example scene and generated `.vanim.json`
- `tests/`: Python DSL tests
