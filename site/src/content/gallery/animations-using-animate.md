---
title: Animations Using .animate
description: Text DSL version of examples/animations_using_animate.py.
source_manim_url: https://docs.manim.community/en/stable/examples.html#animationsusinganimate
category: Animations
status: ported
order: 20
---
scene width=960 height=540 fps=60
rect square w=160 h=160 at 300,270 fill="#38bdf8" stroke="#0f172a" strokeWidth=6
play FadeIn(square) duration=0.8s easing=easeOut
animate square.x from 300 to 640 duration=1.0s easing=easeInOut
animate square.fill from "#38bdf8" to "#f97316" duration=0.9s easing=easeInOut
animate square.scale from 1 to 1.9 duration=1.0s easing=easeOut
animate square.rotation from 0 to 180 duration=1.0s easing=easeInOut
