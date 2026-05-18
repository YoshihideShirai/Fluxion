---
title: Playground tour
description: Fluxion Playground で Text DSL を compile し、SVG preview と JSON output を確認する導線。
---

Playground は、Text DSL をブラウザ内で `.fluxion.json` に compile し、Web Runtime で即時 preview するための小さな editor です。README や landing page から最初に開く導線として想定しています。

## 開き方

- GitHub Pages build では `/playground/` に配置されます。Repository owner が確定していない場合の URL 形式は `https://<owner>.github.io/Fluxion/playground/` です。
- ローカルでは [Getting Started](../getting-started/) の手順で `web/` runtime を build し、`http://localhost:8000/web/` を開きます。

## Text DSL 入力

左側の **Text DSL editor** に animation text を入力します。`scene` で canvas size / fps を指定し、`text`、`math`、`circle`、`rect`、`line`、`path`、`group` などで Scene Graph node を宣言します。`show`、`hide`、`set`、`wait`、`play`、`animate` を使うと Timeline operation を追加できます。

Text DSL はブラウザ上で compile され、任意の Python や JavaScript は実行しません。式は allowlist された小さな arithmetic language として解析されます。

## Compile

**Live compile** が有効な場合は、入力を変更すると自動的に `.fluxion.json` が更新されます。明示的に現在の入力を変換したい場合は **Compile** を押します。Syntax error がある場合は editor 近くの status / error 表示を確認し、該当行を修正してから再度 compile します。

## Playback / scrub

Compile に成功すると **SVG preview** に Scene Graph が描画されます。**Play / Stop / Reset** で Timeline を再生・停止・初期化でき、scrubber を動かすと任意の時刻へ seek して operation の適用結果を確認できます。Runtime は compile 済み JSON を読み、timeline operation を deterministic に適用します。

## Generated JSON

**Generated .fluxion.json** には Runtime に渡される Scene Graph、camera、value tracker、Timeline operation が表示されます。Python DSL と Text DSL は同じ IR へ出力されるため、この JSON を見ると browser preview が何を読み込んでいるか確認できます。

## Examples

Playground には sample Text DSL と、Python DSL example から生成した `examples/simple_circle.fluxion.json` が同梱されます。まずは次の最小例を貼り付けて、compile、playback、scrub、JSON inspection の流れを確認します。

```text
scene width=1280 height=720 fps=60
text title "Fluxion Playground" at 640,120 size=40 fill="#e2e8f0"
circle dot r=44 at 260,380 fill="#38bdf8" stroke="#0f172a" strokeWidth=4

at 0s:
  show title
  show dot

play FadeIn(title) duration=0.6s
animate dot.x from 260 to 760 duration=1.4s easing=easeInOut
play FadeOut(title) duration=0.5s
```

## Site build との同期

`site/scripts/sync-playground.mjs` は site build の前に `site/public/playground/` を作り直し、`web/index.html`、`web/dist/`、`examples/simple_circle.fluxion.json` をコピーします。GitHub Pages workflow は先に `web/` runtime を build して `web/dist/` を生成し、その後 `site/` の Astro build を実行するため、同期された playground が最終的な Pages artifact の `/playground/` に含まれます。

## 次に読むもの

- Authoring syntax は [Text DSL reference](../../reference/text-dsl/) を参照する。
- Compile 後の JSON 構造は [Fluxion JSON / Scene Graph](../../reference/ir/) を参照する。
- Seek / playback の詳細は [Timeline](../../reference/timeline/) と [Web Runtime](../../reference/runtime/) を参照する。
