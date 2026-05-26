---
title: GradientImageFromArray
description: "Manim Example: `GradientImageFromArray` (`#gradientimagefromarray`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#gradientimagefromarray
source_example_path: examples/gallery/gradient-image-from-array.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "配列から直接画像を生成する image mobject が未対応のため、セル分割グリッドで擬似グラデーションを構成している。"
    layer: compiler
    impact: high
    workaround: "複数 rect の色差でヒートマップ/グラデーションを近似する。"
    closure_condition: "image(width,height,data=...) 形式のプリミティブとピクセル配列入力を実装する。"
    fidelity_upgrade_condition: "NumPy配列由来の画像を1ノードとして生成し、補間・拡大縮小を本家同等で再現できる時。"
category: Manim Stable Examples
status: partial
order: 63
gap_id: GAP-017
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=800 h=365 at 0,-28 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "GradientImageFromArray" at -244,206 size=38 fill="#f8fafc"
text subtitle "np.uint8 array -> ImageMobject approximation" at 126,206 size=21 fill="#bae6fd"
text arrayLabel "3 x 5 color array" at -226,142 size=18 fill="#94a3b8"
text imageLabel "rendered pixels" at 168,142 size=18 fill="#94a3b8"

rect c00 w=76 h=76 at -258,68 fill="#1d4ed8" stroke="#0f172a" strokeWidth=2
rect c01 w=76 h=76 at -178,68 fill="#2563eb" stroke="#0f172a" strokeWidth=2
rect c02 w=76 h=76 at -98,68 fill="#3b82f6" stroke="#0f172a" strokeWidth=2
rect c03 w=76 h=76 at -18,68 fill="#60a5fa" stroke="#0f172a" strokeWidth=2
rect c04 w=76 h=76 at 62,68 fill="#93c5fd" stroke="#0f172a" strokeWidth=2

rect c10 w=76 h=76 at -258,-12 fill="#0369a1" stroke="#0f172a" strokeWidth=2
rect c11 w=76 h=76 at -178,-12 fill="#0ea5e9" stroke="#0f172a" strokeWidth=2
rect c12 w=76 h=76 at -98,-12 fill="#22d3ee" stroke="#0f172a" strokeWidth=2
rect c13 w=76 h=76 at -18,-12 fill="#67e8f9" stroke="#0f172a" strokeWidth=2
rect c14 w=76 h=76 at 62,-12 fill="#a5f3fc" stroke="#0f172a" strokeWidth=2

rect c20 w=76 h=76 at -258,-92 fill="#15803d" stroke="#0f172a" strokeWidth=2
rect c21 w=76 h=76 at -178,-92 fill="#22c55e" stroke="#0f172a" strokeWidth=2
rect c22 w=76 h=76 at -98,-92 fill="#4ade80" stroke="#0f172a" strokeWidth=2
rect c23 w=76 h=76 at -18,-92 fill="#86efac" stroke="#0f172a" strokeWidth=2
rect c24 w=76 h=76 at 62,-92 fill="#bbf7d0" stroke="#0f172a" strokeWidth=2

rect enlarged w=214 h=214 at 252,-12 fill="#22d3ee" stroke="#e0f2fe" strokeWidth=4 opacity=0.92
rect enlarged_a w=214 h=70 at 252,60 fill="#93c5fd" opacity=0.86
rect enlarged_b w=214 h=70 at 252,-12 fill="#22d3ee" opacity=0.88
rect enlarged_c w=214 h=70 at 252,-84 fill="#4ade80" opacity=0.88
line connector_a x1=-60 y1=26 x2=145 y2=82 at 0,0 stroke="#94a3b8" strokeWidth=2 opacity=0.45
line connector_b x1=-60 y1=-50 x2=145 y2=-106 at 0,0 stroke="#94a3b8" strokeWidth=2 opacity=0.45
surroundingRect frame target=c12 buff=8 stroke="#f8fafc" strokeWidth=3
text pix "sample pixel [1, 2]" at -98,-168 size=20 fill="#e2e8f0" opacity=0
text note "until image arrays are native, colored cells preserve the visual structure" at 0,-226 size=20 fill="#94a3b8"

at 0s:
  show bg
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(subtitle) duration=0.4s
  play AnimationGroup(FadeIn(arrayLabel), FadeIn(imageLabel), lagRatio=0.08) duration=0.4s

play FadeIn(c00) duration=0.15s
play FadeIn(c01) duration=0.15s
play FadeIn(c02) duration=0.15s
play FadeIn(c03) duration=0.15s
play FadeIn(c04) duration=0.15s
play FadeIn(c10) duration=0.15s
play FadeIn(c11) duration=0.15s
play FadeIn(c12) duration=0.15s
play FadeIn(c13) duration=0.15s
play FadeIn(c14) duration=0.15s
play FadeIn(c20) duration=0.15s
play FadeIn(c21) duration=0.15s
play FadeIn(c22) duration=0.15s
play FadeIn(c23) duration=0.15s
play FadeIn(c24) duration=0.15s

play AnimationGroup(FadeIn(enlarged), FadeIn(enlarged_a), FadeIn(enlarged_b), FadeIn(enlarged_c), Create(connector_a), Create(connector_b), lagRatio=0.08) duration=0.75s easing=easeOut
play Create(frame) duration=0.5s
play FadeIn(pix) duration=0.3s
play FadeIn(note) duration=0.4s
wait 0.6s
