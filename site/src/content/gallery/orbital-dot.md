---
title: Orbital Dot
description: Parametric movement using value trackers, expressions, and Transform.
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointmovingonshapes
source_example_path: examples/gallery/orbital_dot.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - Updater-style continuous re-binding is approximated with expression updates.
category: Animations
status: ported
order: 21
---
scene width=960 height=540 fps=60
value theta = 0
rect bg w=960 h=540 at -480,-270 fill="#020617"
path orbit d="M -140 0 C -140 -77 -77 -140 0 -140 C 77 -140 140 -77 140 0 C 140 77 77 140 0 140 C -77 140 -140 77 -140 0" at 0,10 fill="none" stroke="#1d4ed8" strokeWidth=4 opacity=0.55
circle dot r=28 at -140,10 fill="#38bdf8" stroke="#0f172a" strokeWidth=4
rect card w=180 h=92 at 260,10 fill="#f97316" stroke="#fed7aa" strokeWidth=4
at 0s:
  hide card
  play AnimationGroup(FadeIn(orbit), FadeIn(dot), lagRatio=0.15) duration=1.1s easing=easeOut
animate theta from 0 to 6.283 duration=2.2s easing=linear
set dot.x to expr="0 + 140 * cos(theta)"
set dot.y to expr="10 + 140 * sin(theta)"
at 2.2s:
  play FadeIn(card) duration=0.5s easing=easeOut
at 2.5s:
  play Transform(dot, card) duration=1.0s easing=easeInOut
