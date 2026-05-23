---
title: GraphAreaPlot
description: "Manim Example: `GraphAreaPlot` (`#graphareaplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#graphareaplot
source_example_path: examples/gallery/graph-area-plot.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "面積塗りは `plot ... close=true` の閉路近似で、Manim の `get_area` スタイル完全互換ではない。"
    layer: dsl
    impact: medium
    workaround: "関数を閉路 path に変換して fill を重ねる。"
    closure_condition: "領域塗り専用 primitive が追加され、軸との境界指定を直接扱える。"
    fidelity_upgrade_condition: "Manim の area 指定 API と同等の記述性・表現が得られた時。"
category: Manim Stable Examples
status: partial
order: 64
gap_id: GAP-016
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "GraphAreaPlot" at 0,220 size=40 fill="#e2e8f0"
axes ax at -20,-30 width=720 height=300 xRange=-4,4 yRange=-2,2 stroke="#64748b" strokeWidth=2
plot curve fn=sin(t)+0.2*t range=-3.14,3.14 samples=180 scaleX=95 scaleY=60 at -20,-30 stroke="#38bdf8" strokeWidth=4
plot area fn=sin(t)+0.2*t range=-3.14,3.14 samples=180 scaleX=95 scaleY=60 at -20,-30 close=true fill="#38bdf8" opacity=0.22 stroke="none"
text note "Area is approximated via closed plot path" at 0,-214 size=22 fill="#94a3b8"

at 0s:
  play FadeIn(title) duration=0.5s
  play Create(ax) duration=0.8s
  play Create(curve) duration=1.2s
  play FadeIn(area) duration=0.8s
  play FadeIn(note) duration=0.5s
