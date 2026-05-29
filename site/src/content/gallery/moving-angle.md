---
title: MovingAngle
description: "Manim Example: `MovingAngle` (`#movingangle`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingangle
source_example_path: examples/gallery/moving-angle.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の updater callback は未実装だが、`Line(...).rotate(... about_point=LEFT)` は `rotatingLine` helper、`Angle(...)` と `point_from_proportion(0.5)` は value binding へ展開している。"
    layer: dsl
    impact: low
    workaround: "`theta` を value tracker として管理し、`Line(LEFT, RIGHT)` を Manim 16:9 frame scale の 67.5px/unit へ展開し、基準線の about-point 回転、滑らかな cubic の `Angle(..., radius=0.5)` path、`Angle(..., radius=0.5 + 3 * SMALL_BUFF).point_from_proportion(0.5)` の `\\theta` ラベル位置を再計算する。"
    closure_condition: "Angle/MathTex の updater callback を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "Manim の updater 関数をそのまま記述して同挙動を再現できる時。"
category: Manim Stable Examples
status: ported
order: 66
gap_id: GAP-019
---
scene width=960 height=540 fps=60

value theta = 1.919862177

rect bg w=960 h=540 at 0,0 fill="#000000"
line line1 x1=-67.5 y1=0 x2=67.5 y2=0 stroke="#FFFFFF" strokeWidth=4
rotatingLine line_moving x1=-67.5 y1=0 x2=67.5 y2=0 about=-67.5,0 angle=-theta stroke="#FFFFFF" strokeWidth=4
angle a at -67.5,0 radius=33.75 from=0 to=-theta samples=120 stroke="#FFFFFF" strokeWidth=4
math tex "\\theta" at -36.526,-44.238 size=48 fill="#FFFFFF"

always tex.x = expr=-67.5 + 54*cos(theta/2)
always tex.y = expr=-54*sin(theta/2)

wait 1s
animate theta from 1.919862177 to 0.698131701 start=1s duration=1s
animate theta from 0.698131701 to 3.141592654 start=2s duration=1s
animate tex.fill from "#FFFFFF" to "#FF0000" start=3s duration=0.5s
animate theta from 3.141592654 to 6.108652382 start=3.5s duration=1s
