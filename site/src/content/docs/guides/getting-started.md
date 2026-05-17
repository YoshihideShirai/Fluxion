---
title: はじめる
description: Fluxion をローカルで生成・ビルド・プレビューする最短手順。
---

## Example scene を生成する

```bash
PYTHONPATH=python python examples/simple_circle.py
```

このコマンドは Python DSL example から `examples/simple_circle.fluxion.json` を生成します。

## Browser runtime をビルドする

```bash
cd web
npm ci
npm run build
```

## ローカルで preview する

Repository root から次を実行します。

```bash
python -m http.server 8000
```

`http://localhost:8000/web/` を開くと、Text DSL を編集しながら live compile、playback controls、scrubbing、generated JSON output を確認できます。

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
