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
    workaround: "公式 `Axes(..., x_length=6, y_length=6, include_tip=False)` を 405x405px の正方形軸へ展開し、`axes` helper の座標変換を使って `dataRect from=0,0 to=t,25/t` と `dataDot point=t,25/t` で updater 結果を生成する。`Create(polygon)` だけを1秒で描き、その後の3つの `t.animate.set_value(...)` を公式 cadence で連続させる。"
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

axes ax at 0,0 width=405 height=405 xRange=0,10 yRange=0,10 stroke="#FFFFFF" strokeWidth=3 xTicks=0,1,2,3,4,5,6,7,8,9,10 yTicks=0,1,2,3,4,5,6,7,8,9,10 tickLength=12 tickStrokeWidth=2
plot graph fn=25/t range=2.5,10 samples=220 scaleX=40.5 scaleY=40.5 at -202.5,202.5 stroke="#F4D345" strokeWidth=4 fill="none"
dataRect area axes=ax from=0,0 to=t,25/t fill="#58C4DD" fillOpacity=0.5 stroke="#FFEA94" strokeWidth=1
dataDot dot axes=ax point=t,25/t r=5.4 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

at 0s:
  play Create(area) duration=1s

animate t from 5 to 10 start=1s duration=1s easing=smooth
animate t from 10 to 2.5 start=2s duration=1s easing=smooth
animate t from 2.5 to 5 start=3s duration=1s easing=smooth
