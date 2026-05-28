---
title: BooleanOperations
description: "Manim Example: `BooleanOperations` (`#booleanoperations`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#booleanoperations
source_example_path: examples/gallery/boolean-operations.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Union/Intersection/Difference/Exclusion の汎用ブーリアン形状演算は未対応だが、この公式例は同径楕円2つの解析的な交点から SVG arc path として展開している。"
    layer: runtime
    impact: low
    workaround: "公式 `Ellipse(width=4.0, height=5.0)` を Manim 16:9 frame scale で 270x337.5px に展開し、同じ楕円配置・演算ラベル・演算結果色で、楕円交点 `y=146.142` を使った arc path に展開する。fill_opacity と stroke を分離し、演算結果の move/scale/fade-in は `Animate(...)` target-state primitive、明示 `run_time` のない各 `self.play(...)` / `FadeIn(label)` は Manim 既定の1秒 cadence へ展開する。"
    closure_condition: "パス同士のブーリアン演算プリミティブを追加し、生成形状を直接レンダリングできる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 61
gap_id: GAP-014
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
text title "Boolean Operation" at -248,-174 size=32 fill="#ffffff"
line title_underline x1=-128 y1=0 x2=128 y2=0 at -248,-151 stroke="#ffffff" strokeWidth=2
path ellipse_a_fill d="M 0 -168.75 C 74.558 -168.75 135 -93.198 135 0 C 135 93.198 74.558 168.75 0 168.75 C -74.558 168.75 -135 93.198 -135 0 C -135 -93.198 -74.558 -168.75 0 -168.75 Z" fill="#58C4DD" stroke="none" opacity=0.5
path ellipse_a_stroke d="M 0 -168.75 C 74.558 -168.75 135 -93.198 135 0 C 135 93.198 74.558 168.75 0 168.75 C -74.558 168.75 -135 93.198 -135 0 C -135 -93.198 -74.558 -168.75 0 -168.75 Z" fill="none" stroke="#58C4DD" strokeWidth=10
group ellipse_a ellipse_a_fill ellipse_a_stroke at -300,0
path ellipse_b_fill d="M 0 -168.75 C 74.558 -168.75 135 -93.198 135 0 C 135 93.198 74.558 168.75 0 168.75 C -74.558 168.75 -135 93.198 -135 0 C -135 -93.198 -74.558 -168.75 0 -168.75 Z" fill="#FC6255" stroke="none" opacity=0.5
path ellipse_b_stroke d="M 0 -168.75 C 74.558 -168.75 135 -93.198 135 0 C 135 93.198 74.558 168.75 0 168.75 C -74.558 168.75 -135 93.198 -135 0 C -135 -93.198 -74.558 -168.75 0 -168.75 Z" fill="none" stroke="#FC6255" strokeWidth=10
group ellipse_b ellipse_b_fill ellipse_b_stroke at -165,0
path intersection_fill d="M 0 -146.142 A 135 168.75 0 0 1 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z" fill="#83C167" stroke="none" opacity=0.5
path intersection_stroke d="M 0 -146.142 A 135 168.75 0 0 1 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z" fill="none" stroke="#83C167" strokeWidth=4
group intersection intersection_fill intersection_stroke at -232.5,0 opacity=0 scale=1
text intersection_label "Intersection" at 337.5,-229.5 size=23 fill="#ffffff" opacity=0
path union_fill d="M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 1 0 0 -146.142 Z" fill="#FF862F" stroke="none" opacity=0.5
path union_stroke d="M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 1 0 0 -146.142 Z" fill="none" stroke="#FF862F" strokeWidth=4
group union union_fill union_stroke at -232.5,0 opacity=0 scale=1
text union_label "Union" at 337.5,-65.25 size=23 fill="#ffffff" opacity=0
path exclusion_fill d="M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 1 0 0 -146.142 Z M 0 -146.142 A 135 168.75 0 0 1 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z" fill="#FFFF00" stroke="none" fillRule=evenodd opacity=0.5
path exclusion_stroke d="M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 1 0 0 -146.142 Z M 0 -146.142 A 135 168.75 0 0 1 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z" fill="none" stroke="#FFFF00" strokeWidth=4 fillRule=evenodd
group exclusion exclusion_fill exclusion_stroke at -232.5,0 opacity=0 scale=1
text exclusion_label "Exclusion" at 337.5,147.375 size=23 fill="#ffffff" opacity=0
path difference_fill d="M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z" fill="#D147BD" stroke="none" opacity=0.5
path difference_stroke d="M 0 -146.142 A 135 168.75 0 1 0 0 146.142 A 135 168.75 0 0 1 0 -146.142 Z" fill="none" stroke="#D147BD" strokeWidth=4
group difference difference_fill difference_stroke at -232.5,0 opacity=0 scale=1
text difference_label "Difference" at 148.5,-65.25 size=23 fill="#ffffff" opacity=0
at 0s:
  play AnimationGroup(FadeIn(ellipse_a), FadeIn(ellipse_b), FadeIn(title), FadeIn(title_underline), lagRatio=0) duration=1s easing=smooth

at 1s:
  play AnimationGroup(Animate(intersection, opacity=1, shift=(570,-168.75), scale=0.25), Animate(intersection_stroke, strokeWidth=16), lagRatio=0) duration=1s easing=easeInOut
at 2s:
  play FadeIn(intersection_label) duration=1s easing=smooth

at 3s:
  play AnimationGroup(Animate(union, opacity=1, shift=(570,11.25), scale=0.3), Animate(union_stroke, strokeWidth=13.333), lagRatio=0) duration=1s easing=easeInOut
at 4s:
  play FadeIn(union_label) duration=1s easing=smooth

at 5s:
  play AnimationGroup(Animate(exclusion, opacity=1, shift=(570,222.75), scale=0.3), Animate(exclusion_stroke, strokeWidth=13.333), lagRatio=0) duration=1s easing=easeInOut
at 6s:
  play FadeIn(exclusion_label) duration=1s easing=smooth

at 7s:
  play AnimationGroup(Animate(difference, opacity=1, shift=(381,11.25), scale=0.3), Animate(difference_stroke, strokeWidth=13.333), lagRatio=0) duration=1s easing=easeInOut
at 8s:
  play FadeIn(difference_label) duration=1s easing=smooth
