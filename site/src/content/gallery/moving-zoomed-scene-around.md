---
title: MovingZoomedSceneAround
description: "Manim Example: `MovingZoomedSceneAround` (`#movingzoomedscenearound`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingzoomedscenearound
source_example_path: examples/gallery/moving-zoomed-scene-around.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "ZoomedScene 専用カメラ（独立レンダリング面）ではなく、右側パネルを図形連動で近似している。追跡線は `tracedPath` helper で記述できる。"
    layer: runtime
    impact: medium
    workaround: "`tracedPath` と `always` による追従更新で視覚的なズーム追尾を再現する。"
    closure_condition: "独立した sub-camera / viewport primitive を導入し、実シーンの拡大レンダリングを表示できる。"
    fidelity_upgrade_condition: "ズーム枠とズーム表示が同一ソース描画から生成され、本家と同等の追尾挙動になった時。"
category: Manim Stable Examples
status: partial
gap_id: GAP-023
order: 70
---
scene width=960 height=540 fps=60
value phase = 0

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingZoomedSceneAround" at 0,220 size=36 fill="#e2e8f0"
text subtitle "zoom frame follows the dot while the inset magnifies the local scene" at 0,184 size=20 fill="#94a3b8" opacity=0

rect world w=700 h=360 at -70,-10 fill="#0f172a" opacity=0.72 stroke="#334155" strokeWidth=2
line world_h1 x1=-350 y1=0 x2=350 y2=0 at -70,-130 stroke="#1e293b" strokeWidth=1
line world_h2 x1=-350 y1=0 x2=350 y2=0 at -70,-70 stroke="#1e293b" strokeWidth=1
line world_h3 x1=-350 y1=0 x2=350 y2=0 at -70,-10 stroke="#1e293b" strokeWidth=1
line world_h4 x1=-350 y1=0 x2=350 y2=0 at -70,50 stroke="#1e293b" strokeWidth=1
line world_h5 x1=-350 y1=0 x2=350 y2=0 at -70,110 stroke="#1e293b" strokeWidth=1
line world_v1 x1=0 y1=-180 x2=0 y2=180 at -340,-10 stroke="#1e293b" strokeWidth=1
line world_v2 x1=0 y1=-180 x2=0 y2=180 at -220,-10 stroke="#1e293b" strokeWidth=1
line world_v3 x1=0 y1=-180 x2=0 y2=180 at -100,-10 stroke="#1e293b" strokeWidth=1
line world_v4 x1=0 y1=-180 x2=0 y2=180 at 20,-10 stroke="#1e293b" strokeWidth=1
line world_v5 x1=0 y1=-180 x2=0 y2=180 at 140,-10 stroke="#1e293b" strokeWidth=1
circle star_a r=10 at -270,-90 fill="#22d3ee" stroke="none"
circle star_b r=10 at -30,80 fill="#a78bfa" stroke="none"
circle star_c r=10 at 130,-40 fill="#f97316" stroke="none"
circle star_d r=7 at -155,118 fill="#facc15" stroke="none"
circle star_e r=7 at 52,-118 fill="#34d399" stroke="none"
circle focus r=14 at -220,-60 fill="#38bdf8" stroke="#0f172a" strokeWidth=3
circle focus_halo r=32 at -220,-60 fill="#38bdf8" opacity=0.12 stroke="#7dd3fc" strokeWidth=2
tracedPath focus_trace x=-220+250*cos(t) y=-60+120*sin(t*1.2) from=0 to=phase samples=140 stroke="#22d3ee" strokeWidth=3

