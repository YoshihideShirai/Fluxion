---
title: HeatDiagramPlot
description: "Manim Example: `HeatDiagramPlot` (`#heatdiagramplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#heatdiagramplot
source_example_path: examples/gallery/heat-diagram-plot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Fluxion の axes helper は非対称 range の原点位置をまだ再現しないため、軸・目盛・折れ線を手描きで配置している。視覚構成は公式出力に合わせている。"
    layer: dsl
    impact: low
    workaround: "Manim の `Axes(...).plot_line_graph(...)` 出力に合わせて、line/path/text を明示配置する。"
    closure_condition: "Axes helper が x/y range に応じた原点位置、tick labels、line graph を生成できる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 65
gap_id: GAP-018
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
line x_axis x1=-270 y1=108 x2=270 y2=108 at 0,-20 stroke="#FFFFFF" strokeWidth=3
line y_axis x1=-270 y1=-180 x2=-270 y2=180 at 0,-20 stroke="#FFFFFF" strokeWidth=3
line x_tick_0 x1=0 y1=-7 x2=0 y2=7 at -270,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_5 x1=0 y1=-7 x2=0 y2=7 at -202.5,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_10 x1=0 y1=-7 x2=0 y2=7 at -135,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_15 x1=0 y1=-7 x2=0 y2=7 at -67.5,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_20 x1=0 y1=-7 x2=0 y2=7 at 0,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_25 x1=0 y1=-7 x2=0 y2=7 at 67.5,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_30 x1=0 y1=-7 x2=0 y2=7 at 135,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_35 x1=0 y1=-7 x2=0 y2=7 at 202.5,88 stroke="#FFFFFF" strokeWidth=2
line x_tick_40 x1=0 y1=-7 x2=0 y2=7 at 270,88 stroke="#FFFFFF" strokeWidth=2
line y_tick_m5 x1=-7 y1=0 x2=7 y2=0 at -270,133 stroke="#FFFFFF" strokeWidth=2
line y_tick_0 x1=-7 y1=0 x2=7 y2=0 at -270,88 stroke="#FFFFFF" strokeWidth=2
line y_tick_5 x1=-7 y1=0 x2=7 y2=0 at -270,43 stroke="#FFFFFF" strokeWidth=2
line y_tick_10 x1=-7 y1=0 x2=7 y2=0 at -270,-2 stroke="#FFFFFF" strokeWidth=2
line y_tick_15 x1=-7 y1=0 x2=7 y2=0 at -270,-47 stroke="#FFFFFF" strokeWidth=2
line y_tick_20 x1=-7 y1=0 x2=7 y2=0 at -270,-92 stroke="#FFFFFF" strokeWidth=2
line y_tick_25 x1=-7 y1=0 x2=7 y2=0 at -270,-137 stroke="#FFFFFF" strokeWidth=2
line y_tick_30 x1=-7 y1=0 x2=7 y2=0 at -270,-182 stroke="#FFFFFF" strokeWidth=2
text x0 "0" at -270,124 size=18 fill="#FFFFFF"
text x5 "5" at -202.5,124 size=18 fill="#FFFFFF"
text x10 "10" at -135,124 size=18 fill="#FFFFFF"
text x15 "15" at -67.5,124 size=18 fill="#FFFFFF"
text x20 "20" at 0,124 size=18 fill="#FFFFFF"
text x25 "25" at 67.5,124 size=18 fill="#FFFFFF"
text x30 "30" at 135,124 size=18 fill="#FFFFFF"
text x35 "35" at 202.5,124 size=18 fill="#FFFFFF"
text x40 "40" at 270,124 size=18 fill="#FFFFFF"
text ym5 "-5" at -310,133 size=18 fill="#FFFFFF"
text y0 "0" at -300,88 size=18 fill="#FFFFFF"
text y5 "5" at -300,43 size=18 fill="#FFFFFF"
text y10 "10" at -306,-2 size=18 fill="#FFFFFF"
text y15 "15" at -306,-47 size=18 fill="#FFFFFF"
text y20 "20" at -306,-92 size=18 fill="#FFFFFF"
text y25 "25" at -306,-137 size=18 fill="#FFFFFF"
text y30 "30" at -306,-182 size=18 fill="#FFFFFF"
math x_label "\\Delta Q" at 330,96 size=32 fill="#FFFFFF" renderer=katex
math y_label "T[^\\circ C]" at -328,-222 size=30 fill="#FFFFFF" renderer=katex
path graph d="M -270 -72 L -162 108 L 243 108 L 256.5 153" at 0,-20 fill="none" stroke="#FFFF00" strokeWidth=4
circle p0 r=5 at -270,-92 fill="#FFFF00" stroke="#FFFF00" strokeWidth=0
circle p1 r=5 at -162,88 fill="#FFFF00" stroke="#FFFF00" strokeWidth=0
circle p2 r=5 at 243,88 fill="#FFFF00" stroke="#FFFF00" strokeWidth=0
circle p3 r=5 at 256.5,133 fill="#FFFF00" stroke="#FFFF00" strokeWidth=0
wait 1s
