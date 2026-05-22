---
title: ManimCELogo
description: Recreate logo composition with MathTex + circle/square/triangle primitives.
source_manim_url: https://docs.manim.community/en/stable/examples.html#manimcelogo
source_example_path: examples/gallery/manim_ce_logo.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - Exact font metrics and layer blending differ from Manim output.
category: Basic Concepts
status: ported
order: 12
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at -480,-270 fill="#111827"
math m "\\mathbb{M}" at 0,0 size=120 fill="#e5e7eb" renderer=katex
circle c r=86 at -70,50 fill="#83c167" stroke="#111827" strokeWidth=2
rect s w=172 h=172 at 0,-66 fill="#58c4dd" stroke="#111827" strokeWidth=2
triangle t w=176 h=156 at 72,50 fill="#fc6255" stroke="#111827" strokeWidth=2
at 0s:
  play AnimationGroup(FadeIn(c), FadeIn(s), FadeIn(t), lagRatio=0.12) duration=1.1s easing=easeOut
  play Write(m) duration=0.9s easing=easeOut
