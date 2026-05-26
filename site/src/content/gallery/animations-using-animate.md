---
title: AnimationsUsingAnimate
description: "Manim Example: `AnimationsUsingAnimate` (`#animationsusinganimate`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#animationsusinganimate
source_example_path: examples/animations_using_animate.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Rate function and transform interpolation may differ slightly from Manim defaults; gallery view adds motion path and property labels."
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

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=770 h=350 at 0,-20 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "AnimationsUsingAnimate" at -176,194 size=38 fill="#f8fafc"
text formula "square.animate.shift(...).set_fill(...).scale(...)" at 0,158 size=20 fill="#bae6fd"
path path d="M -180 0 C -80 -92 70 92 160 0" fill="none" stroke="#334155" strokeWidth=5 opacity=0.85
circle start r=7 at -180,0 fill="#38bdf8" stroke="#e0f2fe" strokeWidth=2
circle end r=7 at 160,0 fill="#f97316" stroke="#ffedd5" strokeWidth=2
rect square w=160 h=160 at -180,0 fill="#38bdf8" stroke="#0f172a" strokeWidth=6
text moveLabel "move" at -96,-110 size=18 fill="#93c5fd"
text fillLabel "fill" at 66,94 size=18 fill="#fdba74"
text scaleLabel "scale + rotate" at 164,-126 size=18 fill="#f8fafc"
play FadeIn(square) duration=0.8s easing=easeOut
play AnimationGroup(Create(path), FadeIn(start), FadeIn(end), FadeIn(title), FadeIn(formula), FadeIn(panel), lagRatio=0.06) duration=0.8s easing=easeOut
animate square.x from -180 to 160 duration=1.0s easing=easeInOut
play FadeIn(moveLabel) duration=0.3s
animate square.fill from "#38bdf8" to "#f97316" duration=0.9s easing=easeInOut
play FadeIn(fillLabel) duration=0.3s
animate square.scale from 1 to 1.9 duration=1.0s easing=easeOut
animate square.rotation from 0 to 180 duration=1.0s easing=easeInOut
play FadeIn(scaleLabel) duration=0.3s
