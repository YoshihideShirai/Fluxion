---
title: Architecture
description: Fluxion の Scene Graph / Timeline IR アーキテクチャ。
---


> **目的**: Manim 風の Python DSL や Mermaid / PlantUML 風のテキスト DSL から、動画フレームではなく **Scene Graph / Timeline IR / Diff Stream** を生成し、Web Runtime で再生・編集・プレビューできる仕組みを作る。

---

## 1. コンセプト

従来の Manim は、Python DSL から Cairo / OpenGL でフレームを描画し、最終的に MP4 を生成する。

```text
Python DSL
  → Cairo / OpenGL Renderer
  → Frames
  → MP4
```

本プロジェクトでは、Manim を「Python で動画をレンダリングするツール」ではなく、**Scene Graph の時間変化を生成するオーサリング環境**として再定義する。

```text
Python DSL / Text DSL
  → Scene Graph IR
  → Timeline / Animation IR
  → Diff Stream
  → Web Renderer
```

Python 側や Text DSL Compiler は描画を担当せず、**意味を持つシーン構造と時間変化**を生成する。

---

## 2. ゴール

### 2.1 実現したいこと

- Manim 風 Python API を維持する
- Mermaid / PlantUML のように、短いテキスト記述から Web 上で変換・再生できる入力方式を追加する
- `Scene`, `Mobject`, `Animation`, `Transform` を Web 向け IR に変換する
- 動画フレームではなく、Scene Graph と Timeline を出力する
- Web 側で Canvas / SVG / WebGL / WebGPU による描画を行う
- 差分更新による高速プレビューを可能にする
- 将来的にインタラクティブ編集、AI 編集、Git 管理しやすい形式にする

### 2.2 非ゴール

初期段階では以下は目指さない。

- Manim 完全互換
- Cairo / OpenGL レンダリング
- 高度な数式 morph
- 複雑な path topology morph
- MP4 レンダリングの完全代替

---

## 3. 全体アーキテクチャ

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
│ - Children                   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Timeline / Animation IR      │
│ - create                     │
│ - delete                     │
│ - set                        │
│ - animate                    │
│ - group                      │
│ - ungroup                    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Diff Stream                  │
│ - seq                        │
│ - ops                        │
│ - patch updates              │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Web Runtime                  │
│ - Canvas / SVG / WebGL       │
│ - interpolation              │
│ - playback                   │
│ - hit testing                │
│ - interaction                │
└─────────────────────────────┘
```

Python DSL と Text DSL は競合するものではなく、同じ Scene Graph IR / Timeline IR にコンパイルされる複数の入力フロントエンドとして扱う。

---

## 4. Scene Graph IR

### 4.1 基本構造

Scene Graph は `Scene` を root とし、その下に `Node` を持つ木構造で表現する。

```text
Scene
 └─ Node
     ├─ id
     ├─ type
     ├─ transform
     ├─ style
     ├─ geometry
     └─ children
```

### 4.2 Node 例

```json
{
  "id": "circle1",
  "type": "circle",
  "transform": {
    "x": 100,
    "y": 80,
    "scale": 1,
    "rotation": 0,
    "opacity": 1
  },
  "style": {
    "fill": "#ffcc00",
    "stroke": "#333333",
    "strokeWidth": 2
  },
  "geometry": {
    "r": 40
  },
  "children": []
}
```

### 4.3 Node 種別

現在の MVP では以下をサポートする。

| type | 用途 |
|---|---|
| `group` | 複数 Node のグループ |
| `circle` | 円 |
| `rect` | 矩形 |
| `line` | 線分 |
| `path` | SVG path 相当 |
| `text` | 通常テキスト |
| `math` | LaTeX / KaTeX 数式 |

---

## 5. Manim 概念との対応

| Manim | Scene Graph 版 |
|---|---|
| `Mobject` | `Node` |
| `VMobject` | `PathNode` |
| `VGroup` | `GroupNode` |
| `Tex` / `MathTex` | `TextNode` / `MathNode` |
| `Scene` | Scene Graph Root |
| `Animation` | Timeline Operation |
| `Transform` | Interpolation Operation |
| `self.add()` | `create` / graph insert |
| `self.remove()` | `delete` |
| `self.play()` | timeline operation generation |
| `.animate` | property animation builder |

---

## 6. Authoring DSL

### 6.1 Python DSL

既存 Manim ユーザーが大きな違和感なく使える API を目指す。

```python
class Demo(Scene):
    def construct(self):
        c = Circle(id="c1", r=40)
        self.add(c)

        self.play(
            c.animate.move_to(300, 100),
            run_time=2
        )
