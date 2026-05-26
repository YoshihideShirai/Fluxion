---
title: ArgMinExample
description: "Manim Example: `ArgMinExample` (`#argminexample`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#argminexample
source_example_path: examples/gallery/arg-min-example.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "座標軸/グラフの正確なプロットは line/path で近似しており、Manim 本家の Axes API 完全互換ではない。"
    layer: runtime
    impact: medium
    workaround: "線分とテキストで概念説明は可能。"
    closure_condition: "Axes/NumberPlane 系プリミティブを導入し、ラベルと目盛りを自動生成できる。"
    fidelity_upgrade_condition: "曲線サンプリングと軸ラベル配置が本家と同等になった時。"
category: Manim Stable Examples
status: partial
order: 60
gap_id: GAP-013
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#050816"
text title "ArgMinExample" at 0,220 size=42 fill="#f8fafc"
math formula "f(x)=0.08x^3-0.7x+0.35" at 0,176 size=34 fill="#bae6fd" renderer=katex opacity=0
rect panel w=760 h=330 at 0,-30 fill="#0f172a" stroke="#334155" strokeWidth=2
line x_axis x1=-330 y1=0 x2=330 y2=0 at 0,-90 stroke="#94a3b8" strokeWidth=3
line y_axis x1=0 y1=-150 x2=0 y2=155 at -300,-40 stroke="#94a3b8" strokeWidth=3
line tick_a x1=0 y1=-8 x2=0 y2=8 at -214,-90 stroke="#64748b" strokeWidth=2
line tick_b x1=0 y1=-8 x2=0 y2=8 at 188,-90 stroke="#64748b" strokeWidth=2
text x_label "x" at 346,-112 size=22 fill="#cbd5e1"
text y_label "f(x)" at -334,126 size=22 fill="#cbd5e1"
text min_x "x_min" at -214,-126 size=20 fill="#86efac" opacity=0
text max_x "x_max" at 188,-126 size=20 fill="#fdba74" opacity=0
path curve d="M -286 82 C -232 0 -208 -132 -118 -116 C -42 -102 -12 -18 34 26 C 86 78 134 112 202 82 C 244 64 266 18 292 -56" at 0,-10 fill="none" stroke="#38bdf8" strokeWidth=5
path curve_glow d="M -286 82 C -232 0 -208 -132 -118 -116 C -42 -102 -12 -18 34 26 C 86 78 134 112 202 82 C 244 64 266 18 292 -56" at 0,-10 fill="none" stroke="#7dd3fc" strokeWidth=10 opacity=0.16
line min_v x1=0 y1=0 x2=0 y2=-132 at -214,42 stroke="#22c55e" strokeWidth=3 opacity=0
line max_v x1=0 y1=0 x2=0 y2=112 at 188,-18 stroke="#f97316" strokeWidth=3 opacity=0
circle min_dot r=12 at -214,-90 fill="#22c55e" stroke="#052e16" strokeWidth=3 opacity=0
circle max_dot r=12 at 188,94 fill="#f97316" stroke="#7c2d12" strokeWidth=3 opacity=0
rect min_tag w=148 h=44 at -134,-168 fill="#052e16" stroke="#22c55e" strokeWidth=2 opacity=0
rect max_tag w=148 h=44 at 268,138 fill="#431407" stroke="#f97316" strokeWidth=2 opacity=0
text min_label "arg min" at -134,-169 size=24 fill="#bbf7d0" opacity=0
text max_label "arg max" at 268,137 size=24 fill="#fed7aa" opacity=0

at 0s:
  show bg
  play FadeIn(title) duration=0.55s
  play FadeIn(formula) duration=0.45s
  play FadeIn(panel) duration=0.35s
  play LaggedStart(Create(x_axis), Create(y_axis), Create(tick_a), Create(tick_b), FadeIn(x_label), FadeIn(y_label), lagRatio=0.08) duration=0.9s easing=easeOut
  play Create(curve_glow) duration=0.8s
  play Create(curve) duration=1.25s easing=easeOut

wait 0.2s
play AnimationGroup(FadeIn(min_v), FadeIn(min_dot), FadeIn(min_tag), FadeIn(min_label), FadeIn(min_x), lagRatio=0.08) duration=0.7s easing=easeOut
wait 0.2s
play AnimationGroup(FadeIn(max_v), FadeIn(max_dot), FadeIn(max_tag), FadeIn(max_label), FadeIn(max_x), lagRatio=0.08) duration=0.7s easing=easeOut
wait 0.8s
