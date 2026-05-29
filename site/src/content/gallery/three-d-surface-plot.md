---
title: ThreeDSurfacePlot
description: "Manim Example: `ThreeDSurfacePlot` (`#threedsurfaceplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedsurfaceplot
source_example_path: examples/gallery/three-d-surface-plot.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D Surface / camera projection は runtime ネイティブ未実装のため、公式 ThreeDAxes と Gaussian surface を `threeDAxes` / `gaussianSurface` helper で投影済みに展開している。"
    layer: runtime
    impact: medium
    workaround: "`ThreeDAxes()` は tick/tip 付き `threeDAxes` helper、公式既定の `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, `x_length=10.5`, `y_length=10.5`, `z_length=6.5`、公式の `param_gauss`（`sigma=0.4`, `mu=[0,0]`）、`resolution=(24,24)`、`scale(2)`、`Surface` 既定の `stroke_width=0.5`、`set_style(..., stroke_color=GREEN)`、`set_fill_by_checkerboard(ORANGE, BLUE, opacity=0.5)` は `gaussianSurface` helper で 24x24 の path face 群として生成し、公式 `self.add(axes, gauss_plane)` と同じく axes の上に描画する。`phi=75`, `theta=-30` の Manim `ThreeDCamera` 由来の透視投影、面法線、default light source `[-7,-9,10]` から Manim `get_shaded_rgb` 風の明暗を付ける。"
    closure_condition: "Surface primitive と 3D camera projection を runtime でネイティブ実装する。"
    fidelity_upgrade_condition: "Manim の `Surface(param_gauss)` と checkerboard fill を同等パラメータで再現できる時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-030
order: 77
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

threeDAxes axes at 0,0 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 xLength=10.5 yLength=10.5 zLength=6.5 phi=75 theta=-30 unitScale=67.5 stroke="#FFFFFF" strokeWidth=2 tickSize=10 tickStrokeWidth=2 includeTicks=true includeTips=true

gaussianSurface gauss at 0,0 range=-2,2 resolution=24 scale=2 sigma=0.4 mu=0,0 phi=75 theta=-30 unitScale=67.5 fillA="#FF862F" fillB="#58C4DD" stroke="#83C167" strokeWidth=0.5 fillOpacity=0.5 shade=true light=-7,-9,10

wait 1s
