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
    workaround: "`t` value を animate し、`dataDot point=t,2*(t-5)*(t-5)` で dot の scene 座標を再計算する。"
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
math x_label "x" at 447,203 size=28 fill="#FFFFFF"
math y_label "f(x)" at -403,-253 size=28 fill="#FFFFFF"

plot graph fn=2*(t-5)*(t-5) range=0,10 samples=220 scaleX=81 scaleY=4.05 at -405,202.5 stroke="#C55F73" strokeWidth=4 fill="none"
dataDot dot axes=ax point=t,2*(t-5)*(t-5) r=8 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2

animate t from 0 to 4.974874372 duration=1s
wait 1s
