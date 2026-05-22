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
axes ax xRange=-5,5 yRange=-3,3 at=0,30 width=760 height=360 stroke="#94a3b8" strokeWidth=3
plot sinCurve fn="sin(t)" range=-5,5 samples=320 at=0,30 scaleX=76 scaleY=60 stroke="#38bdf8" strokeWidth=5
plot cosCurve fn="cos(t)" range=-5,5 samples=320 at=0,30 scaleX=76 scaleY=60 stroke="#f97316" strokeWidth=5
text sinLabel "sin(x)" at 290,-60 size=28 fill="#38bdf8"
text cosLabel "cos(x)" at 290,-20 size=28 fill="#f97316"
at 0s:
  play Create(ax) duration=0.9s easing=easeOut
  play AnimationGroup(Create(sinCurve), Create(cosCurve), FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.1) duration=1.8s easing=easeInOut
