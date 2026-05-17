---
title: 概要
description: Fluxion の目的と公開サイトの入口。
---

Fluxion は、レンダリング済み動画フレームではなく、編集可能な animation IR を生成するための MVP です。
Manim 風 Python DSL から `.fluxion.json` を出力し、ブラウザ上の Text DSL compiler と SVG Runtime が Scene Graph Timeline を読み込んで再生します。

<div class="hero-card">

**Core idea:** render 後の動画ではなく、Scene Graph と Timeline の意味を保持したままブラウザで再生・検査・編集できる IR を作ります。

</div>

## Fluxion に含まれるもの

- **Python DSL**: `Scene`, `Mobject`, 図形 object, animation helper。
- **Text DSL**: 小さな animation を安全に記述する declarative syntax。
- **Fluxion IR**: node と timeline operation を含む `.fluxion.json` document。
- **Web Runtime**: playback、scrubbing、deterministic な timeline application を持つ TypeScript SVG renderer。
- **Playground**: Text DSL を compile し、生成 JSON を preview できる GitHub Pages hosted editor。

## Pipeline

```text
Python DSL / Text DSL
  → Scene Graph IR
  → Timeline / Animation IR
  → Diff Stream
  → Web Runtime
```

## 次に読むもの

- [Getting Started](../guides/getting-started/) でローカル実行手順を確認する。
- ブラウザの [Playground](../playground/) を試す。
- [Text DSL reference](../reference/text-dsl/) で syntax を確認する。
