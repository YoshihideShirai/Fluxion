---
title: 'Fluxion JSON / Scene Graph'
description: '`.fluxion.json` document と Scene Graph node の構造。'
---

Fluxion JSON は、Python DSL と Text DSL が共通で出力する editable animation IR です。Runtime は authoring code を実行せず、この JSON document の Scene Graph、value trackers、Timeline を読み込んで再生します。

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

- `version`: Fluxion document format version。
- `width`, `height`, `fps`: canvas と timeline の基本設定。
- `duration`: optional。省略時は Runtime が timeline の最大終了時刻から計算します。
- `camera`: scene-level transform。
- `nodes`: Scene Graph node の初期 data。
- `values`: scalar value tracker。
- `timeline`: 時間順に適用される operation list。

## Scene Graph node

```json
{
  "id": "c1",
  "type": "circle",
  "transform": { "x": 220, "y": 360, "scale": 1, "scaleX": 1, "scaleY": 1, "rotation": 0, "opacity": 1 },
  "style": { "fill": "#38bdf8", "fillOpacity": 0.8, "stroke": "#0f172a", "strokeOpacity": 1, "strokeWidth": 4 },
  "geometry": { "r": 48 },
  "children": []
}
```

Node は `id` で参照され、`transform`、`style`、`geometry`、`children` を持ちます。`scaleX` / `scaleY` は任意の非等方 scale multiplier で、省略時は `1` として扱われます。`group` node は children に他の node を含め、camera transform はすべての node の外側に合成されます。

## Supported node types

| type | Purpose |
|---|---|
| `group` | child node をまとめる container |
| `circle` | 円 |
| `rect` | 矩形 |
| `line` | 線分 |
| `path` | SVG path data |
| `text` | plain text |
| `math` | LaTeX / KaTeX 数式 |

## Timeline との関係

`nodes` は構造を表し、`timeline` は時間変化を表します。Text DSL の `show` や Python DSL の animation helper は `create`、`set`、`animate` などの operation を生成します。

Timeline operation の詳細は [Timeline](../timeline/) を参照してください。Runtime の seek / playback の詳細は [Web Runtime](../runtime/) を参照してください。
