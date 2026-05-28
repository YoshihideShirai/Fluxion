---
title: HeatDiagramPlot
description: "Manim Example: `HeatDiagramPlot` (`#heatdiagramplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#heatdiagramplot
source_example_path: examples/gallery/heat-diagram-plot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Axes の軸ラベルは手配置だが、非対称 range の原点、tick/number labels、`plot_line_graph` 相当の折れ線・vertex dots は helper から生成している。"
    layer: dsl
    impact: low
    workaround: "Manim の `Axes(...).get_axis_labels(...)` 相当として、軸ラベル text/math を明示配置する。"
    closure_condition: "Axes helper が axis labels を生成できる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 65
gap_id: GAP-018
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
axes ax at 0,-20 width=607.5 height=405 xRange=0,40 yRange=-8,32 stroke="#FFFFFF" strokeWidth=3 xNumbers=0,5,10,15,20,25,30,35 yNumbers=-5,0,5,10,15,20,25,30 tickLength=14 tickStrokeWidth=2 numberSize=18 numberColor="#FFFFFF" xNumberOffset=36 yNumberOffset=-38
math x_label "\\Delta Q" at 367,112 size=32 fill="#FFFFFF" renderer=katex
math y_label "T[^\\circ C]" at -350,-248 size=30 fill="#FFFFFF" renderer=katex
dataLineGraph graph axes=ax points=0,20;8,0;38,0;39,-5 lineColor="#FFFF00" strokeWidth=4 vertexRadius=5.4
wait 1s
