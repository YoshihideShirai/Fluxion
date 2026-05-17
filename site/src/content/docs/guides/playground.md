---
title: Playground tour
description: Fluxion Playground で Text DSL を compile し、SVG preview と JSON output を確認する導線。
---

Playground は、Text DSL をブラウザ内で `.fluxion.json` に compile し、Web Runtime で即時 preview するための小さな editor です。

## 開き方

- GitHub Pages build では `/playground/` に配置されます。
- ローカルでは [Getting Started](./getting-started/) の手順で `web/` runtime を build し、`http://localhost:8000/web/` を開きます。

## 画面の流れ

1. **Text DSL editor** に animation text を書く。
2. **Live compile** が有効なら、入力後に自動で `.fluxion.json` が更新される。
3. **Compile** で現在の入力を明示的に compile する。
4. **SVG preview** で Scene Graph が描画される。
5. **Play / Stop / Reset** と scrubber で Timeline を確認する。
6. **Generated .fluxion.json** で Runtime に渡る IR を確認する。

## 試すサンプル

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

## 次に読むもの

- Authoring syntax は [Text DSL reference](../reference/text-dsl/) を参照する。
- Compile 後の JSON 構造は [Fluxion JSON / Scene Graph](../reference/ir/) を参照する。
- Seek / playback の詳細は [Timeline](../reference/timeline/) と [Web Runtime](../reference/runtime/) を参照する。
