---
title: Overview
description: Fluxion の目的と、Start Here / Authoring / Runtime & IR / Design Notes の読み方。
---

Fluxion は、レンダリング済み動画フレームではなく、編集可能な animation IR を生成するための MVP です。
Manim 風 Python DSL とブラウザ向け Text DSL は、同じ `.fluxion.json` に変換され、Web Runtime が Scene Graph と Timeline を SVG として再生します。

<div class="hero-card">

**Core idea:** render 後の動画ではなく、Scene Graph と Timeline の意味を保持したままブラウザで再生・検査・編集できる IR を作ります。

</div>

## Documentation map

Fluxion docs は、sidebar と同じ 4 つの導線で読み進められるように整理しています。

1. **Start Here**: プロジェクトの概要、最短のローカル実行手順、Playground の操作方法。
2. **Authoring**: Python DSL、Text DSL、既存 examples から `.fluxion.json` を作る方法。
3. **Runtime & IR**: Fluxion JSON / Scene Graph、Timeline operation、Web Runtime の再生 semantics。
4. **Design Notes**: Architecture と Roadmap / MVP Scope。

## Fluxion に含まれるもの

- **Python DSL**: `Scene`, `Mobject`, 図形 object, animation helper。
- **Text DSL**: 小さな animation を安全に記述する declarative syntax。
- **Fluxion JSON / Scene Graph**: node、camera、value tracker、timeline operation を含む `.fluxion.json` document。
- **Web Runtime**: playback、scrubbing、deterministic な timeline application を持つ TypeScript SVG renderer。
- **Playground**: Text DSL を compile し、生成 JSON を preview できる GitHub Pages hosted editor。

## Pipeline

```text
Python DSL / Text DSL
  → Fluxion JSON / Scene Graph
  → Timeline / Animation IR
  → Web Runtime
  → SVG preview
```

## 次に読むもの

- [Getting Started](./guides/getting-started/) でローカル実行手順を確認する。
- [Playground tour](./guides/playground/) でブラウザ editor の操作を確認する。
- [Python DSL](./guides/python-dsl/) または [Text DSL reference](./reference/text-dsl/) から authoring を始める。
- [Fluxion JSON / Scene Graph](./reference/ir/) と [Timeline](./reference/timeline/) で IR の形を確認する。

## Documentation source of truth

Canonical documentation lives under `site/src/content/docs/` and is published by the GitHub Pages build. The root `docs/` directory is intentionally limited to a pointer README; do not maintain duplicate long-form docs there.
