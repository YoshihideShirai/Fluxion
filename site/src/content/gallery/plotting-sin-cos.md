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
plot sinCurve fn="sin(t)" range=0,6.5 samples=360 at=-120,40 scaleX=111 scaleY=96 stroke="#38bdf8" strokeWidth=5
plot cosCurve fn="cos(t)" range=0,6.5 samples=360 at=-120,40 scaleX=111 scaleY=96 stroke="#f97316" strokeWidth=5
text xLabel "x" at 255,56 size=24 fill="#cbd5e1"
text yLabel "y" at -132,-118 size=24 fill="#cbd5e1"
text sinLabel "sin(x)" at 240,-40 size=28 fill="#38bdf8"
text cosLabel "cos(x)" at 240,10 size=28 fill="#f97316"
at 0s:
  play Create(ax) duration=1.0s easing=easeOut
at 1.0s:
  play Create(sinCurve) duration=1.2s easing=easeInOut
at 2.2s:
  play Create(cosCurve) duration=1.2s easing=easeInOut
at 3.2s:
  play AnimationGroup(FadeIn(xLabel), FadeIn(yLabel), FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.12) duration=0.8s easing=easeOut
