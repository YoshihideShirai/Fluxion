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
    workaround: "`ThreeDAxes()` を `threeDAxes` の Manim `ThreeDCamera` 透視投影 line/tick/tip 群で描き、公式既定の `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, `x_length=10.5`, `y_length=10.5`, `z_length=6.5` を保持する。`Surface(..., v_range=[0, TAU], u_range=[-PI/2, PI/2], checkerboard_colors=[RED_D, RED_E], resolution=(15,32))` を `sphereSurface` の shaded checkerboard path 群に展開する。公式 `Surface` 既定の `stroke_color=LIGHT_GREY` / `stroke_width=0.5` も薄い面境界として保持する。公式 sphere 半径 1.5 は `worldRadius=1.5` と `phi=75`, `theta=30` の camera projection で描き、`light_source.move_to(3*IN)` を `light=0,0,-3` の位置光源として扱い、Manim `get_shaded_rgb` 相当の面 shading と反対側の terminator shadow を重ねる。"
    closure_condition: "Surface/Sphere、3D camera projection、light_source shading を runtime で扱えるようにする。"
    fidelity_upgrade_condition: "Manim の `Surface(... checkerboard_colors=...)` と `light_source.move_to` が同等に反映される時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-029
order: 76
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

threeDAxes axes at 0,28 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 xLength=10.5 yLength=10.5 zLength=6.5 phi=75 theta=30 unitScale=67.5 stroke="#FFFFFF" strokeWidth=2 tickSize=10 tickStrokeWidth=2 includeTicks=true includeTips=true

sphereSurface sphere_mesh radius=104 worldRadius=1.5 phi=75 theta=30 unitScale=67.5 resolution=15,32 fillA="#E65A4C" fillB="#CF5044" stroke="#BBBBBB" strokeWidth=0.5 light=0,0,-3
circle sphere_shadow r=104 at 18,38 fill="#260404" stroke="none" opacity=0.22
circle sphere_rim r=104 at 0,0 fill="none" stroke="#4D0E0F" strokeWidth=2 opacity=0.65
path terminator_left d="M -104 -42 C -93 -4 -89 40 -62 80 C -91 62 -109 30 -110 -7 C -111 -22 -109 -34 -104 -42 Z" fill="#180303" stroke="none" opacity=0.22
path terminator_bottom d="M -72 70 C -25 98 42 95 84 54 C 70 89 34 112 -12 110 C -43 109 -64 94 -72 70 Z" fill="#170303" stroke="none" opacity=0.28
circle highlight_bloom r=48 at 0,-58 fill="#F1988C" stroke="none" opacity=0.22
circle highlight r=28 at 0,-58 fill="#F1988C" stroke="none" opacity=0.58
circle highlight_core r=10 at 0,-72 fill="#FFD0C8" stroke="none" opacity=0.72
path highlight_sheen d="M -38 -72 C -21 -91 28 -88 58 -62 C 35 -72 -8 -78 -38 -72 Z" fill="#FFD0C8" stroke="none" opacity=0.24
circle highlight_pin r=4 at -6,-84 fill="#FFE6E0" stroke="none" opacity=0.78
group sphere sphere_shadow sphere_mesh sphere_rim terminator_left terminator_bottom highlight_bloom highlight highlight_core highlight_sheen highlight_pin at 0,28 scale=0.973558

wait 1s
