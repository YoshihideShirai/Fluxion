---
title: BraceAnnotation
description: "Manim Example: `BraceAnnotation` (`#braceannotation`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#braceannotation
source_example_path: examples/gallery/brace_annotation.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Brace contour is now size-aware, but mathtext label bounds are still estimated from fontSize for anchor spacing."
    layer: renderer
    impact: low
    workaround: "必要に応じてスタイル値を手動調整する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Basic Concepts
status: ported
order: 13
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=760 h=330 at 0,-20 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "BraceAnnotation" at -284,192 size=40 fill="#f8fafc"
text formula "Brace(line).get_text(...)" at 168,192 size=24 fill="#bae6fd"
line baseline x1=-300 y1=0 x2=300 y2=0 at 0,-28 stroke="#263244" strokeWidth=2
circle dotA r=12 at -210,-28 fill="#e2e8f0" stroke="#38bdf8" strokeWidth=3
circle dotB r=12 at 210,-28 fill="#e2e8f0" stroke="#38bdf8" strokeWidth=3
text labelA "x_1" at -210,22 size=28 fill="#f8fafc"
text labelB "x" at 210,22 size=28 fill="#f8fafc"
line segment x1=-210 y1=0 x2=210 y2=0 at 0,-28 stroke="#94a3b8" strokeWidth=5
line tickA x1=0 y1=-28 x2=0 y2=28 at -210,-28 stroke="#fbbf24" strokeWidth=3 opacity=0
line tickB x1=0 y1=-28 x2=0 y2=28 at 210,-28 stroke="#fbbf24" strokeWidth=3 opacity=0
brace span target=segment direction=down buff=30 label="x - x_{1}" labelSize=34 labelColor="#f8fafc" stroke="#f8fafc" strokeWidth=4
text note "brace follows the measured mobject width" at 0,-220 size=20 fill="#94a3b8"
at 0s:
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(formula) duration=0.45s
  play Create(baseline) duration=0.6s
  play AnimationGroup(FadeIn(dotA), FadeIn(dotB), FadeIn(labelA), FadeIn(labelB), lagRatio=0.05) duration=0.8s easing=easeOut
wait 0.2s
play Create(segment) duration=0.8s easing=easeOut
play AnimationGroup(FadeIn(tickA), FadeIn(tickB), lagRatio=0.08) duration=0.4s
wait 0.2s
play FadeIn(span) duration=0.8s easing=easeOut
play FadeIn(note) duration=0.4s
wait 0.8s
