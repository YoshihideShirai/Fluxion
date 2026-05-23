---
title: MovingZoomedSceneAround
description: "Manim Example: `MovingZoomedSceneAround` (`#movingzoomedscenearound`) の未移植デモ（プレースホルダー）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingzoomedscenearound
source_example_path: examples/gallery/moving-zoomed-scene-around.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "この Example はまだ Fluxion へ移植されていません（プレースホルダー表示のみ）。"
    layer: compiler
    impact: high
    workaround: "同テーマの移植済み Example を参照する。"
    closure_condition: "当該 Example の DSL 実装とアニメーションシーケンスが追加される。"
    fidelity_upgrade_condition: "プレースホルダーではなく元Example相当のシーンが再現され、主要差分が解消された時。"
category: Manim Stable Examples
status: partial
gap_id: GAP-023
order: 70
---
scene width=960 height=540 fps=60
value phase = 0
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingZoomedSceneAround" at 0,220 size=40 fill="#e2e8f0"
rect world w=720 h=360 at 0,-10 fill="none" stroke="#334155" strokeWidth=2
rect zoom_frame w=180 h=110 at -220,-40 fill="none" stroke="#f59e0b" strokeWidth=4
rect zoom_panel w=280 h=180 at 260,110 fill="none" stroke="#22d3ee" strokeWidth=3
circle focus r=16 at -220,-40 fill="#38bdf8" stroke="#0f172a" strokeWidth=3
path focus_trace d="M -220 -40" fill="none" stroke="#22d3ee" strokeWidth=3

always focus.x = expr=-220 + 260*cos(phase)
always focus.y = expr=-40 + 120*sin(phase*1.3)
always zoom_frame.x = expr=-220 + 260*cos(phase)
always zoom_frame.y = expr=-40 + 120*sin(phase*1.3)
always focus_trace.d = path(x=260*cos(t)-220,y=120*sin(t*1.3)-40,from=0,to=phase,samples=100)

at 0s:
  play FadeIn(title) duration=0.5s
  play Create(world) duration=0.6s
  play Create(zoom_panel) duration=0.5s
  play Create(zoom_frame) duration=0.5s
  play FadeIn(focus) duration=0.4s

wait 0.2s
animate phase from 0 to 6.283 duration=4s easing=linear
