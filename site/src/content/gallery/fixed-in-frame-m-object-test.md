---
title: FixedInFrameMObjectTest
description: "Manim Example: `FixedInFrameMObjectTest` (`#fixedinframemobjecttest`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#fixedinframemobjecttest
source_example_path: examples/gallery/fixed-in-frame-m-object-test.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Fluxion には ThreeDScene / ThreeDAxes / fixed-in-frame camera layer がないため、公式出力のカメラ投影を手描き2D軸と固定位置テキストで再現している。"
    layer: compiler
    impact: medium
    workaround: "ThreeDAxes を斜投影の line/tick 群として描き、`Text.to_corner(UL)` 相当の位置へテキストを直接配置する。"
    closure_condition: "3D camera projection と fixed-in-frame mobject layer を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 62
gap_id: GAP-015
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
text text3d "This is a 3D text" at -270,-212 size=36 fill="#FFFFFF"

line x_axis_pos x1=0 y1=0 x2=260 y2=128 at -40,42 stroke="#FFFFFF" strokeWidth=4
line x_axis_neg x1=0 y1=0 x2=-170 y2=-84 at -40,42 stroke="#FFFFFF" strokeWidth=4
line y_axis_pos x1=0 y1=0 x2=-238 y2=118 at -40,42 stroke="#FFFFFF" strokeWidth=4
line y_axis_neg x1=0 y1=0 x2=156 y2=-78 at -40,42 stroke="#FFFFFF" strokeWidth=4
line z_axis_pos x1=0 y1=0 x2=0 y2=-240 at -40,42 stroke="#FFFFFF" strokeWidth=4
line z_axis_neg x1=0 y1=0 x2=0 y2=90 at -40,42 stroke="#FFFFFF" strokeWidth=4

line x_tick_1 x1=-5 y1=10 x2=5 y2=-10 at 25,74 stroke="#FFFFFF" strokeWidth=2
line x_tick_2 x1=-5 y1=10 x2=5 y2=-10 at 90,106 stroke="#FFFFFF" strokeWidth=2
line x_tick_3 x1=-5 y1=10 x2=5 y2=-10 at 155,138 stroke="#FFFFFF" strokeWidth=2
line x_tick_n1 x1=-5 y1=10 x2=5 y2=-10 at -83,21 stroke="#FFFFFF" strokeWidth=2
line x_tick_n2 x1=-5 y1=10 x2=5 y2=-10 at -126,0 stroke="#FFFFFF" strokeWidth=2

line y_tick_1 x1=-5 y1=-10 x2=5 y2=10 at -100,72 stroke="#FFFFFF" strokeWidth=2
line y_tick_2 x1=-5 y1=-10 x2=5 y2=10 at -160,101 stroke="#FFFFFF" strokeWidth=2
line y_tick_3 x1=-5 y1=-10 x2=5 y2=10 at -219,130 stroke="#FFFFFF" strokeWidth=2
line y_tick_n1 x1=-5 y1=-10 x2=5 y2=10 at -1,23 stroke="#FFFFFF" strokeWidth=2
line y_tick_n2 x1=-5 y1=-10 x2=5 y2=10 at 38,3 stroke="#FFFFFF" strokeWidth=2

line z_tick_1 x1=-10 y1=0 x2=10 y2=0 at -40,-18 stroke="#FFFFFF" strokeWidth=2
line z_tick_2 x1=-10 y1=0 x2=10 y2=0 at -40,-78 stroke="#FFFFFF" strokeWidth=2
line z_tick_3 x1=-10 y1=0 x2=10 y2=0 at -40,-138 stroke="#FFFFFF" strokeWidth=2
line z_tick_n1 x1=-10 y1=0 x2=10 y2=0 at -40,72 stroke="#FFFFFF" strokeWidth=2
line z_tick_n2 x1=-10 y1=0 x2=10 y2=0 at -40,102 stroke="#FFFFFF" strokeWidth=2

wait 1s