rect zoom_frame w=170 h=106 at -220,-60 fill="none" stroke="#f59e0b" strokeWidth=4
rect zoom_panel w=290 h=190 at 270,110 fill="#020617" stroke="#22d3ee" strokeWidth=3
rect zoom_inner w=250 h=150 at 270,110 fill="#0f172a" stroke="#1e293b" strokeWidth=2
line zoom_cross_h x1=-112 y1=0 x2=112 y2=0 at 270,110 stroke="#334155" strokeWidth=2
line zoom_cross_v x1=0 y1=-62 x2=0 y2=62 at 270,110 stroke="#334155" strokeWidth=2
circle zoom_star_a r=17 at 214,68 fill="#22d3ee" opacity=0.52 stroke="#67e8f9" strokeWidth=2
circle zoom_star_b r=15 at 314,148 fill="#a78bfa" opacity=0.48 stroke="#c4b5fd" strokeWidth=2
circle zoom_star_c r=13 at 358,84 fill="#f97316" opacity=0.5 stroke="#fdba74" strokeWidth=2
circle zoom_focus_halo r=58 at 270,110 fill="#38bdf8" opacity=0.08 stroke="#7dd3fc" strokeWidth=2
line zoom_link_1 x1=0 y1=0 x2=0 y2=0 at 0,0 stroke="#475569" strokeWidth=2
line zoom_link_2 x1=0 y1=0 x2=0 y2=0 at 0,0 stroke="#475569" strokeWidth=2
circle focus_zoom r=40 at 270,110 fill="#38bdf8" opacity=0.22 stroke="#7dd3fc" strokeWidth=3
text zoomRatio "x3.2" at 170,186 size=22 fill="#67e8f9" opacity=0
text caption "zoomed view (approx)" at 270,210 size=18 fill="#94a3b8"

always focus.x = expr=-220 + 250*cos(phase)
always focus.y = expr=-60 + 120*sin(phase*1.2)
always zoom_frame.x = expr=-220 + 250*cos(phase)
always zoom_frame.y = expr=-60 + 120*sin(phase*1.2)
always focus_halo.x = expr=-220 + 250*cos(phase)
always focus_halo.y = expr=-60 + 120*sin(phase*1.2)

always zoom_link_1.x1 = expr=-220 + 250*cos(phase) - 85
always zoom_link_1.y1 = expr=-60 + 120*sin(phase*1.2) + 53
always zoom_link_1.x2 = expr=125
always zoom_link_1.y2 = expr=15
always zoom_link_2.x1 = expr=-220 + 250*cos(phase) + 85
always zoom_link_2.y1 = expr=-60 + 120*sin(phase*1.2) - 53
always zoom_link_2.x2 = expr=415
always zoom_link_2.y2 = expr=205
always focus_zoom.x = expr=270 + 42*cos(phase)
always focus_zoom.y = expr=110 + 20*sin(phase*1.2)
always zoom_focus_halo.x = expr=270 + 42*cos(phase)
always zoom_focus_halo.y = expr=110 + 20*sin(phase*1.2)

at 0s:
  show bg
  play FadeIn(title) duration=0.4s
  play FadeIn(subtitle) duration=0.35s
  play Create(world) duration=0.5s
  play AnimationGroup(Create(world_h1), Create(world_h2), Create(world_h3), Create(world_h4), Create(world_h5), Create(world_v1), Create(world_v2), Create(world_v3), Create(world_v4), Create(world_v5), lagRatio=0.03) duration=0.75s
  play AnimationGroup(FadeIn(star_a), FadeIn(star_b), FadeIn(star_c), FadeIn(star_d), FadeIn(star_e), lagRatio=0.08) duration=0.55s
  play AnimationGroup(FadeIn(caption), FadeIn(zoomRatio), lagRatio=0.08) duration=0.35s
  play Create(zoom_panel) duration=0.5s
  play Create(zoom_inner) duration=0.35s
  play AnimationGroup(Create(zoom_cross_h), Create(zoom_cross_v), FadeIn(zoom_star_a), FadeIn(zoom_star_b), FadeIn(zoom_star_c), FadeIn(zoom_focus_halo), lagRatio=0.08) duration=0.85s
  play Create(zoom_frame) duration=0.5s
  play Create(zoom_link_1) duration=0.3s
  play Create(zoom_link_2) duration=0.3s
  play FadeIn(focus_halo) duration=0.3s
  play FadeIn(focus) duration=0.3s
  play FadeIn(focus_zoom) duration=0.3s

animate phase from 0 to 6.283185307179586 duration=4.8s easing=linear
wait 0.3s
