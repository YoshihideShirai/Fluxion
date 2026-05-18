---
title: Timeline
description: Fluxion Timeline operations and same-time operation ordering.
---

The Timeline is the operation list that describes how Scene Graph nodes and value trackers change over time. Each operation has `t`, and the Runtime deterministically applies operations from `0..currentTime` on seek.

## Operation types

| op | Purpose |
|---|---|
| `create` | Add a node to the graph |
| `delete` | Remove a node from the graph |
| `set` | Immediately set a node / camera property |
| `setExpr` | Set a property from an expression that references value trackers |
| `setValue` | Immediately set a scalar value tracker |
| `animate` | Interpolate a node / camera property |
| `animateValue` | Interpolate a scalar value tracker |
| `effect` | Represent Runtime effects such as `fadeIn`, `fadeOut`, `create`, or `write` |

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

Operations with the same `t` are stabilized by the Runtime in this order:

1. `create`
2. `setValue`
3. `set`
4. `effect`
5. `animateValue`
6. `animate`
7. `setExpr`
8. `delete`

Operations with the same timestamp and operation type keep source array order.

## Animation values

Numeric values interpolate with easing. Non-numeric values such as colors and strings hold `from` until completion, then switch to `to`. Animations with `duration <= 0` immediately apply the final value.

## Related pages

- Read [Fluxion JSON / Scene Graph](../ir/) for the full document shape that contains the timeline.
- Read [Web Runtime](../runtime/) for seek, duration, and playback semantics.
