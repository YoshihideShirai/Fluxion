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
axes ax xRange=0,6.5 yRange=-1.5,1.5 at=-110,24 width=740 height=320 stroke="#94a3b8" strokeWidth=3
plot sinCurve fn="sin(t)" range=0,6.5 samples=420 at=-110,24 scaleX=114 scaleY=102 stroke="#3b82f6" strokeWidth=4
plot cosCurve fn="cos(t)" range=0,6.5 samples=420 at=-110,24 scaleX=114 scaleY=102 stroke="#22c55e" strokeWidth=4
text xLabel "x" at 270,38 size=24 fill="#cbd5e1"
text yLabel "y" at -122,-128 size=24 fill="#cbd5e1"
text sinLabel "\\sin(x)" at 245,-72 size=28 fill="#3b82f6"
text cosLabel "\\cos(x)" at 245,-20 size=28 fill="#22c55e"
at 0s:
  play Create(ax) duration=1.2s easing=easeOut
at 1.0s:
  play Create(sinCurve) duration=1.8s easing=easeInOut
at 1.6s:
  play Create(cosCurve) duration=1.8s easing=easeInOut
at 3.6s:
  play AnimationGroup(FadeIn(xLabel), FadeIn(yLabel), FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.1) duration=0.9s easing=easeOut
