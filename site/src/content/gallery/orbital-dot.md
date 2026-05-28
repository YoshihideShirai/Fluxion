---
title: PointMovingOnShapes
description: "Manim Example: `PointMovingOnShapes` (`#pointmovingonshapes`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointmovingonshapes
source_example_path: examples/gallery/orbital_dot.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "MoveAlongPath and Rotating are represented by DSL-native play primitives for circular/OUT-axis motion. GrowFromCenter, Transform, the 2s linear circle traversal, the 1.5s linear Rotating turn, and the final default wait are ordered to match the source choreography."
    layer: dsl
    impact: low
    workaround: "Manim frame scale 67.5px/unit で `Circle(radius=1)`, default `Dot()`, `Line([3,0,0],[5,0,0])`, `about_point=[2,0,0]` を展開し、画面Y方向は Manim の上向き座標から反転している。"
    closure_condition: "General path MoveAlongPath / non-OUT-axis Rotating support is implemented."
    fidelity_upgrade_condition: "追加対応不要。"
category: Animations
status: ported
gap_id: GAP-007
order: 21
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle orbit r=67.5 at 0,0 fill="none" stroke="#58C4DD" strokeWidth=4 opacity=0 scale=0
circle dot r=5.4 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=0
line guide x1=202.5 y1=0 x2=337.5 y2=0 stroke="#FFFFFF" strokeWidth=4

at 0s:
  animate orbit.opacity from 0 to 1 duration=1s easing=smooth
  animate orbit.scale from 0 to 1 duration=1s easing=smooth
at 1s:
  animate dot.x from 0 to 67.5 duration=1s easing=smooth
at 2s:
  play MoveAlongPath(dot, orbit) duration=2s easing=linear
at 4s:
  play Rotating(dot, 6.283185307, about=(135,0)) duration=1.5s easing=linear
at 5.5s:
  wait 1s
