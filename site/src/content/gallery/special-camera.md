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
camera at 0,0 scale=1
circle center r=70 at 0,0 fill="#38bdf8"
circle left r=42 at -200,0 fill="#22c55e"
circle right r=42 at 200,0 fill="#f97316"
text label "Camera move demo" at 0,-150 size=34 fill="#e2e8f0"
at 0s:
  play AnimationGroup(FadeIn(center), FadeIn(left), FadeIn(right), Write(label), lagRatio=0.15) duration=1.2s easing=easeOut
animate camera.x from 0 to -120 duration=1.2s easing=easeInOut
animate camera.scale from 1 to 1.35 duration=1.2s easing=easeInOut
animate camera.x from -120 to 120 start=2.0s duration=1.2s easing=easeInOut
animate camera.scale from 1.35 to 1.0 start=2.0s duration=1.2s easing=easeInOut
