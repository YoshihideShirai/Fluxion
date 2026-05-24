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
circle dotA r=10 at -210,0 fill="#e2e8f0" stroke="none"
circle dotB r=10 at 210,0 fill="#e2e8f0" stroke="none"
text labelA "A" at -210,34 size=28 fill="#f8fafc"
text labelB "B" at 210,34 size=28 fill="#f8fafc"
line segment x1=-210 y1=0 x2=210 y2=0 at 0,0 stroke="#94a3b8" strokeWidth=3
brace span target=segment direction=down buff=26 label="x - x_{1}" labelSize=30 labelColor="#f8fafc" stroke="#f8fafc" strokeWidth=3
at 0s:
  play FadeIn(dotA, dotB, labelA, labelB) duration=0.8s easing=easeOut
wait 0.2s
play Create(segment) duration=0.8s easing=easeOut
wait 0.2s
play FadeIn(span) duration=0.8s easing=easeOut
wait 0.8s
