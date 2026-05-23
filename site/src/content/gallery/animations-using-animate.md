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
    impact: medium
    workaround: "easing・duration・中間キーを調整して差を吸収する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Animations
status: ported
order: 20
---
scene width=960 height=540 fps=60
rect square w=160 h=160 at -180,0 fill="#38bdf8" stroke="#0f172a" strokeWidth=6
play FadeIn(square) duration=0.8s easing=easeOut
animate square.x from -180 to 160 duration=1.0s easing=easeInOut
animate square.fill from "#38bdf8" to "#f97316" duration=0.9s easing=easeInOut
animate square.scale from 1 to 1.9 duration=1.0s easing=easeOut
animate square.rotation from 0 to 180 duration=1.0s easing=easeInOut
