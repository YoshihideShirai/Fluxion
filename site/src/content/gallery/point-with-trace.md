---
title: PointWithTrace
description: "Manim Example: `PointWithTrace` (`#pointwithtrace`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointwithtrace
source_example_path: examples/gallery/point-with-trace.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "`TracedPath` 専用 primitive は未実装のため、`always ... = path(...)` で軌跡線を近似している。"
    layer: dsl
    impact: medium
    workaround: "value tracker と `always trace.d = path(...)` を組み合わせて軌跡を更新する。"
    closure_condition: "TracedPath primitive（追跡対象/履歴長/減衰オプション）を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "Manim と同様に対象 mobject の履歴を直接トレースできる時。"
category: Manim Stable Examples
status: partial
order: 71
gap_id: GAP-024
---
scene width=960 height=540 fps=60

value theta = 0

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "PointWithTrace" at 0,220 size=40 fill="#e2e8f0"
circle guide r=150 at 0,-20 fill="none" stroke="#334155" strokeWidth=2
path trace d="M 0 0" at 0,-20 fill="none" stroke="#22d3ee" strokeWidth=4
circle dot r=12 at 150,-20 fill="#38bdf8" stroke="#0f172a" strokeWidth=3

always dot.x = expr=150*cos(theta)
always dot.y = expr=-20 + 150*sin(theta)
always trace.d = path(x=150*cos(t),y=150*sin(t),from=0,to=theta,samples=120)

at 0s:
  play FadeIn(title) duration=0.5s
  play Create(guide) duration=0.6s
  play FadeIn(dot) duration=0.5s

wait 0.2s
animate theta from 0 to 6.283 duration=3.2s easing=linear
wait 0.2s
play FadeOut(dot) duration=0.35s
play FadeIn(dot) duration=0.35s
