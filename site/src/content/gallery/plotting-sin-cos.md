---
title: SinAndCosFunctionPlot
description: "Manim Example: `SinAndCosFunctionPlot` (`#sinandcosfunctionplot`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinandcosfunctionplot
source_example_path: examples/plotting_with_manim.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Axes / plot / vertical marker are represented by Text DSL helpers, while graph-label placement is still explicit to match Manim's rendered positions."
    layer: dsl
    impact: low
    workaround: "`Axes(x_range=[-10, 10.3, 1], y_range=[-1.5, 1.5, 1], x_length=10, axis_config={color: GREEN}, x_axis_config={numbers_to_include: np.arange(-10, 10.01, 2)}, tips=False)` is represented by the `axes` helper with generated x ticks/numbers; `axes.plot(...)` is represented by `plot`, and `axes.get_vertical_line(...)` by `dataLine`."
    closure_condition: "Graph label placement can be derived from the plotted curve and direction options."
    fidelity_upgrade_condition: "追加対応不要。"
category: Plotting with Manim
status: ported
order: 30
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
axes ax at 0,30 width=638.6 height=264 xRange=-10.3,10.3 yRange=-1.65,1.65 stroke="#83C167" strokeWidth=3 xNumbers=-10,-8,-6,-4,-2,2,4,6,8,10 tickLength=14 tickStrokeWidth=2 numberSize=18 numberColor="#ffffff" xNumberOffset=26
math xLabel "x" at 350,44 size=28 fill="#ffffff"
math yLabel "y" at -18,-122 size=28 fill="#ffffff"
plot sinCurve fn="sin(t)" range=-10,10.3 samples=420 at=0,30 scaleX=31 scaleY=80 stroke="#58C4DD" strokeWidth=4
plot cosCurve fn="cos(t)" range=-10,10.3 samples=420 at=0,30 scaleX=31 scaleY=80 stroke="#FC6255" strokeWidth=4
dataLine tauLine axes=ax from=6.283185,0 to=6.283185,1 stroke="#FFFF00" strokeWidth=4
math sinLabel "\sin(x)" at -260,-74 size=28 fill="#58C4DD"
math cosLabel "\cos(x)" at 176,-54 size=28 fill="#FC6255"
math tauLabel "x=2\pi" at 236,-76 size=26 fill="#ffffff"

wait 1s
