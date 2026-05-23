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
axes ax xRange=-1,10 yRange=-1.5,1.5 at=-80,20 width=760 height=330 stroke="#cbd5e1" strokeWidth=3
plot sinCurve fn="sin(t)" range=0,7 samples=460 at=-80,20 scaleX=76 scaleY=110 stroke="#ef4444" strokeWidth=4
plot cosCurve fn="cos(t)" range=0,7 samples=460 at=-80,20 scaleX=76 scaleY=110 stroke="#3b82f6" strokeWidth=4
text xLabel "x" at 315,34 size=24 fill="#e2e8f0"
text yLabel "y" at -95,-145 size=24 fill="#e2e8f0"
text sinLabel "\\sin(x)" at 287,-88 size=28 fill="#ef4444"
text cosLabel "\\cos(x)" at 287,-40 size=28 fill="#3b82f6"
at 0s:
  play Create(ax) duration=1.4s easing=easeOut
at 1.0s:
  play Create(sinCurve) duration=2.0s easing=easeInOut
at 1.5s:
  play Create(cosCurve) duration=2.0s easing=easeInOut
at 3.9s:
  play AnimationGroup(FadeIn(xLabel), FadeIn(yLabel), FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.1) duration=0.9s easing=easeOut
