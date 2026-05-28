---
title: MovingDots
description: "Manim Example: `MovingDots` (`#movingdots`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingdots
source_example_path: examples/gallery/moving-dots.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の updater API はDSL構文としては未対応だが、同じValueTrackerとLine追従挙動を `always` binding で再現している。"
    layer: dsl
    impact: low
    workaround: "`value` と `always expr` で dot 座標と line endpoints を同期する。"
    closure_condition: "updater 構文/API の互換レイヤーを拡張する。"
    fidelity_upgrade_condition: "Manim の updater 記述をほぼ同形で移植できる時。"
category: Manim Stable Examples
status: ported
order: 68
gap_id: GAP-021
---
scene width=960 height=540 fps=60

value x = 0
value y = 0
rect bg w=960 h=540 at 0,0 fill="#000000"
line connector x1=0 y1=0 x2=72 y2=0 stroke="#FC6255" strokeWidth=4
circle d1 r=8 at 0,0 fill="#58C4DD" stroke="#58C4DD" strokeWidth=0
circle d2 r=8 at 72,0 fill="#83C167" stroke="#83C167" strokeWidth=0
always d1.x = expr=60*x
always d2.y = expr=-60*y
always connector.x1 = expr=60*x
always connector.y1 = expr=0
always connector.x2 = expr=72
always connector.y2 = expr=-60*y
at 0s:
  animate x from 0 to 5 duration=1s easing=smooth
at 1s:
  animate y from 0 to 4 duration=1s easing=smooth
wait 1s
