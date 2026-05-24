---
title: MovingAround
description: "Manim Example: `MovingAround` (`#movingaround`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingaround
source_example_path: examples/gallery/moving-around.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Text DSL の `cameraFrame` / `animateFrame` helper で frame 移動は書けるが、Manim の frame updater 完全互換ではない。"
    layer: dsl
    impact: low
    workaround: "`animateFrame to x,y scale=<number>` で視覚的な移動・ズームを再現する。"
    closure_condition: "camera frame updater と mobject tracking API を追加する。"
    fidelity_upgrade_condition: "Manim と同等の camera フレーミング記述で同等の挙動を表現できる時。"
category: Manim Stable Examples
status: partial
order: 67
gap_id: GAP-020
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingAround" at 0,220 size=40 fill="#e2e8f0"
rect panel w=720 h=360 at 0,-10 fill="#111827" stroke="#334155" strokeWidth=2
circle dot r=18 at -260,-70 fill="#38bdf8" stroke="#0f172a" strokeWidth=3
text label "camera target" at -260,-118 size=22 fill="#bae6fd"

cameraFrame at 0,0 scale=1

at 0s:
  play FadeIn(title) duration=0.5s
  play FadeIn(panel) duration=0.6s
  play FadeIn(dot) duration=0.5s
  play FadeIn(label) duration=0.5s

wait 0.2s
animate dot.x from -260 to 220 duration=1.4s easing=easeInOut
animate dot.y from -70 to 90 duration=1.4s easing=easeInOut
animateFrame to 110,45 scale=1.35 duration=1.4s easing=easeInOut
wait 0.3s
animate dot.x from 220 to -180 duration=1.2s easing=easeInOut
animate dot.y from 90 to -120 duration=1.2s easing=easeInOut
animateFrame to -70,-55 scale=1.05 duration=1.2s easing=easeInOut
