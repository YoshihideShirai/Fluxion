---
title: SquareToCircle
description: "Manim Example: `SquareToCircle` (`#squaretocircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#squaretocircle
source_example_path: examples/basic_concepts_square_to_circle.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Transform path and easing defaults may not exactly match Manim internals; gallery view adds labels and ghost target for readability."
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

rect bg w=1280 h=720 at 640,360 fill="#080b14"
rect panel w=860 h=430 at 640,365 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "SquareToCircle" at 392,160 size=48 fill="#f8fafc"
text formula "Transform(square, circle)" at 760,160 size=30 fill="#fde68a"
circle target r=56 at 640,360 fill="#facc15" stroke="#facc15" opacity=0.18
rect ghostSquare w=120 h=120 at 640,360 fill="none" stroke="#94a3b8" strokeWidth=2 opacity=0.45 rotation=45
circle ghostCircle r=56 at 640,360 fill="none" stroke="#facc15" strokeWidth=3 opacity=0.45
rect square w=120 h=120 at 640,360 fill="#ffffff" stroke="#111827" strokeWidth=3 rotation=45
circle circle r=56 at 640,360 fill="#facc15" stroke="#facc15" opacity=0.8
text before "square" at 510,500 size=25 fill="#cbd5e1"
text after "circle" at 770,500 size=25 fill="#fef08a"
text note "same center, different geometry" at 640,575 size=24 fill="#94a3b8"
at 0s:
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(formula) duration=0.45s
  play AnimationGroup(FadeIn(target), FadeIn(ghostSquare), FadeIn(ghostCircle), FadeIn(before), FadeIn(after), lagRatio=0.08) duration=0.65s
  play Create(square) duration=1.0s easing=easeOut
wait 0.2s
play Transform(square, circle) duration=1.2s easing=linear
play FadeIn(note) duration=0.35s
wait 0.2s
play FadeOut(square) duration=0.8s easing=easeInOut
