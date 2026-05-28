---
title: BraceAnnotation
description: "Manim Example: `BraceAnnotation` (`#braceannotation`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#braceannotation
source_example_path: examples/gallery/brace_annotation.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Brace shape and labels are generated from the primitive, but SVG mobject point sampling / browser text metrics may still differ slightly from Manim."
    layer: renderer
    impact: low
    workaround: "Manim の Brace source と同じ path template / `default_min_width=0.90552` / `linear_section_length` モデルを使った塗りつぶし brace と、`get_text` / `get_tex` 相当の primitive label を tip 近傍へ配置する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Basic Concepts
status: ported
gap_id: GAP-010
order: 13
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle dotA r=5.4 at -135,67.5 fill="#ffffff" stroke="none"
circle dotB r=5.4 at 135,-67.5 fill="#ffffff" stroke="none"
line segment x1=-135 y1=67.5 x2=135 y2=-67.5 at 0,0 stroke="#ff862f" strokeWidth=4
brace horizontal target=segment direction=down buff=13.5 sharpness=2 label="\\text{Horizontal distance}" labelRenderer=katex labelSize=42 labelW=300 labelH=90 labelColor="#ffffff" fill="#ffffff" stroke="none"
brace perpendicular target=segment direction=perpendicular buff=13.5 sharpness=2 label="x-x_1" labelRenderer=katex labelSize=42 labelW=120 labelH=88 labelColor="#ffffff" fill="#ffffff" stroke="none"

wait 1s
