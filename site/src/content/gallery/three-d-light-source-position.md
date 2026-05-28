---
title: ThreeDLightSourcePosition
description: "Manim Example: `ThreeDLightSourcePosition` (`#threedlightsourceposition`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedlightsourceposition
source_example_path: examples/gallery/three-d-light-source-position.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D renderer と実際の light_source shading は未実装だが、公式の ThreeDAxes と球面 Surface checkerboard は `threeDAxes` / `sphereSurface` helper から投影済み face 群へ展開している。"
    layer: runtime
    impact: medium
    workaround: "`ThreeDAxes()` を `threeDAxes` の Manim `ThreeDCamera` 透視投影 line/tick/tip 群で描き、公式既定の `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, `x_length=10.5`, `y_length=10.5`, `z_length=6.5` を保持する。`Surface(..., v_range=[0, TAU], u_range=[-PI/2, PI/2], checkerboard_colors=[RED_D, RED_E], resolution=(15,32))` を `sphereSurface` の shaded checkerboard path 群に展開し、公式 `self.add(axes, sphere)` と同じく axes の上に描画する。公式 `Surface` 既定の `stroke_color=LIGHT_GREY` / `stroke_width=0.5` も薄い面境界として保持する。公式 sphere 半径 1.5 は `worldRadius=1.5` と `phi=75`, `theta=30` の camera projection で描き、`light_source.move_to(3*IN)` を `light=0,0,-3` の位置光源として扱い、Manim `get_shaded_rgb` 相当の面 shading のみを適用する。"
    closure_condition: "Surface/Sphere、3D camera projection、light_source shading を runtime で扱えるようにする。"
    fidelity_upgrade_condition: "Manim の `Surface(... checkerboard_colors=...)` と `light_source.move_to` が同等に反映される時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-029
order: 76
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

threeDAxes axes at 0,0 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 xLength=10.5 yLength=10.5 zLength=6.5 phi=75 theta=30 unitScale=67.5 stroke="#FFFFFF" strokeWidth=2 tickSize=10 tickStrokeWidth=2 includeTicks=true includeTips=true

sphereSurface sphere at 0,0 radius=104 worldRadius=1.5 phi=75 theta=30 unitScale=67.5 resolution=15,32 fillA="#E65A4C" fillB="#CF5044" stroke="#BBBBBB" strokeWidth=0.5 light=0,0,-3

wait 1s
