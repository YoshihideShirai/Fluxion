---
title: Plotting with Manim (Sin / Cos)
description: Text DSL version of plotting example with axes and two curves.
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinandcosfunctionplot
category: Plotting with Manim
status: ported
order: 30
---
scene width=960 height=540 fps=60
line xAxis x1=-380 y1=0 x2=380 y2=0 at 480,300 stroke="#94a3b8" strokeWidth=3
line yAxis x1=0 y1=-180 x2=0 y2=180 at 480,300 stroke="#94a3b8" strokeWidth=3
path sinCurve d="M 0 0 C 64 -52 128 -52 192 0 C 256 52 320 52 384 0 C 448 -52 512 -52 576 0 C 640 52 704 52 768 0" at 96,300 fill="none" stroke="#38bdf8" strokeWidth=5
path cosCurve d="M 0 -48 C 64 -48 128 0 192 48 C 256 96 320 96 384 48 C 448 0 512 -48 576 -48 C 640 -48 704 0 768 48" at 96,300 fill="none" stroke="#f97316" strokeWidth=5
text sinLabel "sin(x)" at 770,210 size=28 fill="#38bdf8"
text cosLabel "cos(x)" at 770,250 size=28 fill="#f97316"
at 0s:
  play AnimationGroup(Create(xAxis), Create(yAxis), lagRatio=0.15) duration=0.9s easing=easeOut
  play AnimationGroup(Create(sinCurve), Create(cosCurve), FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.1) duration=1.8s easing=easeInOut
