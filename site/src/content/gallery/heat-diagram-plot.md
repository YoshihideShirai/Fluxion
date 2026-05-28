---
title: HeatDiagramPlot
description: "Manim Example: `HeatDiagramPlot` (`#heatdiagramplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#heatdiagramplot
source_example_path: examples/gallery/heat-diagram-plot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Axes の軸ラベルは `axisLabels` helper で軸端からの offset と x/y 個別サイズを指定している。非対称 range の原点、tick/number labels、`plot_line_graph` 相当の折れ線・vertex dots は helper から生成している。"
    layer: dsl
    impact: low
    workaround: "Manim の `Axes(...).get_axis_labels(...)` 相当として、`axisLabels` で軸ラベル math を軸端の `UR` 配置へ生成する。"
    closure_condition: "Manim と同じ `Axes.plot_line_graph` API を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 65
gap_id: GAP-018
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
axes ax at 0,-20 width=607.5 height=405 xRange=0,40 yRange=-8,32 stroke="#FFFFFF" strokeWidth=2 xNumbers=0,5,10,15,20,25,30,35 yNumbers=-5,0,5,10,15,20,25,30 tickLength=14 tickStrokeWidth=2 numberSize=18 numberColor="#FFFFFF" xNumberOffset=36 yNumberOffset=-38
axisLabels axis_labels axes=ax x="\\Delta Q" y="T[^\\circ C]" renderer=katex fill="#FFFFFF" xSize=32 ySize=30 xBuff=52.25 xYOffset=-23.5 yBuff=65.75 yYOffset=-22.5
dataLineGraph graph axes=ax points=0,20;8,0;38,0;39,-5 lineColor="#FFFF00" strokeWidth=4
wait 1s
