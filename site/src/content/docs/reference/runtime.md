---
title: Web Runtime
description: Fluxion Web Runtime の playback と timeline semantics。
---


Fluxion Web Runtime は `.fluxion.json` を読み込み、Scene Graph と Timeline IR を SVG に描画して再生します。Python DSL と Text DSL は描画を担当せず、Runtime が timeline の適用、easing、seek、playback を担当します。

## Browser Workflow

`web/index.html` は Text DSL の小さな編集環境です。

- Text DSL を編集すると、Live compile が有効な場合は短い debounce 後に自動で `.fluxion.json` へ変換します。
- **Compile** は現在の Text DSL を明示的に変換します。
- **Load JSON Example** は `examples/simple_circle.fluxion.json` を直接読み込みます。
- **Play**, **Stop**, **Reset** で playback を操作します。
- Scrubber で任意時刻へ seek できます。
- Time readout は current time と duration を表示します。
- **Generated .fluxion.json** で compiler の出力を確認できます。

## Player Semantics

`Player` は seek ごとに Scene Graph を再構築し、指定時刻までの timeline operations を適用します。

- `duration` は document の `duration` があればそれを使い、なければ timeline の最大終了時刻から計算します。
- `play()` は現在時刻から再生し、最後まで到達すると停止します。
- `play({ loop: true })` の場合だけ duration で loop します。
- `seek(seconds)` は `0..duration` に clamp します。
- document が `create` operation を含む場合、初期 graph は空です。
- document が `create` operation を含まない場合、`nodes` を初期 graph として扱います。

この分岐により、Text DSL の `show` で明示された node は `show` 時刻まで表示されず、古い static document は `nodes` だけでも表示できます。

## Timeline Application

Timeline operations は時刻順に適用されます。同じ `t` の operation は Runtime 側で次の順に安定化します。

1. `create`
2. `setValue`
3. `set`
4. `effect`
5. `animateValue`
6. `animate`
7. `setExpr`
8. `bindExpr` / `bindPath` / `followCamera`
9. `delete`

同じ時刻・同じ operation type の中では source array order を保持します。`setExpr` は tracker animation と通常 node animation の後に評価され、`bindExpr` / `bindPath` / `followCamera` はさらに後段の updater として適用されます。

## Animation Values

- Numeric values are interpolated with the requested easing.
- Unknown easing names fall back to linear behavior in the runtime. Text DSL rejects unknown easing names before runtime.
- `duration <= 0` の animation は即時に final value を適用します。
- Non-numeric values, including colors and strings, are held at `from` until completion and switch to `to` at the end.

## Validation

Runtime and compiler behavior is covered by the web test suite.

```bash
cd web
npm test
```

## Expression Values

Value trackers live outside the scene graph as scalar tracks declared by Text DSL `value` statements or JSON `values` entries. Runtime initializes these tracks on every seek, applies `setValue` and `animateValue`, then evaluates `setExpr` operations against the current tracker map.

`setExpr` uses Fluxion's small arithmetic evaluator rather than JavaScript execution. It supports numeric literals, tracker identifiers, parentheses, arithmetic operators, constants (`pi`, `e`), and allowlisted math functions such as `sin`, `cos`, `tan`, `sqrt`, `abs`, `min`, `max`, `pow`, `clip01`, and `clipPi`. This is a static dependency-expression feature, not full compatibility with Manim updaters.
