---
title: ArgMinExample
description: "Manim Example: `ArgMinExample` (`#argminexample`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#argminexample
source_example_path: examples/gallery/arg-min-example.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の `Axes.coords_to_point` / dot updater は、`axes` と `dataDot` がデータ座標から `bindExpr` へ展開している。"
    layer: dsl
    impact: low
    workaround: "`get_axis_labels(x_label=\"x\", y_label=\"f(x)\")` は `axisLabels` helper で軸端の `UR` 配置へ近似し、`t` value を animate し、公式 `Dot()` 既定半径の `dataDot point=t,2*(t-5)*(t-5)` で dot の scene 座標を再計算する。最後の既定 `self.wait()` は明示時刻の hold として保持する。"
    closure_condition: "updater callback を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 60
gap_id: GAP-013
---
scene width=960 height=540 fps=60

value t = 0

rect bg w=960 h=540 at 0,0 fill="#000000"

axes ax at 0,0 width=810 height=405 xRange=0,10 yRange=0,100 stroke="#FFFFFF" strokeWidth=3 xTicks=0,1,2,3,4,5,6,7,8,9,10 yTicks=10,20,30,40,50,60,70,80,90,100 tickLength=12 tickStrokeWidth=2
axisLabels axis_labels axes=ax x="x" y="f(x)" size=28 fill="#FFFFFF" buff=20

plot graph fn=2*(t-5)*(t-5) range=0,10 samples=220 scaleX=81 scaleY=4.05 at -405,202.5 stroke="#C55F73" strokeWidth=4 fill="none"
dataDot dot axes=ax point=t,2*(t-5)*(t-5) r=5.4 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

animate t from 0 to 4.974874372 start=0s duration=1s
at 1s:
  wait 1s
