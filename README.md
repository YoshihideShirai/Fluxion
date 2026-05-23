# Fluxion

> **Open the playground:** use the hosted GitHub Pages playground at `https://<owner>.github.io/Fluxion/playground/` once Pages is enabled for this repository.

Fluxion is an editable animation IR toolkit for authoring Manim-like scenes in Python or a browser-friendly Text DSL, then previewing them with a deterministic SVG runtime. Instead of treating rendered video frames as the source of truth, Fluxion keeps a `.fluxion.json` scene graph and timeline that can be inspected, edited, replayed, and shared. The current MVP is best for small diagrams, runtime experiments, and validating the IR pipeline from authoring tools to browser playback.

## Try it

### GitHub Pages / playground

- **Open the playground first:** `https://<owner>.github.io/Fluxion/playground/` is the expected GitHub Pages URL format until the repository owner is known.
- Use the playground to edit Text DSL in the browser, compile it to `.fluxion.json`, preview it with playback controls and scrubbing, and inspect the generated JSON.
- The Pages workflow builds `web/` first, then the Astro site copies `web/index.html`, `web/dist/`, and example JSON into `site/public/playground/` so they are published under `/playground/`.

### Local Python example and web runtime

Generate the example IR, build the browser runtime, and serve the repository root:

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

Then open `http://localhost:8000/web/` to edit Text DSL, compile it locally, load the generated Python example JSON, play/seek/reset the SVG preview, and inspect the emitted `.fluxion.json`.

## What you can do

- **Author with the Python DSL**: write Manim-like Python scenes using `python/fluxion/`, then export deterministic `.fluxion.json` IR for the runtime.
- **Author with Text DSL**: write compact browser-safe animation text for simple shapes, text, math, groups, camera settings, value trackers, timeline operations, and Manim-style animation primitives.
- **Preview in the browser playground**: compile Text DSL directly in the browser, render the resulting scene graph with the SVG runtime, scrub the timeline, and copy the generated JSON.
- **Use `.fluxion.json` as the shared IR**: both Python DSL and Text DSL compile to the same editable scene graph/timeline document, and the web runtime consumes that IR without running authoring code.

## Text DSL example

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

Text DSL currently supports scene metadata, simple shapes, paths, text/math nodes, groups, target-bounds rectangles, camera settings, value trackers, timeline operations, and Manim-style animation primitives through `scene`, `circle`, `rect`, `line`, `path`, `text`, `math`, `group`, `surroundingRect`, `camera`, `value`, `set`, `show`, `hide`, `wait`, `play`, and `animate` statements. It compiles in the browser and never runs arbitrary Python or JavaScript from the input; expressions are parsed as a small allowlisted arithmetic language. See the [canonical Text DSL reference](site/src/content/docs/reference/text-dsl.md) for the full syntax, defaults, current support boundaries, and future out-of-scope features.

## Python DSL example

```python
from fluxion import Circle, Scene


class Demo(Scene):
    def construct(self):
        c = Circle(id="c1", r=40).move_to(220, 360)
        self.add(c)
        self.play(c.animate.move_to(640, 360), run_time=2)
```

## Browser runtime

The browser runtime applies timeline operations deterministically, supports seek/play/stop/reset controls, and renders the generated scene graph with SVG. See the [canonical Web Runtime reference](site/src/content/docs/reference/runtime.md) for playback semantics, operation ordering, easing behavior, and value-tracker expression evaluation.

## Docs

Canonical documentation lives under [`site/src/content/docs/`](site/src/content/docs/) and is published by the GitHub Pages build. Root-level `docs/` is intentionally limited to a pointer README so there is only one documentation source of truth.

- **Overview**: start with [`site/src/content/docs/overview.md`](site/src/content/docs/overview.md) for the concept, pipeline, and high-level architecture.
- **Getting Started**: follow [`site/src/content/docs/guides/getting-started.md`](site/src/content/docs/guides/getting-started.md) for local Python, web runtime, and site-build workflows.
- **Architecture**: use [`site/src/content/docs/concepts/architecture.md`](site/src/content/docs/concepts/architecture.md) for the Scene Graph / Timeline IR architecture.
- **Roadmap / MVP Scope**: use [`site/src/content/docs/concepts/mvp.md`](site/src/content/docs/concepts/mvp.md) for current MVP boundaries and roadmap candidates.
- **Text DSL reference**: use [`site/src/content/docs/reference/text-dsl.md`](site/src/content/docs/reference/text-dsl.md) for the current syntax and examples.
- **Runtime**: use [`site/src/content/docs/reference/runtime.md`](site/src/content/docs/reference/runtime.md) for SVG playback and timeline semantics.

