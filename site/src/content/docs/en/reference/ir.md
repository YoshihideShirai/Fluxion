---
title: 'Fluxion JSON / Scene Graph'
description: 'The structure of `.fluxion.json` documents and Scene Graph nodes.'
---

Fluxion JSON is the editable animation IR shared by the Python DSL and Text DSL. The Runtime does not execute authoring code; it loads the Scene Graph, value trackers, and Timeline from this JSON document.

## Document shape

```json
{
  "version": "0.1",
  "width": 1280,
  "height": 720,
  "fps": 60,
  "duration": 2,
  "camera": { "x": 0, "y": 0, "scale": 1, "rotation": 0 },
  "nodes": [],
  "values": [],
  "timeline": []
}
```

- `version`: Fluxion document format version.
- `width`, `height`, `fps`: canvas and timeline defaults.
- `duration`: optional. When omitted, the Runtime calculates it from the maximum timeline end time.
- `camera`: scene-level transform.
- `nodes`: initial Scene Graph node data.
- `values`: scalar value trackers.
- `timeline`: ordered operations applied over time.

## Scene Graph node

```json
{
  "id": "c1",
  "type": "circle",
  "transform": { "x": 220, "y": 360, "scale": 1, "rotation": 0, "opacity": 1 },
  "style": { "fill": "#38bdf8", "stroke": "#0f172a", "strokeWidth": 4 },
  "geometry": { "r": 48 },
  "children": []
}
```

Nodes are addressed by `id` and carry `transform`, `style`, `geometry`, and `children`. `group` nodes contain child nodes, and the camera transform composes outside every node transform.

## Supported node types

| type | Purpose |
|---|---|
| `group` | container for child nodes |
| `circle` | circle |
| `rect` | rectangle |
| `line` | line segment |
| `path` | SVG path data |
| `text` | plain text |
| `math` | LaTeX / KaTeX math |

## Relationship to Timeline

`nodes` describe structure; `timeline` describes change over time. Text DSL `show` statements and Python DSL animation helpers generate operations such as `create`, `set`, and `animate`.

See [Timeline](../timeline/) for operation details and [Web Runtime](../runtime/) for seek / playback behavior.
