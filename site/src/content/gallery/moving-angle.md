---
title: MovingAngle
description: "Manim Example: `MovingAngle` (`#movingangle`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingangle
source_example_path: examples/gallery/moving-angle.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Text DSL の `angle` helper で弧は表現できるが、Manim の Angle mobject が持つ象限・直角マーク等の全オプションは未対応。"
    layer: dsl
    impact: low
    workaround: "`angle ... from=<expr> to=<expr>` と value tracker を組み合わせて角度変化を可視化する。"
    closure_condition: "Angle primitive に象限・直角マーク・ラベル配置 API を追加する。"
    fidelity_upgrade_condition: "本家の Angle API と同等の記述で装飾付き角度を再現できる時。"
category: Manim Stable Examples
status: partial
order: 66
gap_id: GAP-019
---
scene width=960 height=540 fps=60

value theta = 0

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingAngle" at 0,220 size=40 fill="#e2e8f0"
circle guide r=120 at 0,-20 fill="none" stroke="#334155" strokeWidth=2
line ray x1=0 y1=0 x2=120 y2=0 at 0,-20 stroke="#38bdf8" strokeWidth=4
angle arc at 0,-20 radius=60 from=0 to=theta samples=72 stroke="#f59e0b" strokeWidth=5
text theta_label "θ" at 65,22 size=34 fill="#fbbf24"

always ray.x2 = expr=120*cos(theta)
always ray.y2 = expr=120*sin(theta)
always theta_label.x = expr=70*cos(theta/2)
always theta_label.y = expr=-20 + 70*sin(theta/2)

at 0s:
  play FadeIn(title) duration=0.5s
  play Create(guide) duration=0.6s
  play Create(ray) duration=0.6s
  play FadeIn(theta_label) duration=0.4s

wait 0.2s
animate theta from 0 to 2.4 duration=1.5s easing=easeInOut
wait 0.2s
animate theta from 2.4 to 5.5 duration=1.7s easing=easeInOut
