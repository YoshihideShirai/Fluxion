---
title: SineCurveUnitCircle
description: Unit circle tracer with continuously extended sine curve.
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinecurveunitcircle
source_example_path: examples/gallery/sine_curve_unit_circle.fluxion.txt
porting_strategy: omitted_parts
fidelity: visual_approximation
known_gaps:
  - Path growth can now be sampled with `always ... = path(...)`, but true append-only stroke history parity is still simplified.
category: Advanced Projects
status: partial
order: 52
---
scene width=960 height=540 fps=60
value theta = 0
circle origin r=3 at -240,0 fill="#e2e8f0" stroke="none"
circle unit r=96 at -240,0 fill="none" stroke="#334155" strokeWidth=2
circle dot r=8 at -144,0 fill="#38bdf8" stroke="none"
line radius x1=0 y1=0 x2=96 y2=0 at -240,0 stroke="#38bdf8" strokeWidth=2
always dot.x = expr=-240 + 96*cos(theta)
always dot.y = expr=0 + 96*sin(theta)
always radius.x2 = expr=96*cos(theta)
always radius.y2 = expr=96*sin(theta)
animate theta from 0 to 12.56 duration=8s easing=linear
