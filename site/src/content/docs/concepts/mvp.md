---
title: MVP Scope / Roadmap
description: Fluxion MVP に含まれる DSL、IR、Runtime、Text DSL compiler の範囲。
---

このページでは、Fluxion で現在使える MVP 機能と、将来構想としてまだ固定しない範囲を分けて整理します。

Fluxion の現在の MVP は、Manim 風 Python DSL とブラウザ向け Text DSL から同じ `.fluxion.json` を生成し、ブラウザ上の SVG Runtime で再生する最小実装です。Text DSL はすでに playground の主要な入力方式として利用できます。

## 現在使えるもの

- Python DSL: `Scene`, `Mobject`, `Circle`, `Rectangle`, `Line`, `Text`, `Math`, `Group`
- Timeline IR: `create`, `delete`, `set`, `animate`
- JSON export: `Scene.export_json()` と `export_scene()`
- Web Runtime: TypeScript `.fluxion.json` loader, scene graph, timeline player, SVG renderer, diff patch helper
- Text DSL compiler: ブラウザ上で短い宣言的テキストを `.fluxion.json` に変換
- Browser editor: live compile, playback controls, scrubber, generated JSON preview
- Schema: `schemas/fluxion.schema.json`
- Example: `examples/simple_circle.py` と生成済み `examples/simple_circle.fluxion.json`

## Text DSL

Text DSL は、短いテキスト記述をブラウザ内 compiler で `.fluxion.json` に変換する入力方式です。この方式では任意の Python / JavaScript コードを実行せず、Text DSL parser → `.fluxion.json` → Web Runtime の順に処理します。

```text
scene width=1280 height=720 fps=60
camera at 0,0 scale=1

value phase = 0
text title "Fluxion MVP" at 640,110 size=32 fill="#e2e8f0"
math equation "e^{i\\pi}+1=0" at 640,190 size=34 expandTokens=true
circle c1 r=48 at 220,360 fill="#38bdf8" stroke="#0f172a" strokeWidth=4
rect box w=96 h=96 at 640,360 fill="#f97316"
line axis x1=-120 y1=0 x2=120 y2=0 at 640,520 stroke="#e2e8f0" strokeWidth=2
path curve d="M 0 0 C 40 80 80 80 120 0" at 640,455 fill="none" stroke="#38bdf8"
group intro title equation

at 0s:
  show intro
  show c1
  set title.fill to "#38bdf8"

wait 0.25s
play FadeIn(axis) duration=0.5s
animate c1.x from 220 to 640 duration=1.5s easing=easeInOut
animate phase from 0 to 6.283 duration=1.5s
set c1.y to expr="360 + 40 * sin(phase)"
play Transform(c1, box) duration=1s easing=easeInOut
hide c1 at 3.5s
```

現在使える構文は以下です。

- `scene width=1280 height=720 fps=60`
- `circle`, `rect`, `line`, `path`, `text`, `math`, `group`
- `camera` と `value` tracker
- `at x,y`, `fill`, `stroke`, `strokeWidth`, `size` / `fontSize`, geometry options
- `x`, `y`, `scale`, `rotation`, `opacity`, camera properties, style / geometry aliases
- `set id.property to value` と `set id.property to expr="..."`
- `show`, `hide`, `wait`
- `animate id.property from A to B ...` と `animate valueId from A to B ...`
- `play FadeIn(...)`, `FadeOut(...)`, `Create(...)`, `Transform(...)`, `TransformMatchingTex(...)`, `AnimationGroup(...)`, `Succession(...)`
- `at 0s:` block 内の `show`, `hide`, `set`, `wait`, `play`, `animate`

明示的に `show` されていない node は、preview しやすいように `t=0` の `create` として自動追加します。

詳細な構文、既定値、現在の制約は [Text DSL reference](../../reference/text-dsl/) にまとめます。

## Web Runtime

Runtime は `.fluxion.json` の `nodes` と `timeline` から Scene Graph を再構築し、SVG Renderer へ渡します。現在使える再生 semantics は以下です。

- `create` operation を含む document は空の graph から再生を開始する
- `create` operation を含まない document は `nodes` を初期 graph として表示する
- 同時刻 operation は `create` → `set` → `setExpr` → `animate` → `setValue` → `animateValue` → `delete` の優先順で適用する
- 同じ時刻・同じ operation type の中では source array order を保持する
- `duration <= 0` の animation は即時に final value を適用する
- 非数値 animation は完了時に `to` value へ切り替える
- Value tracker を初期化し、`setValue` / `animateValue` を適用した上で `setExpr` を評価する

詳細は [Web Runtime](../../reference/runtime/) にまとめます。

## 将来構想

現在の MVP Scope には含めず、将来の候補として扱うものは以下です。

- Text DSL の `include`, `theme`, `component`, loop, conditional, nested block
- CSS color validation と compiler 内 schema validation の強化
- Manim 互換 syntax の拡張
- complex TeX layout の厳密な glyph 位置合わせ
- richer editor diagnostics と code action
- Python DSL と Text DSL の相互変換
- fenced code block embedding

## 使い方

```bash
PYTHONPATH=python python examples/simple_circle.py
cd web && npm run build
cd .. && python -m http.server 8000
```

ブラウザで `http://localhost:8000/web/` を開くと、SVG プレビューを再生できます。
画面左の Text DSL を編集すると Live compile で `.fluxion.json` に変換され、Preview, scrubber, generated JSON を同じページ上で確認できます。
