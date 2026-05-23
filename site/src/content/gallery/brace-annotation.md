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
circle a r=14 at -220,0 fill="#38bdf8" stroke="#e2e8f0" strokeWidth=2
circle b r=14 at 220,0 fill="#38bdf8" stroke="#e2e8f0" strokeWidth=2
line segment x1=-220 y1=0 x2=220 y2=0 at 0,0 stroke="#94a3b8" strokeWidth=2
brace span target=segment direction=up buff=22 label="d(A,B)" labelSize=28 labelColor="#e2e8f0" stroke="#f8fafc" strokeWidth=3
text caption "Brace annotation (preview)" at 0,-160 size=24 fill="#e2e8f0"