```

このコードは MP4 をレンダリングせず、以下を生成する。

- Scene Graph
- Timeline IR
- 必要に応じた Diff Stream

### 6.2 Text DSL

Mermaid や PlantUML のように、ブラウザ上で短いテキストを編集し、その場で `.fluxion.json` に変換して再生できる入力方式も提供する。

```text
scene width=1280 height=720 fps=60

circle c1 r=40 at 220,360 fill="#38bdf8"
text title "Fluxion" at 640,120 size=48 fill="#e2e8f0"

at 0s:
  show c1
  show title

animate c1.x from 220 to 640 duration=2s easing=smooth
animate c1.opacity from 1 to 0.35 start=2s duration=1s
```

この DSL は以下のように処理する。

```text
Text DSL
  → Parser
  → AST
  → Scene Graph IR / Timeline IR
  → .fluxion.json
  → Web Runtime
```

Python DSL と違い、Text DSL は以下の用途に向く。

- Web 上でのライブ編集
- 教材・ドキュメントへの埋め込み
- Git diff しやすい短い宣言的記述
- AI が直接生成・編集しやすいソース形式
- Mermaid / PlantUML と同じような「貼り付けて再生」ワークフロー

### 6.3 Text DSL の設計方針

Text DSL は Python DSL の完全な置き換えではなく、宣言的に書きやすい範囲へ絞る。

| 項目 | 方針 |
|---|---|
| 入力形式 | `.fluxion` または fenced code block |
| 実行場所 | ブラウザ内 compiler を優先 |
| 出力 | `.fluxion.json` と同じ IR |
| 構文 | shape 定義、style、timeline、animate を中心にする |
| 拡張 | `include`, `theme`, `component` は後段で検討 |
| 安全性 | 任意コード実行を避けるため Python 実行は不要 |

### 6.4 Web 変換・再生フロー

Web Runtime には Text DSL の変換レイヤーを追加する。

```text
Editor textarea / Markdown fenced block
  → Text DSL Compiler
  → validation
  → .fluxion.json
  → SVG / Canvas / WebGL Runtime
  → playback
```

構文エラーは `.fluxion.json` の生成前に検出し、行番号・列番号・期待される token を返す。生成後は既存の JSON schema で検証する。

### 6.5 Python DSL との関係

複雑な生成ロジック、ループ、外部データ読み込み、プログラム的な配置は Python DSL が担当する。短い説明アニメーション、図解、教材、ドキュメント埋め込みは Text DSL が担当する。

必要であれば、将来的に Python DSL から Text DSL を出力する、または Text DSL から Python DSL の雛形を生成する相互変換も検討できる。現在の MVP では、Python DSL と Text DSL の両方が同じ IR を出力するところまでを対象にする。

---

## 7. Timeline IR

### 7.1 基本方針

動画全体をフレーム列ではなく、**時間付きイベント列**として表す。

```json
[
  {
    "t": 0.0,
    "op": "create",
    "id": "circle1",
    "type": "circle"
  },
  {
    "t": 0.0,
    "op": "set",
    "id": "circle1",
    "path": "transform.x",
    "value": 0
  },
  {
    "t": 1.0,
    "op": "animate",
    "id": "circle1",
    "path": "transform.x",
    "from": 0,
    "to": 200,
    "duration": 2.0,
    "easing": "smooth"
  }
]
```

### 7.2 最小 Operation

MVP では以下だけを必須とする。

| op | 説明 |
|---|---|
| `create` | Node を作成 |
| `delete` | Node を削除 |
| `set` | Node の property を即時変更 |
| `animate` | property を時間補間 |

`group` / `ungroup` は後段で検討する。MVP の schema と runtime は `create`, `delete`, `set`, `animate` を扱う。

---

## 8. Diff Stream

### 8.1 目的

リアルタイムプレビューでは Scene Graph 全体を毎回送らず、変更分だけを送る。

```json
{
  "seq": 42,
  "ops": [
    {
      "op": "set",
      "id": "circle1",
      "path": "transform.x",
      "value": 120
    }
  ]
}
```

### 8.2 用途

- ホットリロード
- 即時プレビュー
- WebSocket による同期
- エディタ連携
- AI 編集後の差分適用
- 将来的な共同編集

---

## 9. Web Runtime

### 9.1 役割

Python 側や Text DSL Compiler は描画しない。Web Runtime が描画と再生を担当する。

```text
Python
  - DSL
  - Scene Graph 生成
  - Timeline 生成
  - Diff 生成

Text DSL Compiler
  - parse
  - AST 生成
  - Scene Graph 生成
  - Timeline 生成

Web Runtime
  - Text DSL editor / preview
  - Canvas / SVG / WebGL / WebGPU 描画
  - Timeline 再生
  - easing 補間
  - transform 解決
  - hit test
  - interaction
