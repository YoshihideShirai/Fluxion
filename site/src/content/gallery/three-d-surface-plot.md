---
title: ThreeDSurfacePlot
description: "Manim Example: `ThreeDSurfacePlot` (`#threedsurfaceplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedsurfaceplot
source_example_path: examples/gallery/three-d-surface-plot.fluxion.txt
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
gap_id: GAP-030
order: 77
---
scene width=960 height=540 fps=60
value t = 0
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "ThreeDSurfacePlot" at 0,220 size=38 fill="#e2e8f0"
rect plane w=620 h=300 at 0,-20 fill="none" stroke="#334155" strokeWidth=2
path orbit d="M -220 -20 C -60 -150 60 110 220 -20" fill="none" stroke="#475569" strokeWidth=2
circle obj r=16 at -220,-20 fill="#38bdf8"
circle light r=12 at 220,-20 fill="#fbbf24"
line beam x1=220 y1=0 x2=-220 y2=0 at 0,-20 stroke="#f59e0b" strokeWidth=3
always obj.x = expr=-220 + 440*(t/6.283)
always obj.y = expr=-20 + 130*sin(t)
always light.x = expr=220*cos(t*0.7)
always light.y = expr=-20 + 90*sin(t*0.7)
always beam.rotation = expr=12*sin(t*0.7)
at 0s:
  play FadeIn(title) duration=0.5s
  play Create(plane) duration=0.6s
  play Create(orbit) duration=0.5s
  play FadeIn(obj) duration=0.4s
  play FadeIn(light) duration=0.4s
  play Create(beam) duration=0.5s
animate t from 0 to 6.283 duration=4s easing=linear
