---
title: PointWithTrace
description: "Manim Example: `PointWithTrace` (`#pointwithtrace`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointwithtrace
source_example_path: examples/gallery/point-with-trace.fluxion.txt
porting_strategy: visual_approximation
fidelity: faithful
known_gaps:
  - symptom: "Manim の VMobject updater による実フレーム履歴追記は未実装のため、dot の既知パスを `tracedPath` の piecewise expression として展開している。"
    layer: dsl
    impact: low
    workaround: "半回転、上移動、左移動の軌跡を同期した trace segment として展開し、dot の value binding と合わせる。"
    closure_condition: "対象 mobject の実履歴を追記する TracedPath/updater primitive を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "Manim の `path.add_updater(update_path)` と同等の履歴追記で再現できる時。"
category: Manim Stable Examples
status: ported
order: 71
gap_id: GAP-024
---
scene width=960 height=540 fps=60

value rot = 0
value up = 0
value left = 0

rect bg w=960 h=540 at 0,0 fill="#000000"
tracedPath arc_trace x=120*(1-cos(t)) y=120*sin(t) from=0 to=rot samples=140 stroke="#FFFFFF" strokeWidth=4
tracedPath up_trace x=240 y=-120*t from=0 to=up samples=32 stroke="#FFFFFF" strokeWidth=4
tracedPath left_trace x=240-120*t y=-120 from=0 to=left samples=32 stroke="#FFFFFF" strokeWidth=4
circle dot r=8 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

always dot.x = expr=120*(1-cos(rot))-120*left
always dot.y = expr=120*sin(rot)-120*up

animate rot from 0 to 3.141592654 duration=2s easing=linear
wait 1s
animate up from 0 to 1 duration=1s
animate left from 0 to 1 duration=1s
wait 1s
