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
    workaround: "公式の `t_offset` 進行を `theta` value に変換し、円上の dot、半径線、curve 接続線、sine trace を同じ value から再計算する。`MathTex` label は既定 font size 48、dot/line/trace は Manim の `YELLOW` / `YELLOW_A` / `YELLOW_D` 色定数に合わせる。"
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

line x_axis x1=-405 y1=0 x2=405 y2=0 stroke="#FFFFFF" strokeWidth=4
line y_axis x1=0 y1=-135 x2=0 y2=135 at -270,0 stroke="#FFFFFF" strokeWidth=4
math pi_label "\\pi" at -67.5,42 size=48 fill="#FFFFFF"
math two_pi_label "2\\pi" at 67.5,42 size=48 fill="#FFFFFF"
math three_pi_label "3\\pi" at 202.5,42 size=48 fill="#FFFFFF"
math four_pi_label "4\\pi" at 337.5,42 size=48 fill="#FFFFFF"

circle unit r=67.5 at -270,0 fill="none" stroke="#FFFFFF" strokeWidth=4
line origin_to_circle x1=0 y1=0 x2=67.5 y2=0 at -270,0 stroke="#58C4DD" strokeWidth=4
line dot_to_curve x1=-202.5 y1=0 x2=-202.5 y2=0 stroke="#FFF1B6" strokeWidth=2
tracedPath sine_curve x=-202.5+(t/(2*pi))*270 y=-67.5*sin(t) from=0 to=theta samples=320 stroke="#F4D345" strokeWidth=4
circle dot r=5.4 at -202.5,0 fill="#F7D96F" stroke="#F7D96F" strokeWidth=0

always dot.x = expr=-270+67.5*cos(theta)
always dot.y = expr=-67.5*sin(theta)
always origin_to_circle.x2 = expr=67.5*cos(theta)
always origin_to_circle.y2 = expr=-67.5*sin(theta)
always dot_to_curve.x1 = expr=-270+67.5*cos(theta)
always dot_to_curve.y1 = expr=-67.5*sin(theta)
always dot_to_curve.x2 = expr=-202.5+(theta/(2*pi))*270
always dot_to_curve.y2 = expr=-67.5*sin(theta)

animate theta from 0 to 13.351768778 duration=8.5s easing=linear
at 8.5s:
  wait 1s
