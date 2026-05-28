---
title: BooleanOperations
description: "Manim Example: `BooleanOperations` (`#booleanoperations`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#booleanoperations
source_example_path: examples/gallery/boolean-operations.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Union/Intersection/Difference/Exclusion の厳密なブーリアン形状演算は未対応で、公式出力の輪郭を手描き path で近似している。"
    layer: runtime
    impact: medium
    workaround: "公式例と同じ楕円配置・演算ラベル・演算結果色で、fill_opacity と stroke を分離した SVG path として配置し、各 `self.play(...); FadeIn(label)` の順序を明示タイムラインへ展開する。"
    closure_condition: "パス同士のブーリアン演算プリミティブを追加し、生成形状を直接レンダリングできる。"
    fidelity_upgrade_condition: "各演算結果（和/積/差/排他的論理和）が本家と同等の輪郭で再現された時。"
category: Manim Stable Examples
status: ported
order: 61
gap_id: GAP-014
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
text title "Boolean Operation" at -248,-174 size=32 fill="#ffffff"
line title_underline x1=-128 y1=0 x2=128 y2=0 at -248,-151 stroke="#ffffff" strokeWidth=2
path ellipse_a_fill d="M 0 -150 C 66 -150 120 -83 120 0 C 120 83 66 150 0 150 C -66 150 -120 83 -120 0 C -120 -83 -66 -150 0 -150 Z" fill="#58C4DD" stroke="none" opacity=0.5
path ellipse_a_stroke d="M 0 -150 C 66 -150 120 -83 120 0 C 120 83 66 150 0 150 C -66 150 -120 83 -120 0 C -120 -83 -66 -150 0 -150 Z" fill="none" stroke="#58C4DD" strokeWidth=10
group ellipse_a ellipse_a_fill ellipse_a_stroke at -300,0
path ellipse_b_fill d="M 0 -150 C 66 -150 120 -83 120 0 C 120 83 66 150 0 150 C -66 150 -120 83 -120 0 C -120 -83 -66 -150 0 -150 Z" fill="#FC6255" stroke="none" opacity=0.5
path ellipse_b_stroke d="M 0 -150 C 66 -150 120 -83 120 0 C 120 83 66 150 0 150 C -66 150 -120 83 -120 0 C -120 -83 -66 -150 0 -150 Z" fill="none" stroke="#FC6255" strokeWidth=10
group ellipse_b ellipse_b_fill ellipse_b_stroke at -168,0
path intersection_fill d="M 0 -125 C 34 -97 54 -48 54 0 C 54 48 34 97 0 125 C -34 97 -54 48 -54 0 C -54 -48 -34 -97 0 -125 Z" fill="#83C167" stroke="none" opacity=0.5
path intersection_stroke d="M 0 -125 C 34 -97 54 -48 54 0 C 54 48 34 97 0 125 C -34 97 -54 48 -54 0 C -54 -48 -34 -97 0 -125 Z" fill="none" stroke="#83C167" strokeWidth=4
group intersection intersection_fill intersection_stroke at -234,0 opacity=0 scale=1
text intersection_label "Intersection" at 300,-204 size=23 fill="#ffffff" opacity=0
path union_fill d="M 0 -125 C -6 -135 -35 -150 -66 -150 C -132 -150 -186 -83 -186 0 C -186 83 -132 150 -66 150 C -35 150 -6 135 0 125 C 6 135 35 150 66 150 C 132 150 186 83 186 0 C 186 -83 132 -150 66 -150 C 35 -150 6 -135 0 -125 Z" fill="#FF862F" stroke="none" opacity=0.5
path union_stroke d="M 0 -125 C -6 -135 -35 -150 -66 -150 C -132 -150 -186 -83 -186 0 C -186 83 -132 150 -66 150 C -35 150 -6 135 0 125 C 6 135 35 150 66 150 C 132 150 186 83 186 0 C 186 -83 132 -150 66 -150 C 35 -150 6 -135 0 -125 Z" fill="none" stroke="#FF862F" strokeWidth=4
group union union_fill union_stroke at -234,0 opacity=0 scale=1
text union_label "Union" at 300,-58 size=23 fill="#ffffff" opacity=0
path exclusion_fill d="M 0 -125 C -6 -135 -35 -150 -66 -150 C -132 -150 -186 -83 -186 0 C -186 83 -132 150 -66 150 C -35 150 -6 135 0 125 C 6 135 35 150 66 150 C 132 150 186 83 186 0 C 186 -83 132 -150 66 -150 C 35 -150 6 -135 0 -125 Z M 0 -125 C 34 -97 54 -48 54 0 C 54 48 34 97 0 125 C -34 97 -54 48 -54 0 C -54 -48 -34 -97 0 -125 Z" fill="#FFFF00" stroke="none" fillRule=evenodd opacity=0.5
path exclusion_stroke d="M 0 -125 C -6 -135 -35 -150 -66 -150 C -132 -150 -186 -83 -186 0 C -186 83 -132 150 -66 150 C -35 150 -6 135 0 125 C 6 135 35 150 66 150 C 132 150 186 83 186 0 C 186 -83 132 -150 66 -150 C 35 -150 6 -135 0 -125 Z M 0 -125 C 34 -97 54 -48 54 0 C 54 48 34 97 0 125 C -34 97 -54 48 -54 0 C -54 -48 -34 -97 0 -125 Z" fill="none" stroke="#FFFF00" strokeWidth=4 fillRule=evenodd
group exclusion exclusion_fill exclusion_stroke at -234,0 opacity=0 scale=1
text exclusion_label "Exclusion" at 300,131 size=23 fill="#ffffff" opacity=0
path difference_fill d="M 0 -125 C -34 -150 -120 -120 -120 0 C -120 120 -34 150 0 125 C -34 97 -54 48 -54 0 C -54 -48 -34 -97 0 -125 Z" fill="#D147BD" stroke="none" opacity=0.5
path difference_stroke d="M 0 -125 C -34 -150 -120 -120 -120 0 C -120 120 -34 150 0 125 C -34 97 -54 48 -54 0 C -54 -48 -34 -97 0 -125 Z" fill="none" stroke="#D147BD" strokeWidth=4
group difference difference_fill difference_stroke at -234,0 opacity=0 scale=1
text difference_label "Difference" at 132,-58 size=23 fill="#ffffff" opacity=0
at 0s:
  play AnimationGroup(FadeIn(ellipse_a), FadeIn(ellipse_b), FadeIn(title), Create(title_underline), lagRatio=0.08) duration=1s easing=easeOut

