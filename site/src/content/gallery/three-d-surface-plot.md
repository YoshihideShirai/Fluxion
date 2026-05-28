---
title: ThreeDSurfacePlot
description: "Manim Example: `ThreeDSurfacePlot` (`#threedsurfaceplot`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedsurfaceplot
source_example_path: examples/gallery/three-d-surface-plot.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D Surface mesh / camera projection は未実装のため、公式の Gaussian surface を投影済み checkerboard path patch で近似している。"
    layer: runtime
    impact: medium
    workaround: "ThreeDAxes を line 群で描き、`Surface(param_gauss).set_fill_by_checkerboard(ORANGE, BLUE, opacity=0.5)` の見た目を手描き polygon mesh と中間 mesh line に展開する。"
    closure_condition: "Surface primitive と 3D camera projection を runtime でネイティブ実装する。"
    fidelity_upgrade_condition: "Manim の `Surface(param_gauss)` と checkerboard fill を同等パラメータで再現できる時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-030
order: 77
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

line x_axis_pos x1=0 y1=0 x2=292 y2=144 at -38,124 stroke="#FFFFFF" strokeWidth=4
line x_axis_neg x1=0 y1=0 x2=-214 y2=-106 at -38,124 stroke="#FFFFFF" strokeWidth=4
line y_axis_pos x1=0 y1=0 x2=-276 y2=138 at -38,124 stroke="#FFFFFF" strokeWidth=4
line y_axis_neg x1=0 y1=0 x2=190 y2=-94 at -38,124 stroke="#FFFFFF" strokeWidth=4
line z_axis_pos x1=0 y1=0 x2=0 y2=-306 at -38,124 stroke="#FFFFFF" strokeWidth=4
line z_axis_neg x1=0 y1=0 x2=0 y2=78 at -38,124 stroke="#FFFFFF" strokeWidth=4

path p00 d="M -250 72 L -164 114 L -94 80 L -180 38 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5
path p01 d="M -164 114 L -78 156 L -8 122 L -94 80 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5
path p02 d="M -78 156 L 8 198 L 78 164 L -8 122 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5
path p03 d="M 8 198 L 94 240 L 164 206 L 78 164 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5

path p10 d="M -180 38 L -94 80 L -28 18 L -114 -24 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5
path p11 d="M -94 80 L -8 122 L 58 6 L -28 18 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5
path p12 d="M -8 122 L 78 164 L 144 98 L 58 6 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5
path p13 d="M 78 164 L 164 206 L 230 170 L 144 98 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5

path p20 d="M -114 -24 L -28 18 L 38 -58 L -48 -100 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5
path p21 d="M -28 18 L 58 6 L 124 -140 L 38 -58 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5
path p22 d="M 58 6 L 144 98 L 210 40 L 124 -140 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5
path p23 d="M 144 98 L 230 170 L 296 136 L 210 40 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5

path p30 d="M -48 -100 L 38 -58 L 108 -92 L 22 -134 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5
path p31 d="M 38 -58 L 124 -140 L 194 -144 L 108 -92 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5
path p32 d="M 124 -140 L 210 40 L 280 6 L 194 -144 Z" fill="#58C4DD" stroke="#83C167" strokeWidth=1 opacity=0.5
path p33 d="M 210 40 L 296 136 L 366 102 L 280 6 Z" fill="#FF862F" stroke="#83C167" strokeWidth=1 opacity=0.5

path mesh_u0 d="M -215 55 L -129 97 L -43 139 L 43 181 L 129 223" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_u1 d="M -147 7 L -61 49 L 25 64 L 111 131 L 197 188" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_u2 d="M -81 -62 L 5 -20 L 91 -67 L 177 69 L 263 153" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_u3 d="M -13 -117 L 73 -75 L 159 -142 L 245 23 L 331 119" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_v0 d="M -207 93 L -137 59 L -71 -3 L -5 -79 L 65 -113" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_v1 d="M -121 135 L -51 101 L 15 12 L 81 -99 L 151 -118" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_v2 d="M -35 177 L 35 143 L 101 52 L 167 -50 L 237 -69" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path mesh_v3 d="M 51 219 L 121 185 L 187 134 L 253 88 L 323 54" fill="none" stroke="#83C167" strokeWidth=1 opacity=0.42
path ridge_x d="M -250 72 C -92 108 16 -22 124 -140 C 204 -68 288 40 366 102" fill="none" stroke="#83C167" strokeWidth=2 opacity=0.72
path ridge_y d="M -180 38 C -44 28 70 -126 194 -144 C 240 -82 268 20 296 136" fill="none" stroke="#83C167" strokeWidth=2 opacity=0.72

wait 1s
