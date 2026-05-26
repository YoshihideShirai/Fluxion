---
title: HeatDiagramPlot
description: "Manim Example: `HeatDiagramPlot` (`#heatdiagramplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#heatdiagramplot
source_example_path: examples/gallery/heat-diagram-plot.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "本家の連続カラーマップ/数値軸連携は未対応で、矩形グリッドと色分けで近似している。"
    layer: runtime
    impact: medium
    workaround: "cell を個別 rect として並べ、段階色でヒートマップ風に表現する。"
    closure_condition: "image/heatmap 専用 primitive とカラーマップ補間を実装する。"
    fidelity_upgrade_condition: "連続値のサンプリングと凡例連携が Manim 相当で再現できる時。"
category: Manim Stable Examples
status: partial
order: 65
gap_id: GAP-018
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#050816"
text title "HeatDiagramPlot" at 0,220 size=40 fill="#f8fafc"
text subtitle "sampled heat map with stepped colormap" at 0,184 size=20 fill="#94a3b8"
rect frame w=650 h=330 at -40,-18 fill="#0f172a" stroke="#334155" strokeWidth=2

rect c00 w=72 h=72 at -302,88 fill="#1e3a8a" stroke="#0f172a" strokeWidth=2 opacity=0
rect c01 w=72 h=72 at -224,88 fill="#1d4ed8" stroke="#0f172a" strokeWidth=2 opacity=0
rect c02 w=72 h=72 at -146,88 fill="#2563eb" stroke="#0f172a" strokeWidth=2 opacity=0
rect c03 w=72 h=72 at -68,88 fill="#0ea5e9" stroke="#0f172a" strokeWidth=2 opacity=0
rect c04 w=72 h=72 at 10,88 fill="#22d3ee" stroke="#0f172a" strokeWidth=2 opacity=0
rect c05 w=72 h=72 at 88,88 fill="#67e8f9" stroke="#0f172a" strokeWidth=2 opacity=0

rect c10 w=72 h=72 at -302,10 fill="#1d4ed8" stroke="#0f172a" strokeWidth=2 opacity=0
rect c11 w=72 h=72 at -224,10 fill="#2563eb" stroke="#0f172a" strokeWidth=2 opacity=0
rect c12 w=72 h=72 at -146,10 fill="#0ea5e9" stroke="#0f172a" strokeWidth=2 opacity=0
rect c13 w=72 h=72 at -68,10 fill="#22d3ee" stroke="#0f172a" strokeWidth=2 opacity=0
rect c14 w=72 h=72 at 10,10 fill="#fde047" stroke="#0f172a" strokeWidth=2 opacity=0
rect c15 w=72 h=72 at 88,10 fill="#fb923c" stroke="#0f172a" strokeWidth=2 opacity=0

rect c20 w=72 h=72 at -302,-68 fill="#2563eb" stroke="#0f172a" strokeWidth=2 opacity=0
rect c21 w=72 h=72 at -224,-68 fill="#0ea5e9" stroke="#0f172a" strokeWidth=2 opacity=0
rect c22 w=72 h=72 at -146,-68 fill="#22d3ee" stroke="#0f172a" strokeWidth=2 opacity=0
rect c23 w=72 h=72 at -68,-68 fill="#fde047" stroke="#0f172a" strokeWidth=2 opacity=0
rect c24 w=72 h=72 at 10,-68 fill="#fb923c" stroke="#0f172a" strokeWidth=2 opacity=0
rect c25 w=72 h=72 at 88,-68 fill="#ef4444" stroke="#0f172a" strokeWidth=2 opacity=0

rect c30 w=72 h=72 at -302,-146 fill="#0ea5e9" stroke="#0f172a" strokeWidth=2 opacity=0
rect c31 w=72 h=72 at -224,-146 fill="#22d3ee" stroke="#0f172a" strokeWidth=2 opacity=0
rect c32 w=72 h=72 at -146,-146 fill="#fde047" stroke="#0f172a" strokeWidth=2 opacity=0
rect c33 w=72 h=72 at -68,-146 fill="#fb923c" stroke="#0f172a" strokeWidth=2 opacity=0
rect c34 w=72 h=72 at 10,-146 fill="#ef4444" stroke="#0f172a" strokeWidth=2 opacity=0
rect c35 w=72 h=72 at 88,-146 fill="#991b1b" stroke="#0f172a" strokeWidth=2 opacity=0

text x0 "0" at -302,-203 size=16 fill="#94a3b8"
text x1 "1" at -224,-203 size=16 fill="#94a3b8"
text x2 "2" at -146,-203 size=16 fill="#94a3b8"
text x3 "3" at -68,-203 size=16 fill="#94a3b8"
text x4 "4" at 10,-203 size=16 fill="#94a3b8"
text x5 "5" at 88,-203 size=16 fill="#94a3b8"
text y0 "0" at -372,88 size=16 fill="#94a3b8"
text y1 "1" at -372,10 size=16 fill="#94a3b8"
text y2 "2" at -372,-68 size=16 fill="#94a3b8"
text y3 "3" at -372,-146 size=16 fill="#94a3b8"

rect l0 w=28 h=26 at 250,-92 fill="#1e3a8a" opacity=0
rect l1 w=28 h=26 at 284,-92 fill="#2563eb" opacity=0
rect l2 w=28 h=26 at 318,-92 fill="#22d3ee" opacity=0
rect l3 w=28 h=26 at 352,-92 fill="#fde047" opacity=0
rect l4 w=28 h=26 at 386,-92 fill="#fb923c" opacity=0
rect l5 w=28 h=26 at 420,-92 fill="#ef4444" opacity=0
text cold "low" at 250,-128 size=20 fill="#93c5fd" opacity=0
text hot "high" at 420,-128 size=20 fill="#fca5a5" opacity=0
text zlabel "z value" at 336,-56 size=20 fill="#cbd5e1" opacity=0
surroundingRect hot_frame target=c25 buff=5 stroke="#fff7ed" strokeWidth=3
text hot_cell "peak" at 156,-68 size=20 fill="#fff7ed" opacity=0

at 0s:
  play FadeIn(title) duration=0.5s
  play FadeIn(subtitle) duration=0.35s
  play FadeIn(frame) duration=0.5s
  play LaggedStart(FadeIn(c00), FadeIn(c01), FadeIn(c02), FadeIn(c03), FadeIn(c04), FadeIn(c05), FadeIn(c10), FadeIn(c11), FadeIn(c12), FadeIn(c13), FadeIn(c14), FadeIn(c15), FadeIn(c20), FadeIn(c21), FadeIn(c22), FadeIn(c23), FadeIn(c24), FadeIn(c25), FadeIn(c30), FadeIn(c31), FadeIn(c32), FadeIn(c33), FadeIn(c34), FadeIn(c35), lagRatio=0.035) duration=1.6s easing=easeOut
  play AnimationGroup(FadeIn(x0), FadeIn(x1), FadeIn(x2), FadeIn(x3), FadeIn(x4), FadeIn(x5), FadeIn(y0), FadeIn(y1), FadeIn(y2), FadeIn(y3), lagRatio=0.02) duration=0.5s
  play AnimationGroup(FadeIn(l0), FadeIn(l1), FadeIn(l2), FadeIn(l3), FadeIn(l4), FadeIn(l5), FadeIn(cold), FadeIn(hot), FadeIn(zlabel), lagRatio=0.04) duration=0.7s
  play Create(hot_frame) duration=0.55s
  play FadeIn(hot_cell) duration=0.35s
