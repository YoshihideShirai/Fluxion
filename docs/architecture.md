# Vanim / SceneManim アーキテクチャ

> **目的**: Manim 風の Python DSL から、動画フレームではなく **Scene Graph / Timeline IR / Diff Stream** を生成し、Web Runtime で再生・編集・プレビューできる仕組みを作る。

---

## 1. コンセプト

従来の Manim は、Python DSL から Cairo / OpenGL でフレームを描画し、最終的に MP4 を生成する。

```text
Python DSL
  → Cairo / OpenGL Renderer
  → Frames
  → MP4
```

本プロジェクトでは、Manim を「Python で動画をレンダリングするツール」ではなく、**Python で Scene Graph の時間変化を生成するツール**として再定義する。

```text
Python DSL
  → Scene Graph IR
  → Timeline / Animation IR
  → Diff Stream
  → Web Renderer
```

Python 側は描画を担当せず、**意味を持つシーン構造と時間変化**を生成する。

---

## 2. ゴール

### 2.1 実現したいこと

- Manim 風 Python API を維持する
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
┌─────────────────────────────┐
│ Manim-like Python DSL        │
│ - Scene                      │
│ - Mobject                    │
│ - Animation                  │
│ - Transform                  │
└──────────────┬──────────────┘
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

初期 MVP では以下をサポートする。

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

## 6. Python DSL

### 6.1 目標 API

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
| `group` | Node を group に追加 |
| `ungroup` | group を解除 |

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

Python 側は描画しない。Web Runtime が描画と再生を担当する。

```text
Python
  - DSL
  - Scene Graph 生成
  - Timeline 生成
  - Diff 生成

Web Runtime
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
.vanim.json
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

- `.vanim.json` loader
- SVG renderer
- timeline player
- `create`
- `delete`
- `set`
- `animate`
- transform interpolation
- opacity interpolation
- basic easing

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
      easing.ts

  schemas/
    vanim.schema.json

  docs/
    architecture.md
    protocol.md
    mvp.md

  examples/
    simple_circle.py
    simple_circle.vanim.json
```

---

## 15. 実装順序

### Phase 0: 仕様固定

- `.vanim.json` の schema を定義
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

Vanim / SceneManim では次を保存する。

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

### 16.2 Python と Renderer を分離する

Python 側は IR の生成に専念する。Renderer は Web 側に置く。

この分離により、将来的に複数 renderer を持てる。

```text
Same IR
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
Manim-like Python DSL
  → Scene Graph JSON
  → Web playback
```

---

## 17. 名前候補

| 名前 | 印象 |
|---|---|
| `Vanim` | Vector Animation の略として分かりやすい |
| `SceneManim` | Manim との関係が明確 |
| `ManimGraph` | Scene Graph 指向が伝わる |
| `Graphim` | 短いがやや抽象的 |
| `VectorManim` | ベクター指向が伝わる |

推奨は `Vanim`。

理由:

- 短い
- `.vanim.json` と相性が良い
- Manim 派生であることを匂わせつつ、独立プロジェクト名として使いやすい

---

## 18. 結論

この設計の核心は以下の 4 点。

1. `Mobject` を `Node` 化する
2. `Animation` を `Timeline` 化する
3. `play()` を Timeline / Diff 生成にする
4. Renderer を Web 側に分離する

最初の MVP は次で十分。

```text
Manim-like Python DSL
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
