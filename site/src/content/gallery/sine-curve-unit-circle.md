---
title: SineCurveUnitCircle
description: "Manim Example: `SineCurveUnitCircle` (`#sinecurveunitcircle`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinecurveunitcircle
source_example_path: examples/gallery/sine-curve-unit-circle.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Text DSL の `tracedPath` helper で sine trace は表現できるが、Manim `TracedPath` の厳密な履歴サンプリング/追記挙動とは差分がある。"
    layer: dsl
    impact: low
    workaround: "`tracedPath ... from=0 to=theta` と同期 updater を組み合わせて演出を代替する。"
    closure_condition: "履歴ベースの TracedPath 追記/サンプリング API を追加する。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Advanced Projects
status: partial
order: 52
---
scene width=960 height=540 fps=60
value theta = 0

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=820 h=360 at 0,-10 fill="#0f172a" stroke="#1e293b" strokeWidth=2 opacity=0
text title "SineCurveUnitCircle" at 0,220 size=40 fill="#f8fafc" opacity=0
text circleLabel "unit circle" at -240,-132 size=22 fill="#cbd5e1" opacity=0
text waveLabel "sine trace" at 160,-132 size=22 fill="#cbd5e1" opacity=0
math formula "y=\\sin(\\theta)" at 248,148 size=34 fill="#67e8f9" renderer=katex opacity=0
text phaseLabel "same y-coordinate, unwrapped over time" at 110,164 size=18 fill="#fde68a" opacity=0

# Unit circle on left
circle origin r=3 at -240,0 fill="#e2e8f0" stroke="none"
circle unit r=96 at -240,0 fill="none" stroke="#334155" strokeWidth=2
circle unit_glow r=112 at -240,0 fill="#38bdf8" opacity=0.04 stroke="#1e40af" strokeWidth=6
line circle_x x1=-118 y1=0 x2=118 y2=0 at -240,0 stroke="#1e293b" strokeWidth=2
line circle_y x1=0 y1=-118 x2=0 y2=118 at -240,0 stroke="#1e293b" strokeWidth=2
circle ghost_0 r=5 at -144,0 fill="#67e8f9" opacity=0.35 stroke="none"
circle ghost_90 r=5 at -240,96 fill="#67e8f9" opacity=0.35 stroke="none"
circle ghost_180 r=5 at -336,0 fill="#67e8f9" opacity=0.35 stroke="none"
circle ghost_270 r=5 at -240,-96 fill="#67e8f9" opacity=0.35 stroke="none"
line radius x1=0 y1=0 x2=96 y2=0 at -240,0 stroke="#38bdf8" strokeWidth=2
circle dot r=8 at -144,0 fill="#38bdf8" stroke="none"
circle dot_halo r=24 at -144,0 fill="#38bdf8" opacity=0.12 stroke="#7dd3fc" strokeWidth=2
line projection x1=0 y1=0 x2=280 y2=0 at -80,0 stroke="#334155" strokeWidth=2
line y_bridge x1=-240 y1=0 x2=0 y2=0 at 0,0 stroke="#a78bfa" strokeWidth=2 opacity=0.28
text thetaLabel "theta" at -194,42 size=20 fill="#bae6fd" opacity=0

# Sine wave area on right
path axis d="M 0 0 L 320 0" at 0,0 stroke="#334155" strokeWidth=2 fill="none"
path yaxis d="M 0 -118 L 0 118" at 0,0 stroke="#334155" strokeWidth=2 fill="none"
line wave_y_top x1=0 y1=96 x2=320 y2=96 at 0,0 stroke="#1e293b" strokeWidth=1
line wave_y_mid x1=0 y1=0 x2=320 y2=0 at 0,0 stroke="#243044" strokeWidth=1.5
line wave_y_bot x1=0 y1=-96 x2=320 y2=-96 at 0,0 stroke="#1e293b" strokeWidth=1
line wave_x_pi x1=0 y1=-110 x2=0 y2=110 at 160,0 stroke="#1e293b" strokeWidth=1
line wave_x_2pi x1=0 y1=-110 x2=0 y2=110 at 320,0 stroke="#1e293b" strokeWidth=1
text wave_pi "π" at 160,-126 size=16 fill="#94a3b8" opacity=0
text wave_2pi "2π" at 320,-126 size=16 fill="#94a3b8" opacity=0
tracedPath full_wave x=(t/(2*pi))*320 y=96*sin(t) from=0 to=6.283185307179586 samples=180 at 0,0 stroke="#0e7490" strokeWidth=9 opacity=0.1
tracedPath wave x=(t/(2*pi))*320 y=96*sin(t) from=0 to=theta samples=180 at 0,0 stroke="#22d3ee" strokeWidth=4
circle wave_dot r=7 at 0,0 fill="#fef08a" stroke="#713f12" strokeWidth=2 opacity=0
circle wave_halo r=22 at 0,0 fill="#fbbf24" opacity=0.1 stroke="#fde68a" strokeWidth=2
line link x1=0 y1=0 x2=0 y2=0 at 0,0 stroke="#a78bfa" strokeWidth=2

always dot.x = expr=-240 + 96*cos(theta)
always dot.y = expr=96*sin(theta)
always dot_halo.x = expr=-240 + 96*cos(theta)
always dot_halo.y = expr=96*sin(theta)
always radius.x2 = expr=96*cos(theta)
always radius.y2 = expr=96*sin(theta)
always projection.y1 = expr=96*sin(theta)
always projection.y2 = expr=96*sin(theta)
always projection.x1 = expr=-240 + 96*cos(theta)
always projection.x2 = expr=0 + (theta/(2*3.141592653589793))*320
always link.x1 = expr=-240 + 96*cos(theta)
always link.y1 = expr=96*sin(theta)
always link.x2 = expr=(theta/(2*3.141592653589793))*320
always link.y2 = expr=96*sin(theta)
always y_bridge.y1 = expr=96*sin(theta)
always y_bridge.y2 = expr=96*sin(theta)
always wave_dot.x = expr=(theta/(2*3.141592653589793))*320
always wave_dot.y = expr=96*sin(theta)
always wave_halo.x = expr=(theta/(2*3.141592653589793))*320
always wave_halo.y = expr=96*sin(theta)

at 0s:
  show bg
  play FadeIn(panel) duration=0.35s
  play AnimationGroup(FadeIn(title), FadeIn(circleLabel), FadeIn(waveLabel), FadeIn(formula), FadeIn(thetaLabel), FadeIn(phaseLabel), lagRatio=0.08) duration=0.85s
  play AnimationGroup(FadeIn(unit_glow), Create(unit), Create(circle_x), Create(circle_y), FadeIn(ghost_0), FadeIn(ghost_90), FadeIn(ghost_180), FadeIn(ghost_270), lagRatio=0.06) duration=0.9s
  play AnimationGroup(FadeIn(dot_halo), FadeIn(dot), lagRatio=0.08) duration=0.45s
  play Create(radius) duration=0.5s
  play AnimationGroup(Create(axis), Create(yaxis), Create(wave_y_top), Create(wave_y_mid), Create(wave_y_bot), Create(wave_x_pi), Create(wave_x_2pi), FadeIn(wave_pi), FadeIn(wave_2pi), lagRatio=0.05) duration=0.85s
  play Create(full_wave) duration=0.55s
  play AnimationGroup(FadeIn(wave_halo), FadeIn(wave_dot), lagRatio=0.08) duration=0.4s
  play Create(link) duration=0.3s
  play Create(projection) duration=0.3s
  play Create(y_bridge) duration=0.35s

animate theta from 0 to 12.566370614359172 duration=8s easing=linear
wait 0.3s
