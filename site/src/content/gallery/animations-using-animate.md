---
title: AnimationsUsingAnimate
description: "Manim Example: `AnimationsUsingAnimate` (`#animationsusinganimate`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#animationsusinganimate
source_example_path: examples/animations_using_animate.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Rate function and transform interpolation may differ slightly from Manim defaults."
    layer: runtime
    impact: low
    workaround: "easing・duration・中間キーを調整して差を吸収する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Animations
status: ported
order: 20
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
rect square w=120 h=120 at 0,0 fill="#ffffff" stroke="#111827" strokeWidth=2

at 0s:
  animate square.x from 0 to -120 duration=1s easing=smooth
at 1s:
  animate square.fill from "#ffffff" to "#f97316" duration=1s easing=smooth
at 2s:
  animate square.scale from 1 to 0.3 duration=1s easing=smooth
at 3s:
  animate square.rotation from 0 to 22.918 duration=1s easing=smooth
