---
title: PolygonOnAxes
description: "Manim Example: `PolygonOnAxes` (`#polygononaxes`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#polygononaxes
source_example_path: examples/gallery/polygon-on-axes.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の `always_redraw(Polygon(... ax.c2p ...))` は、`dataRect` と `dataDot` が `axes` のデータ座標を `bindExpr` へ展開して再現している。"
    layer: dsl
    impact: low
    workaround: "`axes` helper の座標変換を使い、`dataRect from=0,0 to=t,25/t` と `dataDot point=t,25/t` で updater 結果を生成する。"
    closure_condition: "`always_redraw` 相当の動的 mobject 再生成を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 72
gap_id: GAP-025
---
scene width=960 height=540 fps=60

value t = 5

rect bg w=960 h=540 at 0,0 fill="#000000"

axes ax at 0,0 width=480 height=360 xRange=0,10 yRange=0,10 stroke="#FFFFFF" strokeWidth=3 xTicks=0,1,2,3,4,5,6,7,8,9,10 yTicks=0,1,2,3,4,5,6,7,8,9,10 tickLength=12 tickStrokeWidth=2
math x_label "x" at 268,180 size=28 fill="#FFFFFF"
math y_label "y" at -240,-210 size=28 fill="#FFFFFF"
plot graph fn=25/t range=2.5,10 samples=220 scaleX=48 scaleY=36 at -240,180 stroke="#E8C11C" strokeWidth=4 fill="none"
dataRect area axes=ax from=0,0 to=t,25/t fill="#58C4DD" fillOpacity=0.5 stroke="#F7D45A" strokeWidth=1
dataDot dot axes=ax point=t,25/t r=8 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

at 0s:
  play Create(ax) duration=0.8s
  play Create(graph) duration=0.8s
  play Create(area) duration=0.8s

wait 0.1s
animate t from 5 to 10 duration=1.0s easing=easeInOut
animate t from 10 to 2.5 duration=1.0s easing=easeInOut
animate t from 2.5 to 5 duration=1.0s easing=easeInOut
