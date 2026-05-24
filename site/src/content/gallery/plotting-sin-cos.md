---
title: SinAndCosFunctionPlot
description: "Manim Example: `SinAndCosFunctionPlot` (`#sinandcosfunctionplot`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinandcosfunctionplot
source_example_path: examples/plotting_with_manim.py
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Tick labels / advanced GraphScene theming are not yet implemented; axes are drawn as explicit line primitives to match the source scene layout."
    layer: dsl
    impact: low
    workaround: "x/y axes and labels are positioned from the source example coordinates, while sin/cos curves use `plot` over `0..2*pi`."
    closure_condition: "Axes tick labels and Manim-style axis theming are available directly in Text DSL."
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Plotting with Manim
status: ported
order: 30
---
scene width=960 height=540 fps=60
line xAxis x1=0 y1=0 x2=633.75 y2=0 at -285,120 stroke="#e2e8f0" strokeWidth=2
line yAxis x1=0 y1=-148.5 x2=0 y2=148.5 at -285,120 stroke="#e2e8f0" strokeWidth=2
text xLabel "x" at 368,135 size=28 fill="#e2e8f0"
text yLabel "y" at -300,-39 size=28 fill="#e2e8f0"
plot sinCurve fn="sin(t)" range=0,6.283185307179586 samples=260 at=-285,120 scaleX=97.5 scaleY=67.5 stroke="#22d3ee" strokeWidth=3
plot cosCurve fn="cos(t)" range=0,6.283185307179586 samples=260 at=-285,120 scaleX=97.5 scaleY=67.5 stroke="#f97316" strokeWidth=3
text sinLabel "sin(x)" at 271,46 size=28 fill="#e2e8f0"
text cosLabel "cos(x)" at 271,-15 size=28 fill="#e2e8f0"
at 0s:
  show xAxis
  show yAxis
  show xLabel
  show yLabel

play Create(sinCurve) duration=1.2s easing=easeInOut
play Create(cosCurve) duration=1.2s easing=easeInOut
play AnimationGroup(FadeIn(sinLabel), FadeIn(cosLabel), lagRatio=0.1) duration=0.8s easing=easeOut
