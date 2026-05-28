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
    workaround: "公式の `begin_3dillusion_camera_rotation(rate=2)` と `wait(PI/2)` に合わせ、default `Circle()` の半径 1 を `projectedCircle` から生成し、途中の theta 最大点と終了時の phi 低下点を axes/circle/tick の座標補間へ展開する。"
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
path x_axis_tip d="M -227 102 L -213.5 88.2 L -207.7 101 Z" at 0,28 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=0
path y_axis_tip d="M 351 53 L 332.2 57.2 L 334.2 43.4 Z" at 0,28 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=0
path z_axis_tip d="M 0 -221 L 7 -203 L -7 -203 Z" at 0,28 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=0

line x_tick_pos1 x1=-4 y1=10 x2=4 y2=-10 at -57,54 stroke="#FFFFFF" strokeWidth=2
line x_tick_pos2 x1=-4 y1=10 x2=4 y2=-10 at -113,79 stroke="#FFFFFF" strokeWidth=2
line x_tick_pos3 x1=-4 y1=10 x2=4 y2=-10 at -170,105 stroke="#FFFFFF" strokeWidth=2
line x_tick_neg1 x1=-4 y1=10 x2=4 y2=-10 at 36,12 stroke="#FFFFFF" strokeWidth=2
line x_tick_neg2 x1=-4 y1=10 x2=4 y2=-10 at 73,-4 stroke="#FFFFFF" strokeWidth=2
line y_tick_pos1 x1=-4 y1=-10 x2=4 y2=10 at 88,41 stroke="#FFFFFF" strokeWidth=2
line y_tick_pos2 x1=-4 y1=-10 x2=4 y2=10 at 176,55 stroke="#FFFFFF" strokeWidth=2
line y_tick_pos3 x1=-4 y1=-10 x2=4 y2=10 at 263,68 stroke="#FFFFFF" strokeWidth=2
line y_tick_neg1 x1=-4 y1=-10 x2=4 y2=10 at -68,18 stroke="#FFFFFF" strokeWidth=2
line y_tick_neg2 x1=-4 y1=-10 x2=4 y2=10 at -136,8 stroke="#FFFFFF" strokeWidth=2
line z_tick_pos1 x1=-10 y1=0 x2=10 y2=0 at 0,-27 stroke="#FFFFFF" strokeWidth=2
line z_tick_pos2 x1=-10 y1=0 x2=10 y2=0 at 0,-82 stroke="#FFFFFF" strokeWidth=2
line z_tick_pos3 x1=-10 y1=0 x2=10 y2=0 at 0,-138 stroke="#FFFFFF" strokeWidth=2
line z_tick_neg1 x1=-10 y1=0 x2=10 y2=0 at 0,79 stroke="#FFFFFF" strokeWidth=2
line z_tick_neg2 x1=-10 y1=0 x2=10 y2=0 at 0,130 stroke="#FFFFFF" strokeWidth=2

projectedCircle circle_xy radius=1 at 0,28 xBasis=-56.75,25.5 yBasis=87.75,13.25 fill="none" stroke="#FFFFFF" strokeWidth=4

group world x_axis_pos x_axis_neg y_axis_pos y_axis_neg z_axis_pos z_axis_neg x_axis_tip y_axis_tip z_axis_tip x_tick_pos1 x_tick_pos2 x_tick_pos3 x_tick_neg1 x_tick_neg2 y_tick_pos1 y_tick_pos2 y_tick_pos3 y_tick_neg1 y_tick_neg2 z_tick_pos1 z_tick_pos2 z_tick_pos3 z_tick_neg1 z_tick_neg2 circle_xy

