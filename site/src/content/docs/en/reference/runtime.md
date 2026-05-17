---
title: Web Runtime
description: Playback and timeline semantics for the Fluxion Web Runtime.
---

Fluxion Web Runtime loads `.fluxion.json`, renders the Scene Graph and Timeline IR to SVG, and controls playback. The Python DSL and Text DSL do not render; the runtime handles timeline application, easing, seek, and playback.

## Browser workflow

`web/index.html` is a compact Text DSL editor.

- When live compile is enabled, editing the Text DSL automatically compiles it to `.fluxion.json` after a short debounce.
- **Compile** explicitly compiles the current Text DSL.
- **Load JSON Example** loads `examples/simple_circle.fluxion.json` directly.
- **Play**, **Stop**, and **Reset** control playback.
- The scrubber seeks to any time.
- The time readout shows current time and duration.
- **Generated .fluxion.json** shows the compiler output.

## Player semantics

`Player` rebuilds the Scene Graph on each seek and applies timeline operations up to the selected time.

- `duration` uses the document duration when present, otherwise it is calculated from the maximum timeline end time.
- `play()` starts from the current time and stops at the end.
- `play({ loop: true })` loops at the duration boundary.
- `seek(seconds)` clamps to `0..duration`.
- Documents containing `create` operations start from an empty graph.
- Documents without `create` operations use `nodes` as the initial graph.

This allows Text DSL nodes to remain hidden until an explicit `show` operation, while older static documents can still render from `nodes` alone.

## Timeline application

Operations are applied in timestamp order. Operations with the same `t` are stabilized in this order:

1. `create`
2. `set`
3. `animate`
4. `delete`

Operations with the same timestamp and operation type keep source array order.

## Animation values

- Numeric values are interpolated with the requested easing.
- Unknown easing names fall back to linear runtime behavior. Text DSL v0.1 rejects unknown easing names before runtime.
- Animations with `duration <= 0` immediately apply the final value.
- Non-numeric values, including colors and strings, are held at `from` until completion and switch to `to` at the end.

## Validation

Runtime and compiler behavior is covered by the web test suite.

```bash
cd web
npm test
```
