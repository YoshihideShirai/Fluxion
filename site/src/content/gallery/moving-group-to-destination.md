---
title: MovingGroupToDestination
description: "Manim Example: `MovingGroupToDestination` (`#movinggrouptodestination`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movinggrouptodestination
source_example_path: examples/gallery/moving-group-to-destination.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "`arrange`/`nextTo` は導入済みだが、Manim `arrange(..., aligned_edge=...)` や微細な bounding-box 一致は未対応。"
    layer: dsl
    impact: low
    workaround: "必要な微調整は `set` か `animate` の座標指定で補う。"
    closure_condition: "aligned_edge などの追加レイアウト引数をサポートする。"
    fidelity_upgrade_condition: "主要な Manim レイアウト引数を DSL で表現できる時。"
category: Manim Stable Examples
status: ported
order: 69
gap_id: GAP-022
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingGroupToDestination" at 0,220 size=38 fill="#e2e8f0"
rect panel w=760 h=320 at 0,-10 fill="#111827" stroke="#334155" strokeWidth=2

circle c1 r=26 at 0,-40 fill="#38bdf8" stroke="#0f172a" strokeWidth=3
circle c2 r=26 at 0,-40 fill="#22d3ee" stroke="#0f172a" strokeWidth=3
circle c3 r=26 at 0,-40 fill="#14b8a6" stroke="#0f172a" strokeWidth=3
text label "group source" at 0,-118 size=20 fill="#bae6fd"
group dots c1 c2 c3
arrange dots direction=horizontal gap=8
set dots.x to -240
nextTo label dots direction=down buff=24

rect target w=220 h=110 at 210,20 fill="none" stroke="#f59e0b" strokeWidth=3 opacity=0.9
text targetLabel "destination" at 210,-70 size=20 fill="#fcd34d"

at 0s:
  play FadeIn(title) duration=0.5s
  play FadeIn(panel) duration=0.5s
  play FadeIn(c1) duration=0.45s
  play FadeIn(c2) duration=0.45s
  play FadeIn(c3) duration=0.45s
  play FadeIn(label) duration=0.45s
  play Create(target) duration=0.6s
  play FadeIn(targetLabel) duration=0.4s

wait 0.2s
animate dots.x from 0 to 420 duration=1.2s easing=easeInOut
animate dots.y from 0 to 60 duration=1.2s easing=easeInOut
wait 0.2s
play Circumscribe(dots) duration=0.9s color="#fbbf24"
wait 0.2s
play FadeOut(label) duration=0.4s