```

### 9.2 初期レンダリング方式

MVP では実装容易性を優先し、以下の順で検討する。

1. SVG
2. Canvas 2D
3. WebGL
4. WebGPU

初期は SVG が適している。

理由:

- Scene Graph との相性が良い
- DOM inspection がしやすい
- テキスト / 数式との統合が簡単
- デバッグしやすい

### 9.3 MVP Runtime Semantics

MVP Runtime は seek ごとに Scene Graph を再構築し、指定時刻までの Timeline IR を適用する。

- `create` operation を含む document は空の graph から開始する
- `create` operation を含まない document は `nodes` を初期 graph として扱う
- 同じ時刻の operation は `create` → `set` → `animate` → `delete` の順に適用する
- `duration <= 0` の animation は即時に final value を適用する
- 非数値 value は補間せず、完了時に `to` value へ切り替える

ブラウザ editor は Text DSL を live compile し、Preview, Play / Stop / Reset, scrubber, generated JSON preview を提供する。

---

## 10. 数式設計

### 10.1 候補

| 方式 | メリット | デメリット |
|---|---|---|
| MathTex → SVG path | 見た目が安定 | morph や編集が難しい |
| MathTex → MathML | 意味を保持しやすい | 表示互換性に注意 |
| MathTex → KaTeX HTML/SVG | Web プレビューが速い | Manim 完全互換ではない |

### 10.2 初期方針

MVP では KaTeX を推奨する。

```json
{
  "id": "eq1",
  "type": "math",
  "latex": "e^{i\\pi}+1=0",
  "renderer": "katex",
  "transform": {
    "x": 100,
    "y": 100,
    "scale": 1,
    "rotation": 0,
    "opacity": 1
  }
}
```

---

## 11. Transform 設計

### 11.1 基本方針

Manim の `Transform(a, b)` は、Scene Graph 版では「Node A から Node B への意味的・幾何的補間」として扱う。

```python
circle = Circle(id="shape")
square = Square()

self.play(Transform(circle, square))
```

IR 例:

```json
[
  {
    "op": "create",
    "id": "shape",
    "type": "circle",
    "geometry": {
      "r": 40
    }
  },
  {
    "op": "animate",
    "id": "shape",
    "path": "geometry",
    "from": {
      "type": "circle",
      "r": 40
    },
    "to": {
      "type": "rect",
      "w": 80,
      "h": 80
    },
    "duration": 1.0,
    "easing": "smooth"
  }
]
```

### 11.2 段階的対応

| Phase | 対応内容 |
|---|---|
| Phase 1 | translate, scale, rotate, opacity |
| Phase 2 | basic geometry morph |
| Phase 3 | SVG path morph |
| Phase 4 | text / math morph |
| Phase 5 | topology-aware morph |

初期 MVP では Phase 1 までで十分。

---

## 12. ファイルフォーマット

### 12.1 拡張子案

```text
.fluxion.json
```

### 12.2 MVP 出力例

```json
{
  "version": "0.1",
  "width": 1280,
  "height": 720,
  "fps": 60,
  "nodes": [
    {
      "id": "c1",
      "type": "circle",
      "transform": {
        "x": 0,
        "y": 0,
        "scale": 1,
        "rotation": 0,
        "opacity": 1
      },
      "style": {
        "fill": "#ffffff",
        "stroke": "#000000",
        "strokeWidth": 2
      },
      "geometry": {
        "r": 40
      },
      "children": []
    }
  ],
  "timeline": [
    {
      "t": 0.0,
      "op": "animate",
      "id": "c1",
      "path": "transform",
      "from": {
        "x": 0,
        "y": 0
      },
      "to": {
        "x": 300,
        "y": 100
      },
      "duration": 2.0,
      "easing": "easeInOut"
    }
  ]
}
```

---

## 13. MVP スコープ

### 13.1 Python 側

MVP で実装するもの:

- `Scene`
- `Node`
- `Mobject`
- `Circle`
- `Rectangle`
- `Line`
- `Text`
- `Math`
- `Group`
- `Animation`
- `.animate`
- `Scene.add()`
- `Scene.remove()`
- `Scene.play()`
- JSON export

### 13.2 Web 側

MVP で実装するもの:

- `.fluxion.json` loader
- SVG renderer
- timeline player
- `create`
- `delete`
- `set`
- `animate`
- transform interpolation
- opacity interpolation
- basic easing

### 13.3 Text DSL 側

現在使えるもの:

- Text DSL parser
- AST to `.fluxion.json` compiler
- browser editor
- line / column error reporting

将来構想として扱うもの:

- JSON schema validation の compiler 内統合強化
- fenced code block embedding

---

## 14. 推奨ディレクトリ構成

初期構成案は以下。

```text
fluxion/
  python/
    fluxion/
      __init__.py
      scene.py
      node.py
      mobject.py
      animation.py
      timeline.py
      export.py
      primitives/
        circle.py
        rectangle.py
        line.py
        text.py
        math.py

  web/
    package.json
    src/
      index.ts
      runtime/
        sceneGraph.ts
        timeline.ts
        diff.ts
        player.ts
      renderers/
        svgRenderer.ts
      dsl/
        parser.ts
        compiler.ts
        diagnostics.ts
      easing.ts

  schemas/
    fluxion.schema.json

  docs/
    architecture.md
    protocol.md
    mvp.md

  examples/
    simple_circle.py
    simple_circle.fluxion
    simple_circle.fluxion.json
