---
title: FollowingGraphCamera
description: "Manim Example: `FollowingGraphCamera` (`#followinggraphcamera`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#followinggraphcamera
source_example_path: examples/special_camera_settings.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Camera DSL now supports target follow / frame-fit channels, but auto-bounds fitting from arbitrary node sets is still simplified."
    layer: dsl
    impact: medium
    workaround: "近似実装（既存 DSL/always 更新）で演出を代替する。"
    closure_condition: "不足 DSL 機能が追加され、近似なしで同等記述が可能になる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Special Camera Settings
status: ported
order: 40
---
scene width=960 height=540 fps=60
cameraFrame at 0,0 scale=1

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect world w=780 h=350 at 0,-20 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "FollowingGraphCamera" at -236,198 size=40 fill="#f8fafc"
text formula "self.camera.frame.animate.move_to(...)" at 162,198 size=22 fill="#bae6fd"
path camera_path d="M -220 -8 C -120 98 84 -96 220 8" fill="none" stroke="#334155" strokeWidth=5 opacity=0.9
rect frame_a w=240 h=150 at -120,0 fill="none" stroke="#fbbf24" strokeWidth=3 opacity=0.58
rect frame_b w=220 h=140 at 120,0 fill="none" stroke="#22d3ee" strokeWidth=3 opacity=0.58
circle center r=70 at 0,0 fill="#38bdf8" stroke="#e0f2fe" strokeWidth=3
circle left r=42 at -200,0 fill="#22c55e" stroke="#dcfce7" strokeWidth=3
circle right r=42 at 200,0 fill="#f97316" stroke="#ffedd5" strokeWidth=3
text label "camera frame moves across the scene" at 0,-164 size=26 fill="#e2e8f0"
text left_label "left focus" at -200,-72 size=18 fill="#bbf7d0"
text right_label "right focus" at 200,-72 size=18 fill="#fed7aa"
text note "guide rectangles show the two requested frame positions" at 0,-224 size=20 fill="#94a3b8"
at 0s:
  show bg
  play FadeIn(world) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(formula) duration=0.45s
  play AnimationGroup(Create(camera_path), FadeIn(frame_a), FadeIn(frame_b), lagRatio=0.08) duration=0.85s easing=easeOut
  play AnimationGroup(FadeIn(center), FadeIn(left), FadeIn(right), Write(label), FadeIn(left_label), FadeIn(right_label), lagRatio=0.12) duration=1.2s easing=easeOut
  play FadeIn(note) duration=0.4s
animateFrame to -120,0 scale=1.35 duration=1.2s easing=easeInOut
animateFrame to 120,0 scale=1.0 start=2.0s duration=1.2s easing=easeInOut
