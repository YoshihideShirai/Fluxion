---
title: SquareToCircle
description: "Manim Example: `SquareToCircle` (`#squaretocircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#squaretocircle
source_example_path: examples/basic_concepts_square_to_circle.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Transform path and easing defaults may not exactly match Manim internals."
    layer: runtime
    impact: medium
    workaround: "easing・duration・中間キーを調整して差を吸収する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Basic Concepts
status: ported
order: 11
---
scene width=1280 height=720 fps=60
rect square w=120 h=120 at 640,360 fill="#ffffff" stroke="#111827" strokeWidth=2 rotate=45
circle circle r=56 at 640,360 fill="#facc15" stroke="#facc15" opacity=0.8
at 0s:
  play Create(square) duration=1.0s easing=easeOut
wait 0.2s
play Transform(square, circle) duration=1.2s easing=linear
wait 0.2s
play FadeOut(square) duration=0.8s easing=easeInOut
