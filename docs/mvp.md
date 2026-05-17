# Fluxion MVP

この MVP は、Manim 風の Python DSL から `.vanim.json` を生成し、ブラウザ上の SVG Runtime で再生する最小実装です。将来的には Mermaid / PlantUML のような Text DSL からも同じ `.vanim.json` を生成し、Web 上で変換・再生できるようにします。

## 含まれるもの

- Python DSL: `Scene`, `Mobject`, `Circle`, `Rectangle`, `Line`, `Text`, `Math`, `Group`
- Timeline IR: `create`, `delete`, `set`, `animate`
- JSON export: `Scene.export_json()` と `export_scene()`
- Web Runtime: TypeScript `.vanim.json` loader, scene graph, timeline player, SVG renderer, diff patch helper
- Schema: `schemas/vanim.schema.json`
- Example: `examples/simple_circle.py` と生成済み `examples/simple_circle.vanim.json`

## Text DSL 案

Python DSL MVP の次段階として、短いテキスト記述をブラウザ内 compiler で `.vanim.json` に変換する入力方式を追加します。

```text
scene width=1280 height=720 fps=60
circle c1 r=40 at 220,360 fill="#38bdf8"
animate c1.x from 220 to 640 duration=2s easing=smooth
```

この方式では任意の Python コードを実行せず、Text DSL parser → AST → `.vanim.json` → Web Runtime の順に処理します。

## 使い方

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

ブラウザで `http://localhost:8000/web/` を開くと、SVG プレビューを再生できます。
