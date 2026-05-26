---
title: SimpleCircle
description: "Manim Example: `SimpleCircle` (`#simplecircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#simplecircle
source_example_path: examples/simple_circle.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "本家デモの主題である Circle 作成は保ちつつ、ギャラリー表示用に背景・ラベル・寸法ガイドを追加している。"
    layer: renderer
    impact: low
    workaround: "最小再現が必要な場合は circle ノードのみを残す。"
    closure_condition: "ギャラリー用装飾と最小忠実再現を切り替えられる表示モードを追加する。"
    fidelity_upgrade_condition: "本家の最小デモとギャラリー用の見栄えを両立して提示できる時。"
category: Basic Concepts
status: ported
order: 10
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=740 h=350 at 0,-12 fill="#0f172a" stroke="#1e293b" strokeWidth=2
rect codeCard w=320 h=74 at 178,158 fill="#111827" stroke="#334155" strokeWidth=2 opacity=0
text title "SimpleCircle" at -248,186 size=42 fill="#f8fafc"
text formula "Circle().set_fill(BLUE, opacity=1)" at 178,174 size=20 fill="#bae6fd" opacity=0
text createLine "self.play(Create(circle))" at 176,144 size=18 fill="#c4b5fd" opacity=0
line grid_x x1=-156 y1=0 x2=156 y2=0 at 0,-24 stroke="#1e293b" strokeWidth=2 opacity=0
line grid_y x1=0 y1=-156 x2=0 y2=156 at 0,-24 stroke="#1e293b" strokeWidth=2 opacity=0
circle outerGlow r=132 at 0,-24 fill="#38bdf8" opacity=0.04 stroke="#075985" strokeWidth=8
circle guide r=112 at 0,-24 fill="none" stroke="#334155" strokeWidth=2
circle guide_inner r=80 at 0,-24 fill="none" stroke="#164e63" strokeWidth=1.5 opacity=0
circle circle r=80 at 0,-24 fill="#38bdf8" stroke="#0f172a" strokeWidth=6
circle finalRing r=80 at 0,-24 fill="none" stroke="#67e8f9" strokeWidth=4 opacity=0
circle tick_top r=4 at 0,56 fill="#67e8f9" stroke="none" opacity=0
circle tick_right r=4 at 80,-24 fill="#67e8f9" stroke="none" opacity=0
circle tick_bottom r=4 at 0,-104 fill="#67e8f9" stroke="none" opacity=0
circle tick_left r=4 at -80,-24 fill="#67e8f9" stroke="none" opacity=0
line radius x1=0 y1=0 x2=80 y2=0 at 0,-24 stroke="#e0f2fe" strokeWidth=3 opacity=0
circle center r=6 at 0,-24 fill="#e0f2fe" stroke="#0f172a" strokeWidth=2 opacity=0
text radiusLabel "r" at 46,-6 size=24 fill="#e0f2fe" opacity=0
text fillLabel "fill: blue, opacity: 1" at 0,-150 size=19 fill="#67e8f9" opacity=0
text note "a single mobject drawn with Create, then faded out" at 0,-210 size=20 fill="#94a3b8"
at 0s:
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play AnimationGroup(FadeIn(codeCard), FadeIn(formula), FadeIn(createLine), lagRatio=0.08) duration=0.6s
  play AnimationGroup(Create(grid_x), Create(grid_y), FadeIn(outerGlow), Create(guide), Create(guide_inner), lagRatio=0.06) duration=0.75s easing=easeOut
  play Create(circle) duration=1.0s easing=easeOut
  play AnimationGroup(FadeIn(tick_top), FadeIn(tick_right), FadeIn(tick_bottom), FadeIn(tick_left), FadeIn(radius), FadeIn(center), FadeIn(radiusLabel), FadeIn(fillLabel), lagRatio=0.08) duration=0.7s
  play FadeIn(note) duration=0.4s
wait 0.6s
play AnimationGroup(FadeOut(circle), FadeIn(finalRing), lagRatio=0.0) duration=0.8s easing=easeInOut