```

---

## 15. 実装順序

### Phase 0: 仕様固定

- `.fluxion.json` の schema を定義
- Node schema を定義
- Timeline operation schema を定義
- easing 名を定義

### Phase 1: Python DSL MVP

- `Scene`
- `Node`
- `Circle`
- `Rectangle`
- `Line`
- `Text`
- `Scene.add()`
- `Scene.play()`
- `.animate`
- JSON export

### Phase 2: Web SVG Runtime

- JSON load
- SVG node creation
- timeline playback
- transform update
- opacity update

### Phase 3: Diff Preview

- Python 側 diff emission
- WebSocket or local dev server
- Web Runtime に patch apply 機構を追加

### Phase 3.5: Text DSL Preview

- `.fluxion` 構文の最小仕様
- browser parser / compiler
- editor から `.fluxion.json` への変換
- 変換結果を既存 Web Runtime で再生
- Markdown fenced block からの埋め込み再生

### Phase 4: Math

- `Math` node
- KaTeX integration
- LaTeX string preservation

### Phase 5: Transform 拡張

- shape transform
- path morph
- text morph
- math morph

---

## 16. 設計上の重要原則

### 16.1 ピクセルではなく意味を保存する

MP4 は各フレームのピクセル列である。

Fluxion では次を保存する。

- 円がある
- 線がある
- 数式がある
- 円が右に移動する
- この Node はこの Group に属する
- この property は 2 秒かけて変化する

これにより以下が可能になる。

- 即時プレビュー
- 差分更新
- Web 再生
- インタラクティブ操作
- AI による編集
- Git 管理
- semantic diff

### 16.2 入力 DSL と Renderer を分離する

Python DSL と Text DSL は IR の生成に専念する。Renderer は Web 側に置く。

この分離により、将来的に複数の入力 DSL と複数 renderer を持てる。

```text
Python DSL ─┐
Text DSL   ─┼─ Same IR
GUI Editor ─┘
  ├─ SVG Renderer
  ├─ Canvas Renderer
  ├─ WebGL Renderer
  ├─ WebGPU Renderer
  └─ Export Renderer
```

### 16.3 Manim 完全互換を急がない

最初に作るべきものは Manim 互換 renderer ではない。

最初に作るべきものは以下。

```text
Manim-like Python DSL / Text DSL
  → Scene Graph JSON
  → Web playback
```

---

## 17. 名前

本アプリケーション名は `Fluxion` とする。

理由:

- 短い
- `.fluxion.json` と相性が良い
- Manim 風の作り心地を持ちながら、独立プロジェクト名として使いやすい

---

## 18. 結論

この設計の核心は以下の 4 点。

1. `Mobject` や Text DSL の shape 宣言を `Node` 化する
2. `Animation` を `Timeline` 化する
3. `play()` を Timeline / Diff 生成にする
4. Renderer を Web 側に分離する

現在の MVP は次の経路を対象にする。

```text
Manim-like Python DSL / Text DSL
  → Scene Graph JSON
  → SVG Web Runtime
```

これにより、従来の Manim よりも以下の用途に強いシステムになる。

- 高速プレビュー
- Web ネイティブ再生
- 差分更新
- 編集可能なアニメーション
- インタラクティブ教材
- AI による構造編集
- Git 管理可能な animation source

## Scene-level camera

`FluxionDocument` includes a root camera state: `camera: { x, y, scale, rotation }`. The default `{ x: 0, y: 0, scale: 1, rotation: 0 }` keeps scene coordinates unchanged. Timeline operations address the camera with `id: "camera"` and paths such as `camera.x` or `camera.scale`.

The SVG renderer creates a root `<g>` for all scene nodes and applies camera before node transforms:

```text
Screen = Camera * ParentNode * ChildNode * Geometry
Camera = translate(centerX + camera.x, centerY + camera.y) rotate(camera.rotation) scale(camera.scale) translate(-centerX, -centerY)
Node   = translate(node.x, node.y) rotate(node.rotation) scale(node.scale)
```

This makes camera pan scene-level while zoom / rotation pivot around the scene center, and each node's transform remains local and composes under the camera.
