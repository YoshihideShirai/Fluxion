---
title: Getting Started
description: The shortest path to generate, build, and preview Fluxion locally.
---

Getting Started is the second page in **Start Here**. It takes you from a Python DSL example to `.fluxion.json`, then previews that output in the Web Runtime / Playground.

## Use the hosted playground

To try Fluxion without installing anything, open the hosted GitHub Pages playground first. Until the repository owner is known, the expected URL format is `https://<owner>.github.io/Fluxion/playground/`.

The hosted playground lets you enter Text DSL, compile it in the browser, inspect playback / scrubbing, and read the generated JSON. Use it as the first path for understanding the DSL-to-IR flow before building the runtime or site locally.

## 1. Generate the example scene

From the repository root:

```bash
PYTHONPATH=python python examples/simple_circle.py
```

This writes `examples/simple_circle.fluxion.json` from the Python DSL example.

## 2. Build the browser runtime

```bash
cd web
npm ci
npm run build
```

## 3. Preview locally

Return to the repository root and run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/web/`, edit the Text DSL, and preview it with live compile, playback controls, scrubbing, and generated JSON output.

## 4. Continue through the docs

- Learn the UI in the [Playground tour](./playground/).
- Use [Python DSL](./python-dsl/) when authoring from Python.
- Use [Text DSL reference](../reference/text-dsl/) when authoring in the browser.
- Inspect runtime input in [Fluxion JSON / Scene Graph](../reference/ir/) and [Timeline](../reference/timeline/).

## Build the GitHub Pages site locally

The Astro site lives in `site/`. Build the runtime first so the playground can be copied into the site artifact.

```bash
cd web
npm run build
cd ../site
npm ci
npm run build
npm run preview
```

The site build copies `web/index.html`, `web/dist`, and the generated example JSON into `site/public/playground/` before producing `site/dist/`.
