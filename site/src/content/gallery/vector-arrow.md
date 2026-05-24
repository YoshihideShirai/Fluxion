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
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "VectorArrow" at 0,220 size=40 fill="#e2e8f0"
axes ax at 0,-20 width=700 height=320 xRange=-4,4 yRange=-2,2 stroke="#64748b" strokeWidth=2
arrow vec x1=0 y1=0 x2=190 y2=80 at 0,-20 stroke="#22d3ee" fill="#22d3ee" strokeWidth=6 tipLength=26 tipWidth=24
always vec.rotation = expr=18*sin(t)
at 0s:
  play FadeIn(title) duration=0.5s
  play Create(ax) duration=0.7s
  play Create(vec) duration=0.6s
animate t from 0 to 6.283 duration=3.2s easing=easeInOut
