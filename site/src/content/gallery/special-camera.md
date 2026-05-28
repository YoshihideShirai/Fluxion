---
title: FollowingGraphCamera
description: "Manim Example: `FollowingGraphCamera` (`#followinggraphcamera`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#followinggraphcamera
source_example_path: examples/gallery/special-camera.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Axes and plot are helper-generated, and the moving dot uses DSL-native plot `MoveAlongPath`; camera frame following uses `followCamera` to track the actual moving dot, while Manim's invisible MovingCamera frame mobject is represented by camera operations."
    layer: dsl
    impact: low
    workaround: "公式の `Axes(x_range=[-1, 10], y_range=[-1, 10])` は Manim `Axes` 既定 `x_length=round(frame_width)-2=12` / `y_length=round(frame_height)-2=6` を 67.5px/unit で 810x405px に展開し、`plot(..., x_range=[0, 3*PI])` と default `Dot()` 半径 0.08 も同じ frame scale に合わせる。`MoveAlongPath(..., rate_func=linear)` は DSL-native `MoveAlongPath(moving_dot, graph)` が Manim の `path.point_from_proportion()` と同じ曲線長比例で展開する。`self.add(...)` 初期表示、1秒の zoom-in、1秒の path follow、1秒の `Restore` に合わせ、`followCamera moving_dot` が animation 適用後の moving dot center を camera target に反映して Manim の `camera.frame.add_updater(lambda mob: mob.move_to(moving_dot.get_center()))` と同じ可視挙動を再現する。"
    closure_condition: "MovingCamera frame を一級 mobject として保持できるようになった場合、内部表現の差分も解消できる。"
    fidelity_upgrade_condition: "既に faithful。残る差分は不可視 frame mobject の内部表現とブラウザ描画差。"
category: Special Camera Settings
status: ported
gap_id: GAP-012
order: 40
---
scene width=960 height=540 fps=60
camera mode=target target=0,0 scale=1
cameraFrame at 0,0 scale=1

rect bg w=960 h=540 at 0,0 fill="#000000"
axes ax at 0,0 width=810 height=405 xRange=-1,10 yRange=-1,10 stroke="#8a8a8a" strokeWidth=2 xTicks=-1,0,1,2,3,4,5,6,7,8,9,10 yTicks=-1,0,1,2,3,4,5,6,7,8,9,10 tickLength=12 tickStrokeWidth=2
plot graph fn="sin(t)" range=0,9.42477796076938 samples=220 at=-331.364,165.682 scaleX=73.636 scaleY=36.818 stroke="#58C4DD" strokeWidth=5
circle dot_start r=5.4 at -331.364,165.682 fill="#ffffff" stroke="none"
circle dot_end r=5.4 at 362.643,165.682 fill="#ffffff" stroke="none"
circle moving_dot r=5.4 at -331.364,165.682 fill="#ff862f" stroke="none"
animate camera.target.x from 0 to -331.364 start=0s duration=1s easing=easeInOut
animate camera.target.y from 0 to 165.682 start=0s duration=1s easing=easeInOut
animate camera.scale from 1 to 2 start=0s duration=1s easing=easeInOut
at 1s:
  play MoveAlongPath(moving_dot, graph) duration=1s easing=linear
followCamera moving_dot start=1s duration=1s
animate camera.target.x from 362.643 to 0 start=2s duration=1s easing=easeInOut
animate camera.target.y from 165.682 to 0 start=2s duration=1s easing=easeInOut
animate camera.scale from 2 to 1 start=2s duration=1s easing=easeInOut
