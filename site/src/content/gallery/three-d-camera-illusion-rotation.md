---
title: ThreeDCameraIllusionRotation
description: "Manim Example: `ThreeDCameraIllusionRotation` (`#threedcameraillusionrotation`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedcameraillusionrotation
source_example_path: examples/gallery/three-d-camera-illusion-rotation.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D camera illusion は未実装のため、投影済み ThreeDAxes/Circle の座標を `0.2*sin(t)` theta / `0.1*cos(t)-0.1` phi の2段階変化として手動補間している。"
    layer: runtime
    impact: medium
    workaround: "公式の `begin_3dillusion_camera_rotation(rate=2)` と `wait(PI/2)` に合わせ、途中の theta 最大点と終了時の phi 低下点を line/path の座標補間へ展開する。"
    closure_condition: "3Dカメラ姿勢パラメータ（phi/theta/gamma）と透視投影、Dot3D を runtime へ実装する。"
    fidelity_upgrade_condition: "Manim の `begin_3dillusion_camera_rotation` を同等パラメータで再現できる時。"
category: Manim Stable Examples
status: ported
priority: high
gap_id: GAP-027
order: 74
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

line x_axis_pos x1=0 y1=0 x2=-227 y2=102 at 0,28 stroke="#FFFFFF" strokeWidth=4
line x_axis_neg x1=0 y1=0 x2=145 y2=-65 at 0,28 stroke="#FFFFFF" strokeWidth=4
line y_axis_pos x1=0 y1=0 x2=351 y2=53 at 0,28 stroke="#FFFFFF" strokeWidth=4
line y_axis_neg x1=0 y1=0 x2=-272 y2=-41 at 0,28 stroke="#FFFFFF" strokeWidth=4
line z_axis_pos x1=0 y1=0 x2=0 y2=-221 at 0,28 stroke="#FFFFFF" strokeWidth=4
line z_axis_neg x1=0 y1=0 x2=0 y2=203 at 0,28 stroke="#FFFFFF" strokeWidth=4

path circle_xy d="M -35 16 C 3 21 47 17 60 9 C 79 -3 56 -16 32 -15 C -6 -18 -53 -14 -57 -9 C -76 3 -60 12 -35 16 Z" at 0,28 fill="none" stroke="#FFFFFF" strokeWidth=4

group world x_axis_pos x_axis_neg y_axis_pos y_axis_neg z_axis_pos z_axis_neg circle_xy

animate x_axis_pos.x2 from -227 to -153 duration=0.785s easing=easeInOut
animate x_axis_pos.y2 from 102 to 106 duration=0.785s easing=easeInOut
animate x_axis_neg.x2 from 145 to 88 duration=0.785s easing=easeInOut
animate x_axis_neg.y2 from -65 to -69 duration=0.785s easing=easeInOut
animate y_axis_pos.x2 from 351 to 389 duration=0.785s easing=easeInOut
animate y_axis_pos.y2 from 53 to 30 duration=0.785s easing=easeInOut
animate y_axis_neg.x2 from -272 to -295 duration=0.785s easing=easeInOut
animate y_axis_neg.y2 from -41 to -26 duration=0.785s easing=easeInOut
animate z_axis_pos.y2 from -221 to -205 duration=0.785s easing=easeInOut
animate z_axis_neg.y2 from 203 to 188 duration=0.785s easing=easeInOut
animate circle_xy.d from "M -35 16 C 3 21 47 17 60 9 C 79 -3 56 -16 32 -15 C -6 -18 -53 -14 -57 -9 C -76 3 -60 12 -35 16 Z" to "M -32 17 C 6 20 49 13 60 4 C 77 -8 52 -19 29 -16 C -9 -17 -54 -10 -57 -5 C -74 8 -57 15 -32 17 Z" duration=0.785s easing=easeInOut
animate x_axis_pos.x2 from -153 to -227 start=0.785s duration=0.785s easing=easeInOut
animate x_axis_pos.y2 from 106 to 90 start=0.785s duration=0.785s easing=easeInOut
animate x_axis_neg.x2 from 88 to 145 start=0.785s duration=0.785s easing=easeInOut
animate x_axis_neg.y2 from -69 to -57 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_pos.x2 from 389 to 351 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_pos.y2 from 30 to 47 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_neg.x2 from -295 to -272 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_neg.y2 from -26 to -36 start=0.785s duration=0.785s easing=easeInOut
animate z_axis_pos.y2 from -205 to -185 start=0.785s duration=0.785s easing=easeInOut
animate z_axis_neg.y2 from 188 to 170 start=0.785s duration=0.785s easing=easeInOut
animate circle_xy.d from "M -32 17 C 6 20 49 13 60 4 C 77 -8 52 -19 29 -16 C -9 -17 -54 -10 -57 -5 C -74 8 -57 15 -32 17 Z" to "M -35 14 C 3 18 47 15 60 8 C 79 -3 56 -14 32 -13 C -6 -16 -53 -12 -57 -8 C -76 3 -60 11 -35 14 Z" start=0.785s duration=0.785s easing=easeInOut
