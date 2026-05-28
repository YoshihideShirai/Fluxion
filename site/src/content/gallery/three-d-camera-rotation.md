---
title: ThreeDCameraRotation
description: "Manim Example: `ThreeDCameraRotation` (`#threedcamerarotation`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedcamerarotation
source_example_path: examples/gallery/three-d-camera-rotation.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D camera は未実装のため、`ThreeDAxes` と `Circle` の投影済み座標を短い theta sweep として手動補間し、`begin_ambient_camera_rotation` / `move_camera` の見た目を近似している。"
    layer: runtime
    impact: medium
    workaround: "公式の `set_camera_orientation(phi=75°, theta=30°)` と `begin_ambient_camera_rotation(rate=0.1)` に合わせ、default `Circle()` の半径 1 を `projectedCircle` から生成し、1秒分の theta 変化を axes/circle/tick の座標補間へ展開する。"
    closure_condition: "3D座標系/カメラ回転（phi/theta/gamma）を runtime でネイティブ実装する。"
    fidelity_upgrade_condition: "Manim の `begin_ambient_camera_rotation` と `move_camera` を同等パラメータで再現できる時。"
category: Manim Stable Examples
status: ported
priority: high
gap_id: GAP-028
order: 75
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

animate x_axis_pos.x2 from -227 to -191 duration=1s easing=linear
animate x_axis_pos.y2 from 102 to 107 duration=1s easing=linear
animate x_axis_tip.d from "M -227 102 L -213.5 88.2 L -207.7 101 Z" to "M -191 107 L -178.7 92.1 L -171.9 104.3 Z" duration=1s easing=linear
animate x_axis_neg.x2 from 145 to 117 duration=1s easing=linear
animate x_axis_neg.y2 from -65 to -69 duration=1s easing=linear
animate y_axis_pos.x2 from 351 to 372 duration=1s easing=linear
animate y_axis_pos.y2 from 53 to 43 duration=1s easing=linear
animate y_axis_tip.d from "M 351 53 L 332.2 57.2 L 334.2 43.4 Z" to "M 372 43 L 353.3 47.9 L 354.9 34 Z" duration=1s easing=linear
animate y_axis_neg.x2 from -272 to -285 duration=1s easing=linear
animate y_axis_neg.y2 from -41 to -34 duration=1s easing=linear
animate circle_xy.d from "M -56.75 25.5 C -8.287013 32.817773 56.40784 27.333261 87.75 13.25 C 119.09216 -0.833261 105.212987 -18.182227 56.75 -25.5 C 8.287013 -32.817773 -56.40784 -27.333261 -87.75 -13.25 C -119.09216 0.833261 -105.212987 18.182227 -56.75 25.5 Z" to "M -50.746 25.373 C 7.463 31.343 71.642 22.388 89.552 10.448 C 116.418 -8.955 80.597 -26.866 46.269 -23.881 C -10.448 -26.866 -80.597 -17.91 -85.075 -10.448 C -111.94 8.955 -88.06 20.896 -50.746 25.373 Z" duration=1s easing=linear
animate x_tick_pos1.x from -57 to -48 duration=1s easing=linear
animate x_tick_pos1.y from 54 to 55 duration=1s easing=linear
animate x_tick_pos2.x from -113 to -95 duration=1s easing=linear
animate x_tick_pos2.y from 79 to 82 duration=1s easing=linear
animate x_tick_pos3.x from -170 to -143 duration=1s easing=linear
animate x_tick_pos3.y from 105 to 108 duration=1s easing=linear
animate x_tick_neg1.x from 36 to 29 duration=1s easing=linear
animate x_tick_neg1.y from 12 to 11 duration=1s easing=linear
animate x_tick_neg2.x from 73 to 59 duration=1s easing=linear
animate x_tick_neg2.y from -4 to -6 duration=1s easing=linear
animate y_tick_pos1.x from 88 to 93 duration=1s easing=linear
animate y_tick_pos1.y from 41 to 39 duration=1s easing=linear
animate y_tick_pos2.x from 176 to 186 duration=1s easing=linear
animate y_tick_pos2.y from 55 to 50 duration=1s easing=linear
animate y_tick_pos3.x from 263 to 279 duration=1s easing=linear
animate y_tick_pos3.y from 68 to 60 duration=1s easing=linear
animate y_tick_neg1.x from -68 to -71 duration=1s easing=linear
animate y_tick_neg1.y from 18 to 20 duration=1s easing=linear
animate y_tick_neg2.x from -136 to -142 duration=1s easing=linear
animate y_tick_neg2.y from 8 to 11 duration=1s easing=linear
animate x_axis_pos.x2 from -191 to -227 start=1s duration=1s easing=easeInOut
animate x_axis_pos.y2 from 107 to 102 start=1s duration=1s easing=easeInOut
animate x_axis_tip.d from "M -191 107 L -178.7 92.1 L -171.9 104.3 Z" to "M -227 102 L -213.5 88.2 L -207.7 101 Z" start=1s duration=1s easing=easeInOut
animate x_axis_neg.x2 from 117 to 145 start=1s duration=1s easing=easeInOut
animate x_axis_neg.y2 from -69 to -65 start=1s duration=1s easing=easeInOut
animate y_axis_pos.x2 from 372 to 351 start=1s duration=1s easing=easeInOut
animate y_axis_pos.y2 from 43 to 53 start=1s duration=1s easing=easeInOut
animate y_axis_tip.d from "M 372 43 L 353.3 47.9 L 354.9 34 Z" to "M 351 53 L 332.2 57.2 L 334.2 43.4 Z" start=1s duration=1s easing=easeInOut
animate y_axis_neg.x2 from -285 to -272 start=1s duration=1s easing=easeInOut
animate y_axis_neg.y2 from -34 to -41 start=1s duration=1s easing=easeInOut
animate circle_xy.d from "M -50.746 25.373 C 7.463 31.343 71.642 22.388 89.552 10.448 C 116.418 -8.955 80.597 -26.866 46.269 -23.881 C -10.448 -26.866 -80.597 -17.91 -85.075 -10.448 C -111.94 8.955 -88.06 20.896 -50.746 25.373 Z" to "M -56.75 25.5 C -8.287013 32.817773 56.40784 27.333261 87.75 13.25 C 119.09216 -0.833261 105.212987 -18.182227 56.75 -25.5 C 8.287013 -32.817773 -56.40784 -27.333261 -87.75 -13.25 C -119.09216 0.833261 -105.212987 18.182227 -56.75 25.5 Z" start=1s duration=1s easing=easeInOut
animate x_tick_pos1.x from -48 to -57 start=1s duration=1s easing=easeInOut
animate x_tick_pos1.y from 55 to 54 start=1s duration=1s easing=easeInOut
animate x_tick_pos2.x from -95 to -113 start=1s duration=1s easing=easeInOut
animate x_tick_pos2.y from 82 to 79 start=1s duration=1s easing=easeInOut
animate x_tick_pos3.x from -143 to -170 start=1s duration=1s easing=easeInOut
animate x_tick_pos3.y from 108 to 105 start=1s duration=1s easing=easeInOut
animate x_tick_neg1.x from 29 to 36 start=1s duration=1s easing=easeInOut
animate x_tick_neg1.y from 11 to 12 start=1s duration=1s easing=easeInOut
animate x_tick_neg2.x from 59 to 73 start=1s duration=1s easing=easeInOut
animate x_tick_neg2.y from -6 to -4 start=1s duration=1s easing=easeInOut
animate y_tick_pos1.x from 93 to 88 start=1s duration=1s easing=easeInOut
animate y_tick_pos1.y from 39 to 41 start=1s duration=1s easing=easeInOut
animate y_tick_pos2.x from 186 to 176 start=1s duration=1s easing=easeInOut
animate y_tick_pos2.y from 50 to 55 start=1s duration=1s easing=easeInOut
animate y_tick_pos3.x from 279 to 263 start=1s duration=1s easing=easeInOut
animate y_tick_pos3.y from 60 to 68 start=1s duration=1s easing=easeInOut
animate y_tick_neg1.x from -71 to -68 start=1s duration=1s easing=easeInOut
animate y_tick_neg1.y from 20 to 18 start=1s duration=1s easing=easeInOut
animate y_tick_neg2.x from -142 to -136 start=1s duration=1s easing=easeInOut
animate y_tick_neg2.y from 11 to 8 start=1s duration=1s easing=easeInOut
wait 3s
