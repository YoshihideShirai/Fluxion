---
title: Overview
description: The purpose of Fluxion and the entry point for the project site.
---

Fluxion is an MVP for generating editable animation IR instead of rendered video frames.
It provides a Manim-like Python DSL that exports `.fluxion.json`, a browser Text DSL compiler, and an SVG runtime that loads and plays the generated scene graph timeline.

<div class="hero-card">

**Core idea:** preserve the meaning of a Scene Graph and Timeline so animations can be played, inspected, and edited in the browser instead of being flattened into rendered video frames.

</div>

## What Fluxion includes

- **Python DSL**: `Scene`, `Mobject`, shape objects, and animation helpers.
- **Text DSL**: browser-safe declarative syntax for compact animations.
- **Fluxion IR**: `.fluxion.json` documents containing nodes and timeline operations.
- **Web Runtime**: TypeScript SVG renderer with playback, scrubbing, and deterministic timeline application.
- **Playground**: a GitHub Pages-hosted editor for compiling Text DSL and previewing generated JSON.

## Pipeline

```text
Python DSL / Text DSL
  → Scene Graph IR
  → Timeline / Animation IR
  → Diff Stream
  → Web Runtime
```

## Next steps

- Start with the [Getting Started guide](../guides/getting-started/).
- Try the browser [Playground](../../playground/).
- Read the [Text DSL reference](../reference/text-dsl/).
