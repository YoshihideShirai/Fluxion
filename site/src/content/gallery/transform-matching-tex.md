---
title: Transform Matching Tex
description: Token-by-token math transform like Manim TransformMatchingTex.
source_manim_url: https://docs.manim.community/en/stable/examples.html#textransformexample
source_example_path: examples/gallery/transform_matching_tex.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - Token matching heuristics are simplified compared with Manim TransformMatchingTex.
category: Advanced Projects
status: ported
order: 50
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 480,270 fill="#111827"
math eq1 "x^2+y^2=r^2" at 480,220 size=58 fill="#bae6fd" renderer=katex expandTokens=true
math eq2 "x^2+y^2=R^2" at 480,220 size=58 fill="#fde68a" renderer=katex expandTokens=true
at 0s:
  hide eq2
  play Write(eq1) duration=1.2s easing=easeOut
wait 0.4s
show eq2
play TransformMatchingTex(eq1, eq2) duration=1.3s easing=easeInOut
