---
title: PolygonOnAxes
description: "Manim Example: `PolygonOnAxes` (`#polygononaxes`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#polygononaxes
source_example_path: examples/gallery/polygon-on-axes.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Axes 上のデータ座標 API（`coords_to_point` 相当）は未実装で、polygon 頂点を scene 座標で直接指定している。"
    layer: dsl
    impact: medium
    workaround: "`axes` は視覚ガイドとして使い、polygon/path 座標は手計算した scene 座標で与える。"
    closure_condition: "Axes 座標変換 helper（data座標→scene座標）を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "Manim と同じデータ座標指定だけで polygon 配置を再現できる時。"
category: Manim Stable Examples
status: partial
order: 72
gap_id: GAP-025
---
scene width=960 height=540 fps=60

value alpha = 0

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "PolygonOnAxes" at 0,220 size=40 fill="#e2e8f0"
axes ax at 0,-30 width=760 height=340 xRange=-4,4 yRange=-2,2 stroke="#64748b" strokeWidth=2
path poly d="M -180 -60 L -40 90 L 170 40 Z" at 0,-30 fill="#22d3ee" opacity=0.2 stroke="#22d3ee" strokeWidth=3
text label "polygon on axes" at 0,-190 size=22 fill="#bae6fd"

always poly.rotation = expr=12*sin(alpha)
always poly.scale = expr=1 + 0.08*cos(alpha)

at 0s:
  play FadeIn(title) duration=0.5s
  play Create(ax) duration=0.8s
  play FadeIn(poly) duration=0.6s
  play FadeIn(label) duration=0.4s

wait 0.2s
animate alpha from 0 to 6.283 duration=2.8s easing=easeInOut
wait 0.2s
play FadeOut(poly) duration=0.4s
play FadeIn(poly) duration=0.4s
