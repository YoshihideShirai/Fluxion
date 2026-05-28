---
title: MovingDots
description: "Manim Example: `MovingDots` (`#movingdots`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingdots
source_example_path: examples/gallery/moving-dots.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の updater API はDSL構文としては未対応だが、`VGroup(...).arrange(RIGHT, buff=1)` と同じ dot 間隔、ValueTracker、Line追従挙動を `always` binding と `dynamicLine` で再現している。"
    layer: dsl
    impact: low
    workaround: "`value` と `always expr` で dot 座標を同期し、`Line(...).become(...)` updater は `dynamicLine` の endpoint binding に展開する。Manim の `become(Line(...))` は新しい default Line の色もコピーするため、初期 `set_color(RED)` 後の connector は白線として描き、丸い cap/join で curve helper と同じ VMobject 風の線にする。最後の既定 `self.wait()` は明示時刻の hold として保持する。"
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
dynamicLine connector x1=67.5*x y1=0 x2=39.15 y2=-67.5*y stroke="#FFFFFF" strokeWidth=4
circle d1 r=5.4 at 0,0 fill="#58C4DD" stroke="#58C4DD" strokeWidth=0
circle d2 r=5.4 at 39.15,0 fill="#83C167" stroke="#83C167" strokeWidth=0
always d1.x = expr=67.5*x
always d2.y = expr=-67.5*y
at 0s:
  animate x from 0 to 5 duration=1s easing=smooth
at 1s:
  animate y from 0 to 4 duration=1s easing=smooth
at 2s:
  wait 1s
