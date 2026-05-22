---
title: Opening Manim Community Banner
description: Inspired by OpeningManim; staged title + subtitle reveal using LaggedStart.
source_manim_url: https://docs.manim.community/en/stable/examples.html#openingmanim
source_example_path: examples/gallery/opening_manim.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - Text kerning still depends on browser font metrics and may differ slightly from Manim raster output.
category: Advanced Projects
status: ported
order: 51
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#030712"
text title "Manim Community" at 480,210 size=56 fill="#93c5fd"
text subtitle "Rendered with Fluxion DSL" at 480,290 size=32 fill="#e5e7eb"
at 0s:
  play LaggedStart(Write(title), FadeIn(subtitle), lagRatio=0.28) duration=1.8s easing=easeOut
at 2.8s:
  play FadeOut(subtitle) duration=0.8s easing=easeInOut
