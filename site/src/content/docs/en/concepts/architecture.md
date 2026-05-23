---
title: Architecture
description: Fluxion's Scene Graph / Timeline IR architecture.
---

> **Goal:** Build a system that generates **Scene Graph / Timeline IR / Diff Stream** from a Manim-like Python DSL or Mermaid/PlantUML-like Text DSL, then plays, edits, and previews the result in a Web Runtime.

## 1. Concept

Traditional Manim renders frames from a Python DSL through Cairo/OpenGL and finally produces MP4 video.

```text
Python DSL
  → Cairo / OpenGL Renderer
  → Frames
  → MP4
```

Fluxion redefines that workflow. Instead of treating Manim-style code as a direct video renderer, Fluxion treats it as an authoring environment that generates semantic scene structure and time changes.

```text
Python DSL / Text DSL
  → Scene Graph IR
  → Timeline / Animation IR
  → Diff Stream
  → Web Renderer
```

The Python side and Text DSL compiler do not render pixels. They generate meaningful scene structure and time-based changes that a web renderer can play and inspect.

## 2. Goals

Fluxion aims to:

- Keep a Manim-like Python API.
- Add a Mermaid/PlantUML-like text input that can compile and preview in the browser.
- Convert `Scene`, `Mobject`, `Animation`, and `Transform` concepts into web-oriented IR.
- Output Scene Graph and Timeline data instead of video frames.
- Render on the web with SVG first, and potentially Canvas, WebGL, or WebGPU later.
- Enable fast preview through diff-based updates.
- Keep the output friendly to interactive editing, AI-assisted editing, and Git review.

Initial non-goals include full Manim compatibility, Cairo/OpenGL rendering, advanced formula morphing, complex path topology morphing, and full MP4 replacement.

## 3. System overview

```text
┌─────────────────────────────┐   ┌─────────────────────────────┐
│ Manim-like Python DSL        │   │ Text DSL                     │
│ - Scene                      │   │ - Mermaid-like syntax        │
│ - Mobject                    │   │ - PlantUML-like blocks       │
│ - Animation                  │   │ - Browser compiler           │
│ - Transform                  │   │ - Live preview               │
└──────────────┬──────────────┘   └──────────────┬──────────────┘
               └──────────────┬──────────────────┘
                              ↓
┌─────────────────────────────┐
│ Scene Graph IR               │
│ - Node                       │
│ - Transform                  │
│ - Style                      │
│ - Geometry                   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Timeline / Animation IR      │
│ - create / set / animate     │
│ - easing                     │
│ - duration                   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Web Runtime                  │
│ - Player                     │
│ - SVG Renderer               │
│ - seek / play / scrub        │
└─────────────────────────────┘
```

## 4. Scene Graph IR

The Scene Graph stores visible objects as nodes. Each node has an `id`, `type`, `transform`, `style`, geometry data, and optional children for groups.

Example node:

```json
{
  "id": "c1",
  "type": "circle",
  "transform": { "x": 220, "y": 360, "scale": 1, "rotation": 0 },
  "style": { "fill": "#38bdf8", "stroke": "#0f172a", "strokeWidth": 4 },
  "geometry": { "r": 48 }
}
```

This representation is easier to diff, inspect, and edit than rendered frames.

## 5. Timeline IR

Timeline operations describe changes over time. The MVP supports:

- `create`: add a node to the graph
- `delete`: remove a node from the graph
- `set`: apply an immediate property value
- `animate`: interpolate a property over a duration

Example operation:

```json
{
  "t": 0,
  "op": "animate",
  "target": "c1",
  "property": "transform.x",
  "from": 220,
  "to": 640,
  "duration": 1.5,
  "easing": "easeInOut"
}
```

## 6. Runtime semantics

The browser runtime rebuilds graph state on seek and applies operations deterministically. Same-time operations are ordered as `create`, `set`, `animate`, then `delete`. Numeric values interpolate with easing; non-numeric values switch to the final value at completion.

## 7. Why this shape matters

Fluxion keeps animation output semantic. This makes it possible to:

- inspect an animation as structured JSON,
- edit individual objects after generation,
- preview changes quickly in the browser,
- review changes in Git,
- and eventually let AI tools modify timelines without re-rendering video frames.

## Scene-level camera

`FluxionDocument` includes a root camera state: `camera: { x, y, scale, rotation }`. The default `{ x: 0, y: 0, scale: 1, rotation: 0 }` maps scene origin `(0,0)` to the viewport center. Timeline operations address the camera with `id: "camera"` and paths such as `camera.x` or `camera.scale`.

The SVG renderer creates a root `<g>` for all scene nodes and applies camera before node transforms:

```text
Screen = Camera * ParentNode * ChildNode * Geometry
Camera = translate(centerX + camera.x, centerY + camera.y) rotate(camera.rotation) scale(camera.scale) translate(-focusX, -focusY)
Node   = translate(node.x, node.y) rotate(node.rotation) scale(node.scale)
```

For `mode=center`, `focusX=0` and `focusY=0`; target modes use the target coordinate as focus. This makes camera pan scene-level while zoom / rotation pivot around the scene origin at the viewport center, and each node's transform remains local and composes under the camera.