animate x_axis_pos.x2 from -227 to -153 duration=0.785s easing=easeInOut
animate x_axis_pos.y2 from 102 to 106 duration=0.785s easing=easeInOut
animate x_axis_tip.d from "M -227 102 L -213.5 88.2 L -207.7 101 Z" to "M -153 106 L -142.2 90 L -134.2 101.5 Z" duration=0.785s easing=easeInOut
animate x_axis_neg.x2 from 145 to 88 duration=0.785s easing=easeInOut
animate x_axis_neg.y2 from -65 to -69 duration=0.785s easing=easeInOut
animate y_axis_pos.x2 from 351 to 389 duration=0.785s easing=easeInOut
animate y_axis_pos.y2 from 53 to 30 duration=0.785s easing=easeInOut
animate y_axis_tip.d from "M 351 53 L 332.2 57.2 L 334.2 43.4 Z" to "M 389 30 L 370.5 35.6 L 371.6 21.6 Z" duration=0.785s easing=easeInOut
animate y_axis_neg.x2 from -272 to -295 duration=0.785s easing=easeInOut
animate y_axis_neg.y2 from -41 to -26 duration=0.785s easing=easeInOut
animate z_axis_pos.y2 from -221 to -205 duration=0.785s easing=easeInOut
animate z_axis_neg.y2 from 203 to 188 duration=0.785s easing=easeInOut
animate z_axis_tip.d from "M 0 -221 L 7 -203 L -7 -203 Z" to "M 0 -205 L 7 -187 L -7 -187 Z" duration=0.785s easing=easeInOut
animate circle_xy.d from "M -56.75 25.5 C -8.287013 32.817773 56.40784 27.333261 87.75 13.25 C 119.09216 -0.833261 105.212987 -18.182227 56.75 -25.5 C 8.287013 -32.817773 -56.40784 -27.333261 -87.75 -13.25 C -119.09216 0.833261 -105.212987 18.182227 -56.75 25.5 Z" to "M -47.761 25.373 C 8.955 29.851 73.134 19.403 89.552 5.97 C 114.925 -11.94 77.612 -28.358 43.284 -23.881 C -13.433 -25.373 -80.597 -14.925 -85.075 -7.463 C -110.448 11.94 -85.075 22.388 -47.761 25.373 Z" duration=0.785s easing=easeInOut
animate x_tick_pos1.x from -57 to -38 duration=0.785s easing=easeInOut
animate x_tick_pos1.y from 54 to 55 duration=0.785s easing=easeInOut
animate x_tick_pos2.x from -113 to -76 duration=0.785s easing=easeInOut
animate x_tick_pos2.y from 79 to 81 duration=0.785s easing=easeInOut
animate x_tick_pos3.x from -170 to -115 duration=0.785s easing=easeInOut
animate x_tick_pos3.y from 105 to 108 duration=0.785s easing=easeInOut
animate x_tick_neg1.x from 36 to 22 duration=0.785s easing=easeInOut
animate x_tick_neg1.y from 12 to 11 duration=0.785s easing=easeInOut
animate x_tick_neg2.x from 73 to 44 duration=0.785s easing=easeInOut
animate x_tick_neg2.y from -4 to -6 duration=0.785s easing=easeInOut
animate y_tick_pos1.x from 88 to 97 duration=0.785s easing=easeInOut
animate y_tick_pos1.y from 41 to 36 duration=0.785s easing=easeInOut
animate y_tick_pos2.x from 176 to 195 duration=0.785s easing=easeInOut
animate y_tick_pos2.y from 55 to 43 duration=0.785s easing=easeInOut
animate y_tick_pos3.x from 263 to 292 duration=0.785s easing=easeInOut
animate y_tick_pos3.y from 68 to 51 duration=0.785s easing=easeInOut
animate y_tick_neg1.x from -68 to -74 duration=0.785s easing=easeInOut
animate y_tick_neg1.y from 18 to 22 duration=0.785s easing=easeInOut
animate y_tick_neg2.x from -136 to -147 duration=0.785s easing=easeInOut
animate y_tick_neg2.y from 8 to 15 duration=0.785s easing=easeInOut
animate z_tick_pos1.y from -27 to -23 duration=0.785s easing=easeInOut
animate z_tick_pos2.y from -82 to -74 duration=0.785s easing=easeInOut
animate z_tick_pos3.y from -138 to -126 duration=0.785s easing=easeInOut
animate z_tick_neg1.y from 79 to 75 duration=0.785s easing=easeInOut
animate z_tick_neg2.y from 130 to 122 duration=0.785s easing=easeInOut
animate x_axis_pos.x2 from -153 to -227 start=0.785s duration=0.785s easing=easeInOut
animate x_axis_pos.y2 from 106 to 90 start=0.785s duration=0.785s easing=easeInOut
animate x_axis_tip.d from "M -153 106 L -142.2 90 L -134.2 101.5 Z" to "M -227 90 L -212.8 76.9 L -207.7 89.9 Z" start=0.785s duration=0.785s easing=easeInOut
animate x_axis_neg.x2 from 88 to 145 start=0.785s duration=0.785s easing=easeInOut
animate x_axis_neg.y2 from -69 to -57 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_pos.x2 from 389 to 351 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_pos.y2 from 30 to 47 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_tip.d from "M 389 30 L 370.5 35.6 L 371.6 21.6 Z" to "M 351 47 L 332.2 51.5 L 334.1 37.7 Z" start=0.785s duration=0.785s easing=easeInOut
animate y_axis_neg.x2 from -295 to -272 start=0.785s duration=0.785s easing=easeInOut
animate y_axis_neg.y2 from -26 to -36 start=0.785s duration=0.785s easing=easeInOut
animate z_axis_pos.y2 from -205 to -185 start=0.785s duration=0.785s easing=easeInOut
animate z_axis_neg.y2 from 188 to 170 start=0.785s duration=0.785s easing=easeInOut
animate z_axis_tip.d from "M 0 -205 L 7 -187 L -7 -187 Z" to "M 0 -185 L 7 -167 L -7 -167 Z" start=0.785s duration=0.785s easing=easeInOut
animate circle_xy.d from "M -47.761 25.373 C 8.955 29.851 73.134 19.403 89.552 5.97 C 114.925 -11.94 77.612 -28.358 43.284 -23.881 C -13.433 -25.373 -80.597 -14.925 -85.075 -7.463 C -110.448 11.94 -85.075 22.388 -47.761 25.373 Z" to "M -52.239 20.896 C 4.478 26.866 70.149 22.388 89.552 11.94 C 117.91 -4.478 83.582 -20.896 47.761 -19.403 C -8.955 -23.881 -79.104 -17.91 -85.075 -11.94 C -113.433 4.478 -89.552 16.418 -52.239 20.896 Z" start=0.785s duration=0.785s easing=easeInOut
animate x_tick_pos1.x from -38 to -57 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_pos1.y from 55 to 51 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_pos2.x from -76 to -113 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_pos2.y from 81 to 73 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_pos3.x from -115 to -170 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_pos3.y from 108 to 96 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_neg1.x from 22 to 36 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_neg1.y from 11 to 14 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_neg2.x from 44 to 73 start=0.785s duration=0.785s easing=easeInOut
animate x_tick_neg2.y from -6 to 0 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_pos1.x from 97 to 88 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_pos1.y from 36 to 40 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_pos2.x from 195 to 176 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_pos2.y from 43 to 52 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_pos3.x from 292 to 263 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_pos3.y from 51 to 63 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_neg1.x from -74 to -68 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_neg1.y from 22 to 19 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_neg2.x from -147 to -136 start=0.785s duration=0.785s easing=easeInOut
animate y_tick_neg2.y from 15 to 10 start=0.785s duration=0.785s easing=easeInOut
animate z_tick_pos1.y from -23 to -18 start=0.785s duration=0.785s easing=easeInOut
animate z_tick_pos2.y from -74 to -64 start=0.785s duration=0.785s easing=easeInOut
animate z_tick_pos3.y from -126 to -111 start=0.785s duration=0.785s easing=easeInOut
animate z_tick_neg1.y from 75 to 71 start=0.785s duration=0.785s easing=easeInOut
animate z_tick_neg2.y from 122 to 113 start=0.785s duration=0.785s easing=easeInOut
