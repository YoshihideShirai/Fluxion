---
title: Timeline
description: Fluxion Timeline operation と同時刻 operation の適用順。
---

Timeline は、Scene Graph と value tracker が時間に沿ってどう変化するかを表す operation list です。各 operation は `t` を持ち、Runtime は seek 時に `0..currentTime` の operation を deterministic に適用します。

## Operation types

| op | Purpose |
|---|---|
| `create` | node を graph に追加する |
| `delete` | node を graph から削除する |
| `set` | node / camera property を即時に設定する |
| `setExpr` | value tracker を参照する式で property を設定する |
| `bindExpr` | value tracker を参照する式で property を seek 時に更新する |
| `bindPath` | value tracker を参照する parametric path を seek 時に再サンプルする |
| `setValue` | scalar value tracker を即時に設定する |
| `animate` | node / camera property を補間する |
| `animateValue` | scalar value tracker を補間する |
| `effect` | `fadeIn` / `fadeOut` / `create` / `write` などの Runtime effect を表す |
| `followCamera` | animation 適用後の node center を camera target に反映する |

## Animate example

```json
{
  "t": 0,
  "op": "animate",
  "id": "c1",
  "path": "transform.x",
  "from": 220,
  "to": 640,
  "duration": 1.5,
  "easing": "easeInOut"
}
```

## Same-time ordering

同じ `t` の operation は Runtime 側で次の順に安定化します。

1. `create`
2. `setValue`
3. `set`
4. `effect`
5. `animateValue`
6. `animate`
7. `setExpr`
8. `bindExpr` / `bindPath` / `followCamera`
9. `delete`

同じ時刻・同じ operation type の中では source array order を保持します。

## Animation values

Numeric value は easing に従って補間されます。Color や string などの non-numeric value は animation 完了時に `from` から `to` へ切り替わります。`duration <= 0` の animation は final value を即時適用します。

## 関連ページ

- [Fluxion JSON / Scene Graph](../ir/) で timeline を含む document 全体を見る。
- [Web Runtime](../runtime/) で seek、duration、playback semantics を確認する。
