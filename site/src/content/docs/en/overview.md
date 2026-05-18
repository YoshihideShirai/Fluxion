---
title: Overview
description: The purpose of Fluxion and how to follow Start Here, Authoring, Runtime & IR, and Design Notes.
---

Fluxion is an MVP for generating editable animation IR instead of rendered video frames.
The Manim-like Python DSL and browser-friendly Text DSL both compile to `.fluxion.json`, and the Web Runtime plays the resulting Scene Graph and Timeline as SVG.

<div class="hero-card">

**Core idea:** preserve the meaning of a Scene Graph and Timeline so animations can be played, inspected, and edited in the browser instead of being flattened into rendered video frames.

</div>

## Documentation map

Fluxion docs are organized around the same four paths shown in the sidebar.

1. **Start Here**: project overview, the shortest local setup path, and the Playground workflow.
2. **Authoring**: Python DSL, Text DSL, and examples that generate `.fluxion.json`.
3. **Runtime & IR**: Fluxion JSON / Scene Graph, Timeline operations, and Web Runtime playback semantics.
4. **Design Notes**: Architecture and Roadmap / MVP Scope.

## What Fluxion includes

- **Python DSL**: `Scene`, `Mobject`, shape objects, and animation helpers.
- **Text DSL**: browser-safe declarative syntax for compact animations.
- **Fluxion JSON / Scene Graph**: `.fluxion.json` documents containing nodes, camera state, value trackers, and timeline operations.
- **Web Runtime**: TypeScript SVG renderer with playback, scrubbing, and deterministic timeline application.
- **Playground**: a GitHub Pages-hosted editor for compiling Text DSL and previewing generated JSON.

## Pipeline

```text
Python DSL / Text DSL
  → Fluxion JSON / Scene Graph
  → Timeline / Animation IR
  → Web Runtime
  → SVG preview
```

## Next steps

- Start with the [Getting Started](../guides/getting-started/) guide.
- Use the [Playground tour](../guides/playground/) to learn the browser editor.
- Begin authoring with either [Python DSL](../guides/python-dsl/) or [Text DSL reference](../reference/text-dsl/).
- Inspect the IR shape in [Fluxion JSON / Scene Graph](../reference/ir/) and [Timeline](../reference/timeline/).

## Documentation source of truth

Canonical documentation lives under `site/src/content/docs/` and is published by the GitHub Pages build. The root `docs/` directory is intentionally limited to a pointer README; do not maintain duplicate long-form docs there.
