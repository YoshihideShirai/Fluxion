---
title: SinAndCosFunctionPlot
description: "Manim Example: `SinAndCosFunctionPlot` (`#sinandcosfunctionplot`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinandcosfunctionplot
source_example_path: examples/plotting_with_manim.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Axes tick generation is manual, but axis colors, curve range, graph labels, and x=2π vertical marker match the source scene visually."
    layer: dsl
    impact: low
    workaround: "x/y axes and labels are positioned from the source example coordinates."
    closure_condition: "Axes tick labels and Manim-style axis theming are available directly in Text DSL."
    fidelity_upgrade_condition: "追加対応不要。"
category: Plotting with Manim
status: ported
order: 30
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
line xAxis x1=-320 y1=0 x2=330 y2=0 at 0,30 stroke="#83C167" strokeWidth=3
line yAxis x1=0 y1=-132 x2=0 y2=132 at 0,30 stroke="#83C167" strokeWidth=3
line tickM10 x1=0 y1=-7 x2=0 y2=7 at -310,30 stroke="#83C167" strokeWidth=2
line tickM8 x1=0 y1=-7 x2=0 y2=7 at -248,30 stroke="#83C167" strokeWidth=2
line tickM6 x1=0 y1=-7 x2=0 y2=7 at -186,30 stroke="#83C167" strokeWidth=2
line tickM4 x1=0 y1=-7 x2=0 y2=7 at -124,30 stroke="#83C167" strokeWidth=2
line tickM2 x1=0 y1=-7 x2=0 y2=7 at -62,30 stroke="#83C167" strokeWidth=2
line tick2 x1=0 y1=-7 x2=0 y2=7 at 62,30 stroke="#83C167" strokeWidth=2
line tick4 x1=0 y1=-7 x2=0 y2=7 at 124,30 stroke="#83C167" strokeWidth=2
line tick6 x1=0 y1=-7 x2=0 y2=7 at 186,30 stroke="#83C167" strokeWidth=2
line tick8 x1=0 y1=-7 x2=0 y2=7 at 248,30 stroke="#83C167" strokeWidth=2
line tick10 x1=0 y1=-7 x2=0 y2=7 at 310,30 stroke="#83C167" strokeWidth=2
text xM10 "-10" at -310,56 size=18 fill="#ffffff"
text xM8 "-8" at -248,56 size=18 fill="#ffffff"
text xM6 "-6" at -186,56 size=18 fill="#ffffff"
text xM4 "-4" at -124,56 size=18 fill="#ffffff"
text xM2 "-2" at -62,56 size=18 fill="#ffffff"
text x2 "2" at 62,56 size=18 fill="#ffffff"
text x4 "4" at 124,56 size=18 fill="#ffffff"
text x6 "6" at 186,56 size=18 fill="#ffffff"
text x8 "8" at 248,56 size=18 fill="#ffffff"
text x10 "10" at 310,56 size=18 fill="#ffffff"
math xLabel "x" at 350,44 size=28 fill="#ffffff"
math yLabel "y" at -18,-122 size=28 fill="#ffffff"
plot sinCurve fn="sin(t)" range=-10,10.3 samples=420 at=0,30 scaleX=31 scaleY=80 stroke="#58C4DD" strokeWidth=4
plot cosCurve fn="cos(t)" range=-10,10.3 samples=420 at=0,30 scaleX=31 scaleY=80 stroke="#FC6255" strokeWidth=4
line tauLine x1=0 y1=0 x2=0 y2=-80 at 194.779,30 stroke="#FFFF00" strokeWidth=4
math sinLabel "\sin(x)" at -260,-74 size=28 fill="#58C4DD"
math cosLabel "\cos(x)" at 176,-54 size=28 fill="#FC6255"
math tauLabel "x=2\pi" at 236,-76 size=26 fill="#ffffff"

wait 1s
