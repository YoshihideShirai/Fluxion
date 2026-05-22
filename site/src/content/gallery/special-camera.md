---
title: Special Camera Settings
description: Text DSL version with camera pan and zoom.
source_manim_url: https://docs.manim.community/en/stable/examples.html#followinggraphcamera
source_example_path: examples/special_camera_settings.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - Camera DSL now supports target follow / frame-fit channels, but auto-bounds fitting from arbitrary node sets is still simplified.
category: Special Camera Settings
status: ported
order: 40
---
scene width=960 height=540 fps=60
camera at 0,0 scale=1
circle center r=70 at 0,0 fill="#38bdf8"
circle left r=42 at 280,270 fill="#22c55e"
circle right r=42 at 680,270 fill="#f97316"
text label "Camera move demo" at 480,120 size=34 fill="#e2e8f0"
at 0s:
  play AnimationGroup(FadeIn(center), FadeIn(left), FadeIn(right), Write(label), lagRatio=0.15) duration=1.2s easing=easeOut
animate camera.x from 0 to -120 duration=1.2s easing=easeInOut
animate camera.scale from 1 to 1.35 duration=1.2s easing=easeInOut
animate camera.x from -120 to 120 start=2.0s duration=1.2s easing=easeInOut
animate camera.scale from 1.35 to 1.0 start=2.0s duration=1.2s easing=easeInOut
