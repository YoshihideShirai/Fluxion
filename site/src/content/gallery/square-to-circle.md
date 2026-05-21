---
title: Basic Concepts: Square to Circle
description: Text DSL version of examples/basic_concepts_square_to_circle.py.
source_manim_url: https://docs.manim.community/en/stable/examples.html#squaretocircle
category: Basic Concepts
status: ported
order: 11
---
scene width=960 height=540 fps=60
rect square w=170 h=170 at 480,270 fill="none" stroke="#38bdf8" strokeWidth=8
circle circle r=85 at 480,270 fill="#38bdf8" stroke="#bae6fd" strokeWidth=6 opacity=0
at 0s:
  play Create(square) duration=1.0s easing=easeOut
wait 0.3s
show circle
play Transform(square, circle) duration=1.1s easing=easeInOut
wait 0.3s
play FadeOut(square) duration=0.8s easing=easeInOut
