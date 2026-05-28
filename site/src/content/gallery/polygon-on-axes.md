---
title: PolygonOnAxes
description: "Manim Example: `PolygonOnAxes` (`#polygononaxes`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#polygononaxes
source_example_path: examples/gallery/polygon-on-axes.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の `always_redraw(Polygon(... ax.c2p ...))` は、軸座標から算出した `rect` の幅・高さ・中心を `value` binding で更新して再現している。"
    layer: dsl
    impact: medium
    workaround: "軸のスケールを固定し、`always <shape>.w/h/x/y = expr=...` で rectangle-under-curve を再現する。"
    closure_condition: "axes coordinate transform と `always_redraw` 相当の動的 mobject 再生成を DSL に追加する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 72
gap_id: GAP-025
---
scene width=960 height=540 fps=60

value t = 5

rect bg w=960 h=540 at 0,0 fill="#000000"

line x_axis x1=-240 y1=180 x2=260 y2=180 stroke="#FFFFFF" strokeWidth=3
line y_axis x1=-240 y1=180 x2=-240 y2=-200 stroke="#FFFFFF" strokeWidth=3

line x_tick_0 x1=0 y1=-6 x2=0 y2=6 at -240,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_2 x1=0 y1=-6 x2=0 y2=6 at -144,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_4 x1=0 y1=-6 x2=0 y2=6 at -48,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_6 x1=0 y1=-6 x2=0 y2=6 at 48,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_8 x1=0 y1=-6 x2=0 y2=6 at 144,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_10 x1=0 y1=-6 x2=0 y2=6 at 240,180 stroke="#FFFFFF" strokeWidth=2
line y_tick_0 x1=-6 y1=0 x2=6 y2=0 at -240,180 stroke="#FFFFFF" strokeWidth=2
line y_tick_2 x1=-6 y1=0 x2=6 y2=0 at -240,108 stroke="#FFFFFF" strokeWidth=2
line y_tick_4 x1=-6 y1=0 x2=6 y2=0 at -240,36 stroke="#FFFFFF" strokeWidth=2
line y_tick_6 x1=-6 y1=0 x2=6 y2=0 at -240,-36 stroke="#FFFFFF" strokeWidth=2
line y_tick_8 x1=-6 y1=0 x2=6 y2=0 at -240,-108 stroke="#FFFFFF" strokeWidth=2
line y_tick_10 x1=-6 y1=0 x2=6 y2=0 at -240,-180 stroke="#FFFFFF" strokeWidth=2

text x_label_0 "0" at -240,205 size=20 fill="#FFFFFF"
text x_label_2 "2" at -144,205 size=20 fill="#FFFFFF"
text x_label_4 "4" at -48,205 size=20 fill="#FFFFFF"
text x_label_6 "6" at 48,205 size=20 fill="#FFFFFF"
text x_label_8 "8" at 144,205 size=20 fill="#FFFFFF"
text x_label_10 "10" at 240,205 size=20 fill="#FFFFFF"
text y_label_2 "2" at -270,108 size=20 fill="#FFFFFF"
text y_label_4 "4" at -270,36 size=20 fill="#FFFFFF"
text y_label_6 "6" at -270,-36 size=20 fill="#FFFFFF"
text y_label_8 "8" at -270,-108 size=20 fill="#FFFFFF"
text y_label_10 "10" at -276,-180 size=20 fill="#FFFFFF"

path graph d="M -120 -180 C -96 -120 -64 -67 -48 -45 C -20 -12 20 17 48 30 C 100 55 176 75 240 90" stroke="#E8C11C" strokeWidth=4 fill="none"
rect area w=240 h=180 at -120,90 fill="#58C4DD" opacity=0.5 stroke="#F7D45A" strokeWidth=2
circle dot r=8 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

always area.w = expr=48*t
always area.h = expr=900/t
always area.x = expr=-240 + 24*t
always area.y = expr=180 - 450/t
always dot.x = expr=-240 + 48*t
always dot.y = expr=180 - 900/t

at 0s:
  play AnimationGroup(Create(x_axis), Create(y_axis), lagRatio=0.0) duration=0.8s
  play AnimationGroup(FadeIn(x_tick_0), FadeIn(x_tick_2), FadeIn(x_tick_4), FadeIn(x_tick_6), FadeIn(x_tick_8), FadeIn(x_tick_10), FadeIn(y_tick_0), FadeIn(y_tick_2), FadeIn(y_tick_4), FadeIn(y_tick_6), FadeIn(y_tick_8), FadeIn(y_tick_10), FadeIn(x_label_0), FadeIn(x_label_2), FadeIn(x_label_4), FadeIn(x_label_6), FadeIn(x_label_8), FadeIn(x_label_10), FadeIn(y_label_2), FadeIn(y_label_4), FadeIn(y_label_6), FadeIn(y_label_8), FadeIn(y_label_10), lagRatio=0.02) duration=0.6s
  play Create(graph) duration=0.8s
  play Create(area) duration=0.8s

wait 0.1s
animate t from 5 to 10 duration=1.0s easing=easeInOut
animate t from 10 to 2.5 duration=1.0s easing=easeInOut
animate t from 2.5 to 5 duration=1.0s easing=easeInOut
