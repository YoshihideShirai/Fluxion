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

rect bg w=960 h=540 at 0,0 fill="#050816"
text title "GraphAreaPlot" at 0,220 size=40 fill="#f8fafc"
math integral "\\int_a^b f(x)\\,dx" at 258,154 size=40 fill="#fef3c7" renderer=katex opacity=0
rect panel w=790 h=340 at -20,-34 fill="#0f172a" stroke="#334155" strokeWidth=2
axes ax at -20,-34 width=720 height=300 xRange=-4,4 yRange=-2,2 stroke="#64748b" strokeWidth=2
plot curve fn=sin(t)+0.2*t range=-3.14,3.14 samples=180 scaleX=95 scaleY=60 at -20,-34 stroke="#38bdf8" strokeWidth=4
plot area fn=sin(t)+0.2*t range=-1.8,2.4 samples=130 scaleX=95 scaleY=60 at -20,-34 close=true fill="#38bdf8" opacity=0.26 stroke="#0ea5e9" strokeWidth=2
line a_line x1=0 y1=-118 x2=0 y2=62 at -191,-34 stroke="#fef08a" strokeWidth=3 opacity=0
line b_line x1=0 y1=-118 x2=0 y2=105 at 208,-34 stroke="#fef08a" strokeWidth=3 opacity=0
circle a_dot r=8 at -191,-18 fill="#facc15" stroke="#713f12" strokeWidth=2 opacity=0
circle b_dot r=8 at 208,72 fill="#facc15" stroke="#713f12" strokeWidth=2 opacity=0
text a_label "a" at -191,-172 size=24 fill="#fef08a" opacity=0
text b_label "b" at 208,-172 size=24 fill="#fef08a" opacity=0
text area_label "area under curve" at 10,-202 size=22 fill="#bae6fd" opacity=0
text note "closed path fill approximates Manim get_area" at 0,-232 size=18 fill="#94a3b8"

at 0s:
  play FadeIn(title) duration=0.5s
  play FadeIn(integral) duration=0.45s
  play FadeIn(panel) duration=0.35s
  play Create(ax) duration=0.8s
  play Create(curve) duration=1.2s
  play AnimationGroup(FadeIn(a_line), FadeIn(b_line), FadeIn(a_dot), FadeIn(b_dot), FadeIn(a_label), FadeIn(b_label), lagRatio=0.08) duration=0.75s easing=easeOut
  play FadeIn(area) duration=0.8s
  play FadeIn(area_label) duration=0.35s
  play FadeIn(note) duration=0.5s
