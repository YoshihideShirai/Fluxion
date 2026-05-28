---
title: FollowingGraphCamera
description: "Manim Example: `FollowingGraphCamera` (`#followinggraphcamera`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#followinggraphcamera
source_example_path: examples/gallery/special-camera.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Axes and plot are helper-generated, but Manim's actual camera frame updater object lifecycle is still represented with value bindings."
    layer: dsl
    impact: medium
    workaround: "公式の `Axes(x_range=[-1, 10], y_range=[-1, 10])` は Manim `Axes` 既定 `x_length=round(frame_width)-2=12` / `y_length=round(frame_height)-2=6` を 67.5px/unit で 810x405px に展開し、`plot(..., x_range=[0, 3*PI])` と default `Dot()` 半径 0.08 も同じ frame scale に合わせる。`self.add(...)` 初期表示、1秒の zoom-in、1秒の `MoveAlongPath(..., rate_func=linear)`、1秒の `Restore` に合わせ、moving_dot と同じ式を `camera.target.x/y` に連続 bind して追従を再現する。"
    closure_condition: "不足 DSL 機能が追加され、近似なしで同等記述が可能になる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Special Camera Settings
status: ported
order: 40
---
scene width=960 height=540 fps=60
camera mode=target target=0,0 scale=1
cameraFrame at 0,0 scale=1
value theta = 0
value cameraFollow = 0
value cameraRestore = 0

rect bg w=960 h=540 at 0,0 fill="#000000"
axes ax at 0,0 width=810 height=405 xRange=-1,10 yRange=-1,10 stroke="#8a8a8a" strokeWidth=2 xTicks=-1,0,1,2,3,4,5,6,7,8,9,10 yTicks=-1,0,1,2,3,4,5,6,7,8,9,10 tickLength=12 tickStrokeWidth=2
plot graph fn="sin(t)" range=0,9.42477796076938 samples=220 at=-331.364,165.682 scaleX=73.636 scaleY=36.818 stroke="#58C4DD" strokeWidth=5
circle dot_start r=5.4 at -331.364,165.682 fill="#ffffff" stroke="none"
circle dot_end r=5.4 at 362.643,165.682 fill="#ffffff" stroke="none"
circle moving_dot r=5.4 at -331.364,165.682 fill="#ff862f" stroke="none"
always moving_dot.x = expr=-331.364 + (theta/(3*3.141592653589793))*694.007
always moving_dot.y = expr=165.682 - 36.818*sin(theta)
always camera.target.x = expr=cameraFollow*(1-cameraRestore)*(-331.364 + (theta/(3*pi))*694.007)
always camera.target.y = expr=cameraFollow*(1-cameraRestore)*(165.682 - 36.818*sin(theta))
at 1s:
  animate theta from 0 to 9.42477796076938 duration=1s easing=linear
animate cameraFollow from 0 to 1 start=0s duration=1s easing=easeInOut
animate camera.scale from 1 to 2 start=0s duration=1s easing=easeInOut
animate cameraRestore from 0 to 1 start=2s duration=1s easing=easeInOut
animate camera.scale from 2 to 1 start=2s duration=1s easing=easeInOut
