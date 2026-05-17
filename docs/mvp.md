# Fluxion MVP

この MVP は、Manim 風の Python DSL から `.vanim.json` を生成し、ブラウザ上の SVG Runtime で再生する最小実装です。

## 含まれるもの

- Python DSL: `Scene`, `Mobject`, `Circle`, `Rectangle`, `Line`, `Text`, `Math`, `Group`
- Timeline IR: `create`, `delete`, `set`, `animate`
- JSON export: `Scene.export_json()` と `export_scene()`
- Web Runtime: TypeScript `.vanim.json` loader, scene graph, timeline player, SVG renderer, diff patch helper
- Schema: `schemas/vanim.schema.json`
- Example: `examples/simple_circle.py` と生成済み `examples/simple_circle.vanim.json`

## 使い方

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

ブラウザで `http://localhost:8000/web/` を開くと、SVG プレビューを再生できます。
