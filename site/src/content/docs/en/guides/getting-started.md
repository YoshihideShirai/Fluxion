---
title: Getting Started
description: The shortest path to generate, build, and preview Fluxion locally.
---

## Generate the example scene

```bash
PYTHONPATH=python python examples/simple_circle.py
```

This writes `examples/simple_circle.fluxion.json` from the Python DSL example.

## Build the browser runtime

```bash
cd web
npm ci
npm run build
```

## Preview locally

From the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/web/`, edit the Text DSL, and preview it with live compile, playback controls, scrubbing, and generated JSON output.

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
