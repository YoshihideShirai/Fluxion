---
title: Plotting with Manim (Sin / Cos)
description: Text DSL version of plotting example with axes and two curves.
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinandcosfunctionplot
source_example_path: examples/plotting_with_manim.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - Tick labels / advanced GraphScene theming are not yet implemented.
category: Plotting with Manim
status: ported
order: 30
---
scene width=960 height=540 fps=60
axes ax xRange=0,6.5 yRange=-1.5,1.5 at=-120,40 width=720 height=300 stroke="#94a3b8" strokeWidth=3
plot sinCurve fn="sin(t)" range=0,6.2831853072 samples=420 at=-120,40 scaleX=111 scaleY=96 stroke="#22d3ee" strokeWidth=4
plot cosCurve fn="cos(t)" range=0,6.2831853072 samples=420 at=-120,40 scaleX=111 scaleY=96 stroke="#f97316" strokeWidth=4
text xLabel "x" at 262,56 size=24 fill="#e2e8f0"
text yLabel "y" at -137,-124 size=24 fill="#e2e8f0"
text sinLabel "sin(x)" at 238,-48 size=28 fill="#22d3ee"
text cosLabel "cos(x)" at 238,38 size=28 fill="#f97316"
at 0s:
  play AnimationGroup(Create(ax), FadeIn(xLabel), FadeIn(yLabel), lagRatio=0.0) duration=0.6s easing=easeOut
at 0.6s:
  play Create(sinCurve) duration=1.2s easing=linear
at 1.8s:
  play Create(cosCurve) duration=1.2s easing=linear
at 3.0s:
  play AnimationGroup(FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.1) duration=0.8s easing=easeOut
