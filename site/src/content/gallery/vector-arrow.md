---
title: VectorArrow
description: "Manim Example: `VectorArrow` (`#vectorarrow`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#vectorarrow
source_example_path: examples/gallery/vector-arrow.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Text DSL の `arrow` helper で shaft/tip は一体記述できるが、Manim Arrow の buff/tip shape 全オプションは未対応。"
    layer: dsl
    impact: low
    workaround: "`arrow ... tipLength=<number> tipWidth=<number>` で矢印を生成する。"
    closure_condition: "Arrow primitive に buff/tip shape/曲線 arrow オプションを追加する。"
    fidelity_upgrade_condition: "Manim と同じ引数で矢印形状を再現できる時。"
category: Manim Stable Examples
status: partial
gap_id: GAP-031
order: 78
---
scene width=960 height=540 fps=60
value t = 0
rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=760 h=350 at 0,-22 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "VectorArrow" at -286,198 size=40 fill="#f8fafc"
text formula "\\vec{v}=3\\hat{i}+1.3\\hat{j}" at 176,198 size=24 fill="#bae6fd"
axes ax at 0,-42 width=700 height=300 xRange=-4,4 yRange=-2,2 stroke="#64748b" strokeWidth=2
line x_component x1=0 y1=0 x2=190 y2=0 at 0,-42 stroke="#f59e0b" strokeWidth=4 opacity=0.9
line y_component x1=190 y1=0 x2=190 y2=80 at 0,-42 stroke="#22c55e" strokeWidth=4 opacity=0.9
line projection_x x1=190 y1=0 x2=190 y2=80 at 0,-42 stroke="#94a3b8" strokeWidth=2 opacity=0.35
line projection_y x1=0 y1=80 x2=190 y2=80 at 0,-42 stroke="#94a3b8" strokeWidth=2 opacity=0.35
arrow vec x1=0 y1=0 x2=190 y2=80 at 0,-42 stroke="#22d3ee" fill="#22d3ee" strokeWidth=7 tipLength=30 tipWidth=26
circle origin r=8 at 0,-42 fill="#f8fafc" stroke="#0f172a" strokeWidth=2
circle tip_dot r=9 at 190,38 fill="#67e8f9" stroke="#ecfeff" strokeWidth=2
text x_label "x component" at 102,-78 size=18 fill="#fdba74"
text y_label "y component" at 268,4 size=18 fill="#86efac"
text tip_label "(3, 1.3)" at 250,60 size=20 fill="#e0f2fe"
text note "Arrow helper keeps shaft and tip as a single transformable mobject" at 0,-224 size=20 fill="#94a3b8"

always vec.rotation = expr=10*sin(t)
always x_component.rotation = expr=10*sin(t)
always y_component.rotation = expr=10*sin(t)
always projection_x.rotation = expr=10*sin(t)
always projection_y.rotation = expr=10*sin(t)
always tip_dot.x = expr=190*cos(10*sin(t)*pi/180) - 80*sin(10*sin(t)*pi/180)
always tip_dot.y = expr=-42 + 190*sin(10*sin(t)*pi/180) + 80*cos(10*sin(t)*pi/180)
at 0s:
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(formula) duration=0.45s
  play Create(ax) duration=0.7s
  play AnimationGroup(Create(x_component), Create(y_component), Create(projection_x), Create(projection_y), lagRatio=0.08) duration=0.75s easing=easeOut
  play AnimationGroup(FadeIn(origin), Create(vec), FadeIn(tip_dot), lagRatio=0.08) duration=0.75s
  play AnimationGroup(FadeIn(x_label), FadeIn(y_label), FadeIn(tip_label), FadeIn(note), lagRatio=0.08) duration=0.6s
animate t from 0 to 6.283 duration=3.6s easing=easeInOut
