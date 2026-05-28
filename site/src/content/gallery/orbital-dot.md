---
title: PointMovingOnShapes
description: "Manim Example: `PointMovingOnShapes` (`#pointmovingonshapes`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointmovingonshapes
source_example_path: examples/gallery/orbital_dot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "MoveAlongPath and Rotating are expanded to value trackers and expression bindings; GrowFromCenter and Transform are ordered to match the source choreography."
    layer: dsl
    impact: low
    workaround: "必要な微調整は value tracker の式と duration で補う。"
    closure_condition: "MoveAlongPath/Rotating を DSL の高水準 animation として直接記述できる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Animations
status: ported
order: 21
---
scene width=960 height=540 fps=60
value theta = 0
value phi = 3.141592654

rect bg w=960 h=540 at 0,0 fill="#000000"
circle orbit r=80 at 0,0 fill="none" stroke="#58C4DD" strokeWidth=4 opacity=0 scale=0
circle dot r=8 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2
line guide x1=240 y1=0 x2=400 y2=0 stroke="#FFFFFF" strokeWidth=4

at 0s:
  animate orbit.opacity from 0 to 1 duration=1s easing=smooth
  animate orbit.scale from 0 to 1 duration=1s easing=smooth
at 1s:
  animate dot.x from 0 to 80 duration=1s easing=smooth
at 2s:
  always dot.x = expr=80*cos(theta)
  always dot.y = expr=80*sin(theta)
  animate theta from 0 to 6.283185307 duration=2s easing=linear
at 4s:
  always dot.x = expr=160+80*cos(phi)
  always dot.y = expr=80*sin(phi)
  animate phi from 3.141592654 to 9.424777961 duration=1.5s easing=smooth
wait 1s
