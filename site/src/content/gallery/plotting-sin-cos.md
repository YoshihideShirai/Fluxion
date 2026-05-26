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

rect bg w=960 h=540 at 0,0 fill="#080b14"
rect panel w=820 h=380 at 0,-18 fill="#0f172a" stroke="#1e293b" strokeWidth=2
text title "SinAndCosFunctionPlot" at -214,204 size=38 fill="#f8fafc"
text subtitle "Axes + plotted functions over 0..2π" at 154,204 size=22 fill="#bae6fd"
line xAxis x1=0 y1=0 x2=633.75 y2=0 at -285,90 stroke="#e2e8f0" strokeWidth=2
line yAxis x1=0 y1=-148.5 x2=0 y2=148.5 at -285,90 stroke="#e2e8f0" strokeWidth=2
line gridA x1=0 y1=67.5 x2=633.75 y2=67.5 at -285,90 stroke="#1e293b" strokeWidth=2
line gridB x1=0 y1=-67.5 x2=633.75 y2=-67.5 at -285,90 stroke="#1e293b" strokeWidth=2
line gridC x1=306 y1=-148.5 x2=306 y2=148.5 at -285,90 stroke="#1e293b" strokeWidth=2
line gridD x1=613 y1=-148.5 x2=613 y2=148.5 at -285,90 stroke="#1e293b" strokeWidth=2
text xLabel "x" at 368,105 size=28 fill="#e2e8f0"
text yLabel "y" at -300,-69 size=28 fill="#e2e8f0"
text zeroLabel "0" at -304,116 size=18 fill="#94a3b8"
text piLabel "π" at 10,116 size=20 fill="#94a3b8"
text tauLabel "2π" at 322,116 size=20 fill="#94a3b8"
text oneLabel "1" at -318,24 size=18 fill="#94a3b8"
text negOneLabel "-1" at -326,158 size=18 fill="#94a3b8"
plot sinCurve fn="sin(t)" range=0,6.283185307179586 samples=260 at=-285,90 scaleX=97.5 scaleY=67.5 stroke="#22d3ee" strokeWidth=4
plot cosCurve fn="cos(t)" range=0,6.283185307179586 samples=260 at=-285,90 scaleX=97.5 scaleY=67.5 stroke="#f97316" strokeWidth=4
text sinLabel "sin(x)" at 271,16 size=28 fill="#22d3ee"
text cosLabel "cos(x)" at 271,-45 size=28 fill="#f97316"
text note "two Plot mobjects share the same axes and scale" at 0,-224 size=20 fill="#94a3b8"
at 0s:
  show bg
  play FadeIn(panel) duration=0.35s
  play FadeIn(title) duration=0.5s
  play FadeIn(subtitle) duration=0.45s
  show xAxis
  show yAxis
  play AnimationGroup(Create(gridA), Create(gridB), Create(gridC), Create(gridD), lagRatio=0.05) duration=0.55s
  show xLabel
  show yLabel
  play AnimationGroup(FadeIn(zeroLabel), FadeIn(piLabel), FadeIn(tauLabel), FadeIn(oneLabel), FadeIn(negOneLabel), lagRatio=0.05) duration=0.45s

play Create(sinCurve) duration=1.2s easing=easeInOut
play Create(cosCurve) duration=1.2s easing=easeInOut
play AnimationGroup(FadeIn(sinLabel), FadeIn(cosLabel), FadeIn(note), lagRatio=0.1) duration=0.8s easing=easeOut
