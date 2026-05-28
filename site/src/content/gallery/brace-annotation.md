---
title: BraceAnnotation
description: "Manim Example: `BraceAnnotation` (`#braceannotation`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#braceannotation
source_example_path: examples/gallery/brace_annotation.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Brace は Manim の SVG テンプレート由来の塗り形状に寄せた renderer 近似で、細部のカール形状は完全一致しない。"
    layer: renderer
    impact: low
    workaround: "塗りつぶし brace と tip 近傍のラベル配置で公式出力に近づける。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Basic Concepts
status: ported
order: 13
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle dotA r=8 at -160,80 fill="#ffffff" stroke="none"
circle dotB r=8 at 160,-80 fill="#ffffff" stroke="none"
line segment x1=-160 y1=80 x2=160 y2=-80 at 0,0 stroke="#ff862f" strokeWidth=4
brace horizontal target=segment direction=down buff=22 label="Horizontal distance" labelSize=26 fill="#ffffff" stroke="none"
brace perpendicular target=segment direction=perpendicular buff=22 fill="#ffffff" stroke="none"
math perpendicularText "x-x_1" at 62,108 size=28 fill="#ffffff"

wait 1s