### Documentation languages

Fluxion maintains Japanese and English documentation at parity. Japanese (`site/src/content/docs/`, excluding `en/`) is the default locale for the published site, but English (`site/src/content/docs/en/`) is a first-class documentation set and should stay equivalent in page coverage and intent.

Current page coverage is intentionally mirrored between the two locales:

- `overview.md` / `en/overview.md`
- `guides/getting-started.md` / `en/guides/getting-started.md`
- `guides/playground.md` / `en/guides/playground.md`
- `guides/python-dsl.md` / `en/guides/python-dsl.md`
- `guides/examples.md` / `en/guides/examples.md`
- `reference/text-dsl.md` / `en/reference/text-dsl.md`
- `reference/runtime.md` / `en/reference/runtime.md`
- `reference/ir.md` / `en/reference/ir.md`
- `reference/timeline.md` / `en/reference/timeline.md`
- `concepts/architecture.md` / `en/concepts/architecture.md`
- `concepts/mvp.md` / `en/concepts/mvp.md`

When adding or materially changing a Japanese page, add or update the matching English page in the same change unless the PR explicitly documents a temporary exception. Keep Starlight sidebar labels in `site/astro.config.mjs` synchronized with each page's frontmatter `title` in both locales.

### Documentation update rule

When changing documentation, update the canonical file in `site/src/content/docs/` first. Do not add long-form mirrors under root `docs/`; use `docs/README.md` only to direct readers to the canonical GitHub Pages source.

### Documentation update checklist

Before merging documentation changes, verify the docs and publishing pipeline are still in sync:

- Confirm the README Quickstart / local setup commands still match the current `package.json` scripts in `web/` and `site/`.
- Confirm README links to GitHub Pages, canonical docs, playground pages, and examples still resolve.
- Confirm the Starlight sidebar entries in `site/astro.config.mjs` do not reference missing slugs in either `site/src/content/docs/` or `site/src/content/docs/en/`.
- Confirm the Text DSL supported-command list remains consistent between the compiler implementation and the canonical Text DSL references. Run `cd site && npm run check:text-dsl-reference` when updating Text DSL command examples or docs.
- Confirm `site/scripts/sync-playground.mjs` syncs playground assets before the site build. The site `build` script should run `sync:playground` before `astro build`, and the Pages workflow should build `web/` first so `web/dist/` exists.
- Confirm `.github/workflows/pages.yml` still matches the README's publishing description: the Node.js version is current for the project, dependencies are installed with `npm ci`, `web/` is built before the site, and the site build runs afterward.

## Project status

- **MVP**: the Python DSL, `.fluxion.json` schema, Text DSL compiler, SVG runtime, example scene, and tests are intended to demonstrate the end-to-end authoring-to-preview pipeline.
- **Experimental**: Text DSL math/path/group behavior, value trackers, expression-driven properties, Manim-style `play` primitives, and playground UX may change as the IR evolves.
- **Stable enough for examples**: deterministic runtime playback, timeline seeking, JSON inspection, and the simple Python example are expected to remain usable for demos and regression tests.
- **Not production-stable yet**: the IR is not a finalized interchange standard, compatibility guarantees are limited, and rendered output is SVG-focused rather than a full video renderer.

## Project layout

- `python/fluxion/`: Python DSL and JSON exporter
- `web/src/`: TypeScript SVG runtime, scene graph, timeline player, diff helper
- `web/src/dsl/`: browser parser/compiler for Text DSL input
- `schemas/fluxion.schema.json`: MVP JSON schema
- `examples/`: runnable example scene and generated `.fluxion.json`
- `tests/`: Python DSL tests
- `site/`: Astro + Starlight GitHub Pages site and bundled playground

## Checks

```bash
PYTHONPATH=python python3 -m unittest discover -s tests -p 'test_*.py'
cd web && npm test
```
