# Fluxion

Fluxion is an MVP for generating editable animation IR instead of rendered video frames.
It provides a Manim-like Python DSL that exports `.vanim.json`, a browser Text DSL compiler, and an SVG runtime that loads and plays the generated scene graph timeline.

## Quick start

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

Open `http://localhost:8000/web/`, edit the Text DSL, press **Compile**, then press **Play**.

## Python example

```python
from fluxion import Circle, Scene


class Demo(Scene):
    def construct(self):
        c = Circle(id="c1", r=40).move_to(220, 360)
        self.add(c)
        self.play(c.animate.move_to(640, 360), run_time=2)
```

## Text DSL example

```text
scene width=1280 height=720 fps=60
text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
circle c1 r=48 at 220,360 fill="#38bdf8" stroke="#0f172a" strokeWidth=4

at 0s:
  show title
  show c1

animate c1.x from 220 to 640 duration=1.5s easing=easeInOut
```

Text DSL v0.1 supports `scene`, `circle`, `rect`, `line`, `text`, `show`, and `animate` statements. It compiles in the browser and never runs arbitrary Python code. See [Text DSL v0.1](docs/text-dsl.md) for the small frozen syntax.

## Project layout

- `python/fluxion/`: Python DSL and JSON exporter
- `web/src/`: TypeScript SVG runtime, scene graph, timeline player, diff helper
- `web/src/dsl/`: browser parser/compiler for text DSL input
- `schemas/vanim.schema.json`: MVP JSON schema
- `examples/`: runnable example scene and generated `.vanim.json`
- `tests/`: Python DSL tests
