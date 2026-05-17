---
title: Getting Started
description: Fluxion をローカルで生成・ビルド・プレビューする最短手順。
---

Getting Started は **Start Here** の 2 番目のページです。Python DSL example から `.fluxion.json` を生成し、Web Runtime / Playground で preview するまでを最短で確認します。

## Use the hosted playground

インストールせずに試す場合は、GitHub Pages の hosted playground を最初に開きます。Repository owner が未確定の場合の URL 形式は `https://<owner>.github.io/Fluxion/playground/` です。

Hosted playground では Text DSL を入力し、browser 内で compile して、playback / scrub と generated JSON inspection まで確認できます。ローカルで runtime や site を build する前に、DSL と IR の流れを素早く把握するための第一導線です。

## 1. Example scene を生成する

Repository root から次を実行します。

```bash
PYTHONPATH=python python examples/simple_circle.py
```

このコマンドは Python DSL example から `examples/simple_circle.fluxion.json` を生成します。

## 2. Browser runtime をビルドする

```bash
cd web
npm ci
npm run build
```

## 3. ローカルで preview する

Repository root に戻って次を実行します。

```bash
python -m http.server 8000
```

`http://localhost:8000/web/` を開くと、Text DSL を編集しながら live compile、playback controls、scrubbing、generated JSON output を確認できます。

## 4. 次に進む

- Playground の UI は [Playground tour](./playground/) で確認する。
- Python から scene を書く場合は [Python DSL](./python-dsl/) を読む。
- Browser 上で text から書く場合は [Text DSL reference](../reference/text-dsl/) を読む。
- Runtime が読む IR は [Fluxion JSON / Scene Graph](../reference/ir/) と [Timeline](../reference/timeline/) で確認する。

## GitHub Pages site をローカルでビルドする

Astro site は `site/` にあります。Playground を site artifact にコピーするため、先に runtime をビルドします。

```bash
cd web
npm run build
cd ../site
npm ci
npm run build
npm run preview
```

Site build は `web/index.html`、`web/dist`、generated example JSON を `site/public/playground/` にコピーし、その後 `site/dist/` を生成します。
