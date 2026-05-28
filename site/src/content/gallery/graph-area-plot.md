---
title: GraphAreaPlot
description: "Manim Example: `GraphAreaPlot` (`#graphareaplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#graphareaplot
source_example_path: examples/gallery/graph-area-plot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の `Axes.get_riemann_rectangles` と `Axes.get_area(... bounded_graph=...)` は未実装のため、矩形と2曲線間 polygon を手動配置している。視覚構成は公式出力に合わせている。"
    layer: dsl
    impact: medium
    workaround: "軸スケールを固定し、`plot` と手動 `rect` / `path` で公式出力に近い静止画を再現する。"
    closure_condition: "Axes graph helper に riemann rectangles と bounded area primitive を追加する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 64
gap_id: GAP-016
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

line x_axis x1=-250 y1=180 x2=270 y2=180 stroke="#FFFFFF" strokeWidth=3
line y_axis x1=-250 y1=180 x2=-250 y2=-170 stroke="#FFFFFF" strokeWidth=3

line x_tick_0 x1=0 y1=-6 x2=0 y2=6 at -250,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_1 x1=0 y1=-6 x2=0 y2=6 at -150,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_2 x1=0 y1=-6 x2=0 y2=6 at -50,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_3 x1=0 y1=-6 x2=0 y2=6 at 50,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_4 x1=0 y1=-6 x2=0 y2=6 at 150,180 stroke="#FFFFFF" strokeWidth=2
line x_tick_5 x1=0 y1=-6 x2=0 y2=6 at 250,180 stroke="#FFFFFF" strokeWidth=2
line y_tick_1 x1=-6 y1=0 x2=6 y2=0 at -250,125 stroke="#FFFFFF" strokeWidth=2
line y_tick_2 x1=-6 y1=0 x2=6 y2=0 at -250,70 stroke="#FFFFFF" strokeWidth=2
line y_tick_3 x1=-6 y1=0 x2=6 y2=0 at -250,15 stroke="#FFFFFF" strokeWidth=2
line y_tick_4 x1=-6 y1=0 x2=6 y2=0 at -250,-40 stroke="#FFFFFF" strokeWidth=2
line y_tick_5 x1=-6 y1=0 x2=6 y2=0 at -250,-95 stroke="#FFFFFF" strokeWidth=2
line y_tick_6 x1=-6 y1=0 x2=6 y2=0 at -250,-150 stroke="#FFFFFF" strokeWidth=2
text x_num_2 "2" at -50,208 size=22 fill="#FFFFFF"
text x_num_3 "3" at 50,208 size=22 fill="#FFFFFF"
math x_label "x" at 292,182 size=28 fill="#FFFFFF"
math y_label "y" at -254,-198 size=28 fill="#FFFFFF"

rect r01 w=3 h=61 at -218.5,149.5 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r02 w=3 h=67 at -215.5,146.5 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r03 w=3 h=72 at -212.5,144 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r04 w=3 h=78 at -209.5,141 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r05 w=3 h=83 at -206.5,138.5 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r06 w=3 h=88 at -203.5,136 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r07 w=3 h=93 at -200.5,133.5 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r08 w=3 h=98 at -197.5,131 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r09 w=3 h=103 at -194.5,128.5 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5
rect r10 w=3 h=108 at -191.5,126 fill="#0000FF" stroke="#0000FF" strokeWidth=1 opacity=0.5

path bounded_area d="M -50 -40 C -22 -39 24 -11 50 15 L 50 59 C 23 82 -24 109 -50 114 Z" fill="#888888" opacity=0.5 stroke="none"
plot curve_1 fn=4*t-t*t range=0,4 samples=180 scaleX=100 scaleY=55 at -250,180 stroke="#58C4DD" strokeWidth=4 fill="none"
plot curve_2 fn=0.8*t*t-3*t+4 range=0,4 samples=180 scaleX=100 scaleY=55 at -250,180 stroke="#83C167" strokeWidth=4 fill="none"

line line_1 x1=-50 y1=180 x2=-50 y2=-40 stroke="#FFFF00" strokeWidth=4
line line_2 x1=50 y1=180 x2=50 y2=15 stroke="#FFFF00" strokeWidth=4

wait 1s
