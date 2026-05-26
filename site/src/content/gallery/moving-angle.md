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

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=760 h=350 at 0,-20 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "MovingAngle" at -284,198 size=40 fill="#f8fafc"
text formula "Angle(line1, line2)" at 166,198 size=25 fill="#fde68a"
path sector d="M 0 0 L 96 0 A 96 96 0 0 1 -71 65 Z" at -50,-36 fill="#f59e0b" opacity=0.1 stroke="none"
circle guide r=132 at -50,-36 fill="none" stroke="#334155" strokeWidth=2
circle guide_inner r=66 at -50,-36 fill="none" stroke="#1e293b" strokeWidth=2
line tick_0 x1=128 y1=0 x2=146 y2=0 at -50,-36 stroke="#64748b" strokeWidth=2
line tick_90 x1=0 y1=128 x2=0 y2=146 at -50,-36 stroke="#64748b" strokeWidth=2
line tick_180 x1=-128 y1=0 x2=-146 y2=0 at -50,-36 stroke="#64748b" strokeWidth=2
line tick_270 x1=0 y1=-128 x2=0 y2=-146 at -50,-36 stroke="#64748b" strokeWidth=2
text tick0_label "0" at 118,-58 size=16 fill="#94a3b8"
text tick90_label "π/2" at -48,126 size=16 fill="#94a3b8"
text tick180_label "π" at -194,-58 size=16 fill="#94a3b8"
text tick270_label "3π/2" at -50,-202 size=16 fill="#94a3b8"
line base x1=0 y1=0 x2=150 y2=0 at -50,-36 stroke="#94a3b8" strokeWidth=4
line ghost_a x1=0 y1=0 x2=-98 y2=90 at -50,-36 stroke="#fbbf24" strokeWidth=2 opacity=0.32
line ghost_b x1=0 y1=0 x2=94 y2=-94 at -50,-36 stroke="#fbbf24" strokeWidth=2 opacity=0.22
line ray x1=0 y1=0 x2=132 y2=0 at -50,-36 stroke="#38bdf8" strokeWidth=5
angle arc at -50,-36 radius=66 from=0 to=theta samples=96 stroke="#f59e0b" strokeWidth=6
angle outer_arc at -50,-36 radius=96 from=0 to=theta samples=96 stroke="#fbbf24" strokeWidth=2 opacity=0.45
angle ghost_arc_a at -50,-36 radius=112 from=0 to=2.4 samples=72 stroke="#fbbf24" strokeWidth=2 opacity=0.22
angle ghost_arc_b at -50,-36 radius=122 from=2.4 to=5.5 samples=92 stroke="#fbbf24" strokeWidth=2 opacity=0.14
circle pivot r=9 at -50,-36 fill="#f8fafc" stroke="#0f172a" strokeWidth=2
circle tip r=9 at 82,-36 fill="#38bdf8" stroke="#e0f2fe" strokeWidth=2
circle tip_glow r=24 at 82,-36 fill="#38bdf8" opacity=0.1 stroke="#7dd3fc" strokeWidth=2
text theta_label "θ" at 65,22 size=34 fill="#fbbf24"
text value_label "θ tracker" at -300,-170 size=24 fill="#fef3c7" opacity=0
text stop_a "2.4 rad" at -186,74 size=18 fill="#fde68a" opacity=0
text stop_b "5.5 rad" at 82,-160 size=18 fill="#fde68a" opacity=0
text base_label "fixed ray" at 76,-78 size=18 fill="#cbd5e1"
text moving_label "moving ray" at 118,72 size=18 fill="#7dd3fc"
text note "the arc is regenerated from tracker theta" at 0,-224 size=20 fill="#94a3b8"

always ray.x2 = expr=132*cos(theta)
always ray.y2 = expr=132*sin(theta)
always tip.x = expr=-50 + 132*cos(theta)
always tip.y = expr=-36 + 132*sin(theta)
always tip_glow.x = expr=-50 + 132*cos(theta)
always tip_glow.y = expr=-36 + 132*sin(theta)
always theta_label.x = expr=-50 + 76*cos(theta/2)
always theta_label.y = expr=-36 + 76*sin(theta/2)
always moving_label.x = expr=-50 + 156*cos(theta)
always moving_label.y = expr=-36 + 156*sin(theta)

at 0s:
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(formula) duration=0.45s
  play AnimationGroup(FadeIn(sector), Create(guide), Create(guide_inner), Create(tick_0), Create(tick_90), Create(tick_180), Create(tick_270), FadeIn(tick0_label), FadeIn(tick90_label), FadeIn(tick180_label), FadeIn(tick270_label), lagRatio=0.04) duration=0.9s easing=easeOut
  play AnimationGroup(Create(base), Create(ghost_a), Create(ghost_b), Create(ghost_arc_a), Create(ghost_arc_b), FadeIn(base_label), lagRatio=0.08) duration=0.85s easing=easeOut
  play AnimationGroup(Create(ray), FadeIn(pivot), FadeIn(tip_glow), FadeIn(tip), FadeIn(theta_label), FadeIn(moving_label), FadeIn(value_label), FadeIn(stop_a), FadeIn(stop_b), lagRatio=0.08) duration=0.9s
  play FadeIn(note) duration=0.4s

wait 0.2s
animate theta from 0 to 2.4 duration=1.5s easing=easeInOut
wait 0.2s
animate theta from 2.4 to 5.5 duration=1.7s easing=easeInOut
