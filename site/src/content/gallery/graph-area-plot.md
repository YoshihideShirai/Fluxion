---
title: GraphAreaPlot
description: "Manim Example: `GraphAreaPlot` (`#graphareaplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#graphareaplot
source_example_path: examples/gallery/graph-area-plot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の `Axes.get_riemann_rectangles` と `Axes.get_area(... bounded_graph=...)` は、`dataRiemannRects` と `dataArea` が axes データ座標から静的 geometry を生成している。宣言順は公式 `self.add(ax, labels, curve_1, curve_2, line_1, line_2, riemann_area, area)` に合わせて、半透明領域を曲線/縦線より前面に置く。"
    layer: dsl
    impact: low
    workaround: "`axes`、`axisLabels`、`plot`、`dataLine`、`dataRiemannRects`、`dataArea` で公式式から各 geometry を生成し、`dataArea` は上下境界を滑らかな cubic path、左右境界を直線として閉じる。`get_axis_labels()` の x/y ラベルは軸端の `UR` 配置へ近似し、公式の add 順でSVG z-orderを保つ。"
    closure_condition: "Manim と同じ `Axes.get_riemann_rectangles` / `Axes.get_area` API を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 64
gap_id: GAP-016
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

axes ax at 0,0 width=810 height=405 xRange=0,5 yRange=0,6 stroke="#FFFFFF" strokeWidth=2 xTicks=0,1,2,3,4,5 yTicks=1,2,3,4,5,6 xNumbers=2,3 tickLength=12 tickStrokeWidth=2 numberSize=22 numberColor="#FFFFFF" xNumberOffset=28
axisLabels axis_labels axes=ax x="x" y="y" size=28 fill="#FFFFFF" buff=20

plot curve_1 fn=4*t-t*t range=0,4 samples=180 scaleX=162 scaleY=67.5 at -405,202.5 stroke="#58C4DD" strokeWidth=4 fill="none"
plot curve_2 fn=0.8*t*t-3*t+4 range=0,4 samples=180 scaleX=162 scaleY=67.5 at -405,202.5 stroke="#83C167" strokeWidth=4 fill="none"

dataLine line_1 axes=ax from=2,0 to=2,4*2-2*2 stroke="#FFFF00" strokeWidth=4
dataLine line_2 axes=ax from=3,0 to=3,4*3-3*3 stroke="#FFFF00" strokeWidth=4
dataRiemannRects riemann axes=ax fn=4*t-t*t range=0.3,0.6 dx=0.03 fill="#0000FF" stroke="#000000" strokeWidth=1 fillOpacity=0.5
dataArea bounded_area axes=ax lower=0.8*t*t-3*t+4 upper=4*t-t*t range=2,3 samples=48 fill="#888888" fillOpacity=0.5 stroke="none"

wait 1s
