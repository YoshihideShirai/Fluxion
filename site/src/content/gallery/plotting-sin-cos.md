---
title: SinAndCosFunctionPlot
description: "Manim Example: `SinAndCosFunctionPlot` (`#sinandcosfunctionplot`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#sinandcosfunctionplot
source_example_path: examples/gallery/plotting-sin-cos.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Axes / axis labels / plot / vertical marker / graph labels are represented by Text DSL helpers. `graphLabel` derives sin/cos/vertical-line labels from plotted curve points and accepts small metric offsets for browser MathTex differences."
    layer: dsl
    impact: low
    workaround: "`Axes(x_range=[-10, 10.3, 1], y_range=[-1.5, 1.5, 1], x_length=10, axis_config={color: GREEN}, x_axis_config={numbers_to_include: np.arange(-10, 10.01, 2)}, tips=False)` is represented by the `axes` helper at Manim's 67.5px/unit frame scale: 675px x length, default 405px y length, generated x ticks/numbers, `axisLabels`, `plot` curves, `graphLabel`, and `dataLine` for `axes.get_vertical_line(...)`."
    closure_condition: "Generic Manim Axes plotting API maps directly to Text DSL without helper-specific lowering."
    fidelity_upgrade_condition: "追加対応不要。"
category: Plotting with Manim
status: ported
gap_id: GAP-004
order: 30
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
axes ax at 0,0 width=675 height=405 xRange=-10,10.3 yRange=-1.5,1.5 stroke="#83C167" strokeWidth=2 xTicks=-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9,10 yTicks=-1,1 xNumbers=-10,-8,-6,-4,-2,2,4,6,8,10 tickLength=12 tickStrokeWidth=2 numberSize=18 numberColor="#ffffff" xNumberOffset=26
axisLabels axis_labels axes=ax x="x" y="y" size=28 fill="#ffffff" xBuff=36.5 xYOffset=36 yBuff=-28 yYOffset=-25.5
plot sinCurve fn="sin(t)" range=-10,10.3 samples=420 at=-4.987685,0 scaleX=33.251232 scaleY=135 stroke="#58C4DD" strokeWidth=4
plot cosCurve fn="cos(t)" range=-10,10.3 samples=420 at=-4.987685,0 scaleX=33.251232 scaleY=135 stroke="#FC6255" strokeWidth=4
dataLine tauLine axes=ax from=6.283185,0 to=6.283185,1 stroke="#FFFF00" strokeWidth=4
graphLabel sinLabel plot=sinCurve label="\sin(x)" xVal=-10 direction=up size=28 fill="#58C4DD" w=63 h=43.37 xOffset=-18.5
graphLabel cosLabel plot=cosCurve label="\cos(x)" direction=right size=28 fill="#FC6255" w=67.25 h=43.4 yOffset=-0.5
graphLabel tauLabel plot=cosCurve label="x=2\pi" xVal=6.283185 direction=ur size=26 fill="#ffffff" w=75 h=40.3 xOffset=3.615 yOffset=-8.819