animate intersection.opacity from 0 to 1 start=1s duration=1s easing=easeInOut
animate intersection.x from -234 to 300 start=1s duration=1s easing=easeInOut
animate intersection.y from 0 to -150 start=1s duration=1s easing=easeInOut
animate intersection.scale from 1 to 0.25 start=1s duration=1s easing=easeInOut
animate intersection_stroke.strokeWidth from 4 to 16 start=1s duration=1s easing=easeInOut
at 2s:
  play FadeIn(intersection_label) duration=0.45s easing=easeOut

animate union.opacity from 0 to 1 start=2.45s duration=1s easing=easeInOut
animate union.x from -234 to 300 start=2.45s duration=1s easing=easeInOut
animate union.y from 0 to 10 start=2.45s duration=1s easing=easeInOut
animate union.scale from 1 to 0.3 start=2.45s duration=1s easing=easeInOut
animate union_stroke.strokeWidth from 4 to 13.333 start=2.45s duration=1s easing=easeInOut
at 3.45s:
  play FadeIn(union_label) duration=0.45s easing=easeOut

animate exclusion.opacity from 0 to 1 start=3.9s duration=1s easing=easeInOut
animate exclusion.x from -234 to 300 start=3.9s duration=1s easing=easeInOut
animate exclusion.y from 0 to 198 start=3.9s duration=1s easing=easeInOut
animate exclusion.scale from 1 to 0.3 start=3.9s duration=1s easing=easeInOut
animate exclusion_stroke.strokeWidth from 4 to 13.333 start=3.9s duration=1s easing=easeInOut
at 4.9s:
  play FadeIn(exclusion_label) duration=0.45s easing=easeOut

animate difference.opacity from 0 to 1 start=5.35s duration=1s easing=easeInOut
animate difference.x from -234 to 132 start=5.35s duration=1s easing=easeInOut
animate difference.y from 0 to 10 start=5.35s duration=1s easing=easeInOut
animate difference.scale from 1 to 0.3 start=5.35s duration=1s easing=easeInOut
animate difference_stroke.strokeWidth from 4 to 13.333 start=5.35s duration=1s easing=easeInOut
at 6.35s:
  play FadeIn(difference_label) duration=0.45s easing=easeOut
  wait 0.7s
