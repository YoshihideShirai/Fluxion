---
title: SineCurveUnitCircle
description: "Manim Example: `SineCurveUnitCircle` (`#sinecurveunitcircle`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinecurveunitcircle
source_example_path: examples/gallery/sine-curve-unit-circle.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の VGroup 履歴追記式 sine curve updater は、既知の dot 軌道を `tracedPath` と `value` binding に展開して再現している。"
    layer: dsl
    impact: low
    workaround: "公式の `t_offset` 進行を `theta` value に変換し、円上の dot、半径線、curve 接続線、sine trace を同じ value から再計算する。"
    closure_condition: "VGroup への逐次 Line 追加や `always_redraw` callback を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Advanced Projects
status: ported
order: 52
gap_id: GAP-011
---
scene width=960 height=540 fps=60
value theta = 0

rect bg w=960 h=540 at 0,0 fill="#000000"

line x_axis x1=-360 y1=0 x2=360 y2=0 stroke="#FFFFFF" strokeWidth=4
line y_axis x1=0 y1=-120 x2=0 y2=120 at -240,0 stroke="#FFFFFF" strokeWidth=4
math pi_label "\\pi" at -60,36 size=28 fill="#FFFFFF"
math two_pi_label "2\\pi" at 60,36 size=28 fill="#FFFFFF"
math three_pi_label "3\\pi" at 180,36 size=28 fill="#FFFFFF"
math four_pi_label "4\\pi" at 300,36 size=28 fill="#FFFFFF"

circle unit r=60 at -240,0 fill="none" stroke="#FFFFFF" strokeWidth=4
line origin_to_circle x1=0 y1=0 x2=60 y2=0 at -240,0 stroke="#58C4DD" strokeWidth=4
line dot_to_curve x1=-180 y1=0 x2=-180 y2=0 stroke="#FFF1A6" strokeWidth=2
tracedPath sine_curve x=-180+(t/(2*pi))*240 y=-60*sin(t) from=0 to=theta samples=320 stroke="#F4D03F" strokeWidth=4
circle dot r=5 at -180,0 fill="#FFFF00" stroke="#FFFF00" strokeWidth=2

always dot.x = expr=-240+60*cos(theta)
always dot.y = expr=-60*sin(theta)
always origin_to_circle.x2 = expr=60*cos(theta)
always origin_to_circle.y2 = expr=-60*sin(theta)
always dot_to_curve.x1 = expr=-240+60*cos(theta)
always dot_to_curve.y1 = expr=-60*sin(theta)
always dot_to_curve.x2 = expr=-180+(theta/(2*pi))*240
always dot_to_curve.y2 = expr=-60*sin(theta)

animate theta from 0 to 13.351768778 duration=8.5s easing=linear
wait 1s
