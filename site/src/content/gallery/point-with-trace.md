---
title: PointWithTrace
description: "Manim Example: `PointWithTrace` (`#pointwithtrace`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointwithtrace
source_example_path: examples/gallery/point-with-trace.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の VMobject updater による実フレーム履歴追記は未実装のため、`Rotating(... about_point=RIGHT)`、`shift(UP)`、`shift(LEFT)` の既知パスを Manim frame scale の1本の `tracedPath` piecewise expression として展開している。"
    layer: dsl
    impact: low
    workaround: "半回転、上移動、左移動を単一の `progress` value と `min/max` 式に展開し、dot と trace を同じ式から再計算する。"
    closure_condition: "対象 mobject の実履歴を追記する TracedPath/updater primitive を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "Manim の `path.add_updater(update_path)` と同等の履歴追記で再現できる時。"
category: Manim Stable Examples
status: ported
order: 71
gap_id: GAP-024
---
scene width=960 height=540 fps=60

value progress = 0

rect bg w=960 h=540 at 0,0 fill="#000000"
tracedPath trace x=67.5*(1-cos(clipPi(t)))-67.5*clip01(t-pi-1) y=67.5*sin(clipPi(t))-67.5*clip01(t-pi) from=0 to=progress samples=240 stroke="#FFFFFF" strokeWidth=4
circle dot r=5.4 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

always dot.x = expr=67.5*(1-cos(clipPi(progress)))-67.5*clip01(progress-pi-1)
always dot.y = expr=67.5*sin(clipPi(progress))-67.5*clip01(progress-pi)

animate progress from 0 to 3.141592654 duration=2s easing=linear
wait 1s
animate progress from 3.141592654 to 4.141592654 duration=1s
animate progress from 4.141592654 to 5.141592654 duration=1s
wait 1s
