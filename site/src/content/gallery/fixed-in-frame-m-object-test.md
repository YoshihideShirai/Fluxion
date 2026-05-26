---
title: FixedInFrameMObjectTest
description: "Manim Example: `FixedInFrameMObjectTest` (`#fixedinframemobjecttest`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#fixedinframemobjecttest
source_example_path: examples/gallery/fixed-in-frame-m-object-test.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3Dカメラ移動中に fixed-in-frame オブジェクトを完全固定する専用命令がなく、2D HUD 風の近似で表現している。"
    layer: compiler
    impact: high
    workaround: "HUD要素を別レイヤーとして配置し、背景側のみを動かす演出で代替する。"
    closure_condition: "fixedInFrame=true などのノード属性とカメラ分離レンダリングを追加する。"
    fidelity_upgrade_condition: "カメラ回転/ズーム時に対象テキストが画面座標で不変となる実装が入った時。"
category: Manim Stable Examples
status: partial
order: 62
gap_id: GAP-015
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect stage w=760 h=350 at 0,-28 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "FixedInFrameMObjectTest" at -186,204 size=36 fill="#f8fafc"
text subtitle "HUD remains screen-space while scene objects move" at 88,170 size=21 fill="#bae6fd"
rect screen_frame w=900 h=490 at 0,0 fill="none" stroke="#334155" strokeWidth=2 opacity=0.55
text screenLabel "screen-space overlay" at -298,150 size=17 fill="#fde68a" opacity=0
text hud "I stay in frame" at -300,190 size=26 fill="#fef08a" opacity=0
rect hud_box w=274 h=56 at -300,190 fill="#334155" opacity=0 stroke="#fef08a" strokeWidth=2
circle hud_lock r=10 at -420,190 fill="#fef08a" stroke="#713f12" strokeWidth=2 opacity=0
line hud_pin x1=-430 y1=190 x2=-468 y2=190 at 0,0 stroke="#fef08a" strokeWidth=3 opacity=0

line grid_h1 x1=-350 y1=0 x2=350 y2=0 at 0,-118 stroke="#1e293b" strokeWidth=1
line grid_h2 x1=-350 y1=0 x2=350 y2=0 at 0,-58 stroke="#1e293b" strokeWidth=1
line grid_h3 x1=-350 y1=0 x2=350 y2=0 at 0,2 stroke="#243044" strokeWidth=1.5
line grid_h4 x1=-350 y1=0 x2=350 y2=0 at 0,62 stroke="#1e293b" strokeWidth=1
line grid_v1 x1=0 y1=-145 x2=0 y2=145 at -300,-28 stroke="#1e293b" strokeWidth=1
line grid_v2 x1=0 y1=-145 x2=0 y2=145 at -180,-28 stroke="#1e293b" strokeWidth=1
line grid_v3 x1=0 y1=-145 x2=0 y2=145 at -60,-28 stroke="#243044" strokeWidth=1.5
line grid_v4 x1=0 y1=-145 x2=0 y2=145 at 60,-28 stroke="#1e293b" strokeWidth=1
line grid_v5 x1=0 y1=-145 x2=0 y2=145 at 180,-28 stroke="#1e293b" strokeWidth=1
line grid_v6 x1=0 y1=-145 x2=0 y2=145 at 300,-28 stroke="#1e293b" strokeWidth=1
circle planet r=44 at -220,-10 fill="#38bdf8" stroke="#075985" strokeWidth=3
circle planet_glow r=76 at -220,-10 fill="#38bdf8" opacity=0.08 stroke="#7dd3fc" strokeWidth=2
circle moon r=14 at -130,20 fill="#e2e8f0" stroke="#64748b" strokeWidth=2
path orbit d="M -220 -10 A 90 60 0 1 1 -219 -10" at 0,0 fill="none" stroke="#334155" strokeWidth=3
path travel d="M -220 -10 C -74 -92 70 88 140 -10 C 42 -84 -12 54 -60 -10" fill="none" stroke="#38bdf8" strokeWidth=3 opacity=0.24
circle waypoint_a r=6 at -220,-10 fill="#fef08a" stroke="#713f12" strokeWidth=2 opacity=0
circle waypoint_b r=6 at 140,-10 fill="#fef08a" stroke="#713f12" strokeWidth=2 opacity=0
circle waypoint_c r=6 at -60,-10 fill="#fef08a" stroke="#713f12" strokeWidth=2 opacity=0
text worldLabel "world layer moves" at 180,130 size=20 fill="#7dd3fc" opacity=0
rect world_frame_a w=270 h=150 at -220,-10 fill="none" stroke="#475569" strokeWidth=2 opacity=0.55
rect world_frame_b w=270 h=150 at 140,20 fill="none" stroke="#22d3ee" strokeWidth=2 opacity=0.45
rect world_frame_c w=270 h=150 at -60,-10 fill="none" stroke="#a78bfa" strokeWidth=2 opacity=0.35
text note "only the world layer moves in this visual approximation" at 0,-226 size=20 fill="#94a3b8"

at 0s:
  show bg
  play FadeIn(stage) duration=0.35s
  play Create(screen_frame) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(subtitle) duration=0.45s
  play AnimationGroup(FadeIn(hud_box), FadeIn(hud), FadeIn(hud_lock), Create(hud_pin), FadeIn(screenLabel), lagRatio=0.08) duration=0.65s
  play AnimationGroup(Create(grid_h1), Create(grid_h2), Create(grid_h3), Create(grid_h4), Create(grid_v1), Create(grid_v2), Create(grid_v3), Create(grid_v4), Create(grid_v5), Create(grid_v6), lagRatio=0.03) duration=0.85s
  play AnimationGroup(Create(world_frame_a), Create(world_frame_b), Create(world_frame_c), Create(travel), FadeIn(waypoint_a), FadeIn(waypoint_b), FadeIn(waypoint_c), FadeIn(worldLabel), lagRatio=0.08) duration=0.95s easing=easeOut
  play Create(orbit) duration=0.6s
  play AnimationGroup(FadeIn(planet_glow), FadeIn(planet), lagRatio=0.08) duration=0.45s
  play FadeIn(moon) duration=0.35s
  play FadeIn(note) duration=0.4s

animate planet.x from -220 to 140 duration=1.4s easing=easeInOut
animate planet_glow.x from -220 to 140 duration=1.4s easing=easeInOut
animate moon.x from -130 to 230 duration=1.4s easing=easeInOut
animate moon.y from 20 to 80 duration=1.4s easing=easeInOut
wait 0.2s
animate planet.x from 140 to -60 duration=1.2s easing=easeInOut
animate planet_glow.x from 140 to -60 duration=1.2s easing=easeInOut
animate moon.x from 230 to 30 duration=1.2s easing=easeInOut
animate moon.y from 80 to -30 duration=1.2s easing=easeInOut
wait 0.5s
