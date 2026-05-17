# Fluxion MVP

この MVP は、Manim 風の Python DSL から `.vanim.json` を生成し、ブラウザ上の SVG Runtime で再生する最小実装です。次フェーズでは Mermaid / PlantUML のような Text DSL からも同じ `.vanim.json` を生成し、Web 上で変換・再生できる入口を主要な体験として扱います。

## 含まれるもの

- Python DSL: `Scene`, `Mobject`, `Circle`, `Rectangle`, `Line`, `Text`, `Math`, `Group`
- Timeline IR: `create`, `delete`, `set`, `animate`
- JSON export: `Scene.export_json()` と `export_scene()`
- Web Runtime: TypeScript `.vanim.json` loader, scene graph, timeline player, SVG renderer, diff patch helper
- Text DSL compiler: ブラウザ上で短い宣言的テキストを `.vanim.json` に変換
- Schema: `schemas/vanim.schema.json`
- Example: `examples/simple_circle.py` と生成済み `examples/simple_circle.vanim.json`

## Text DSL v0.1

Python DSL MVP の次段階として、短いテキスト記述をブラウザ内 compiler で `.vanim.json` に変換する入力方式を実装します。この方式では任意の Python コードを実行せず、Text DSL parser → `.vanim.json` → Web Runtime の順に処理します。

```text
scene width=1280 height=720 fps=60
text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
circle c1 r=40 at 220,360 fill="#38bdf8"

at 0s:
  show title
  show c1

animate c1.x from 220 to 640 duration=2s easing=smooth
```

v0.1 で扱う構文は以下です。

- `scene width=1280 height=720 fps=60`
- `circle`, `rect`, `line`, `text`
- `at x,y`, `fill`, `stroke`, `strokeWidth`, `size` / `fontSize`, geometry options
- `x`, `y`, `scale`, `rotation`, `opacity`
- `animate id.property from A to B start=0s duration=1s easing=smooth`
- `at 0s:` block と `show id`

明示的に `show` されていない node は、preview しやすいように `t=0` の `create` として自動追加します。

## 使い方

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

ブラウザで `http://localhost:8000/web/` を開くと、SVG プレビューを再生できます。
画面左の Text DSL を編集して **Compile** を押すと、同じページ上で `.vanim.json` に変換してプレビューを更新します。
