---
title: ThreeDLightSourcePosition
description: "Manim Example: `ThreeDLightSourcePosition` (`#threedlightsourceposition`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#threedlightsourceposition
source_example_path: examples/gallery/three-d-light-source-position.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "3D renderer、Surface checkerboard、light_source shading が未実装のため、公式静止画の見た目を手描き2D投影で近似している。"
    layer: runtime
    impact: medium
    workaround: "ThreeDAxes を斜投影 line/tick 群で描き、赤い球面を layered circles/path と細かい alternating patches で checkerboard 風に描画する。"
    closure_condition: "Surface/Sphere、3D camera projection、light_source shading を runtime で扱えるようにする。"
    fidelity_upgrade_condition: "Manim の `Surface(... checkerboard_colors=...)` と `light_source.move_to` が同等に反映される時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-029
order: 76
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

line x_axis_pos x1=0 y1=0 x2=-227 y2=102 at 0,28 stroke="#FFFFFF" strokeWidth=4
line x_axis_neg x1=0 y1=0 x2=145 y2=-65 at 0,28 stroke="#FFFFFF" strokeWidth=4
line y_axis_pos x1=0 y1=0 x2=351 y2=53 at 0,28 stroke="#FFFFFF" strokeWidth=4
line y_axis_neg x1=0 y1=0 x2=-272 y2=-41 at 0,28 stroke="#FFFFFF" strokeWidth=4
line z_axis_pos x1=0 y1=0 x2=0 y2=-221 at 0,28 stroke="#FFFFFF" strokeWidth=4
line z_axis_neg x1=0 y1=0 x2=0 y2=203 at 0,28 stroke="#FFFFFF" strokeWidth=4

line x_tick_1 x1=-4 y1=10 x2=4 y2=-10 at -57,54 stroke="#FFFFFF" strokeWidth=2
line x_tick_2 x1=-4 y1=10 x2=4 y2=-10 at -114,79 stroke="#FFFFFF" strokeWidth=2
line x_tick_3 x1=-4 y1=10 x2=4 y2=-10 at -170,105 stroke="#FFFFFF" strokeWidth=2
line x_tick_n1 x1=-4 y1=10 x2=4 y2=-10 at 36,12 stroke="#FFFFFF" strokeWidth=2
line x_tick_n2 x1=-4 y1=10 x2=4 y2=-10 at 72,-5 stroke="#FFFFFF" strokeWidth=2
line y_tick_1 x1=-4 y1=-10 x2=4 y2=10 at 88,41 stroke="#FFFFFF" strokeWidth=2
line y_tick_2 x1=-4 y1=-10 x2=4 y2=10 at 176,55 stroke="#FFFFFF" strokeWidth=2
line y_tick_3 x1=-4 y1=-10 x2=4 y2=10 at 263,68 stroke="#FFFFFF" strokeWidth=2
line y_tick_n1 x1=-4 y1=-10 x2=4 y2=10 at -68,18 stroke="#FFFFFF" strokeWidth=2
line y_tick_n2 x1=-4 y1=-10 x2=4 y2=10 at -136,8 stroke="#FFFFFF" strokeWidth=2
line z_tick_1 x1=-10 y1=0 x2=10 y2=0 at 0,-27 stroke="#FFFFFF" strokeWidth=2
line z_tick_2 x1=-10 y1=0 x2=10 y2=0 at 0,-83 stroke="#FFFFFF" strokeWidth=2
line z_tick_3 x1=-10 y1=0 x2=10 y2=0 at 0,-138 stroke="#FFFFFF" strokeWidth=2

circle sphere_shadow r=104 at 18,38 fill="#260404" stroke="none" opacity=0.7
circle sphere_base r=104 at 0,0 fill="#B12E2F" stroke="#4D0E0F" strokeWidth=2
path band_1 d="M -88 -54 C -38 -86 38 -86 88 -54 C 74 -32 -74 -32 -88 -54 Z" fill="#D04445" stroke="none" opacity=0.96
path band_2 d="M -100 -16 C -42 -48 42 -48 100 -16 C 96 5 -96 5 -100 -16 Z" fill="#8B1C1D" stroke="none" opacity=0.96
path band_3 d="M -100 20 C -42 -8 42 -8 100 20 C 90 44 -90 44 -100 20 Z" fill="#C43A3B" stroke="none" opacity=0.94
path band_4 d="M -76 62 C -34 40 34 40 76 62 C 54 86 -54 86 -76 62 Z" fill="#761718" stroke="none" opacity=0.97
path patch_1 d="M -64 -73 C -42 -84 -18 -86 4 -80 C -12 -66 -24 -52 -32 -34 C -54 -37 -70 -46 -78 -56 C -75 -63 -71 -69 -64 -73 Z" fill="#E05A52" stroke="none" opacity=0.78
path patch_2 d="M 8 -80 C 34 -82 58 -73 76 -56 C 64 -46 49 -38 29 -34 C 22 -52 14 -66 8 -80 Z" fill="#962020" stroke="none" opacity=0.72
path patch_3 d="M -78 -14 C -60 -28 -42 -34 -28 -33 C -34 -12 -34 10 -28 31 C -50 29 -70 19 -86 3 C -85 -4 -83 -9 -78 -14 Z" fill="#9A2021" stroke="none" opacity=0.82
path patch_4 d="M -24 -33 C -4 -38 16 -38 36 -33 C 28 -12 28 12 36 33 C 12 38 -12 38 -36 33 C -28 11 -28 -12 -24 -33 Z" fill="#D24A45" stroke="none" opacity=0.72
path patch_5 d="M 42 -31 C 64 -27 82 -18 96 -4 C 96 7 90 20 80 32 C 61 29 48 26 34 32 C 28 12 28 -11 42 -31 Z" fill="#8D1B1C" stroke="none" opacity=0.84
path patch_6 d="M -62 42 C -43 34 -19 34 0 39 C -8 58 -18 74 -31 91 C -52 82 -66 66 -76 57 C -72 50 -68 46 -62 42 Z" fill="#C8423D" stroke="none" opacity=0.78
path patch_7 d="M 6 40 C 28 34 52 38 72 52 C 60 70 43 84 24 93 C 14 76 8 59 6 40 Z" fill="#721516" stroke="none" opacity=0.86
path patch_8 d="M -52 -51 C -35 -58 -12 -60 6 -55 C -5 -44 -12 -31 -16 -16 C -35 -18 -50 -24 -62 -34 C -60 -41 -57 -47 -52 -51 Z" fill="#7C1718" stroke="none" opacity=0.7
path patch_9 d="M -11 -55 C 8 -60 31 -56 49 -47 C 37 -35 31 -22 29 -7 C 12 -12 -3 -12 -19 -7 C -18 -24 -16 -40 -11 -55 Z" fill="#D8534C" stroke="none" opacity=0.66
path patch_10 d="M 48 -45 C 67 -36 82 -25 92 -9 C 84 -1 72 5 57 8 C 49 -1 39 -6 28 -8 C 30 -23 36 -35 48 -45 Z" fill="#7A1516" stroke="none" opacity=0.78
path patch_11 d="M -74 4 C -58 -5 -39 -10 -20 -7 C -23 7 -22 20 -17 34 C -37 34 -56 28 -72 17 C -75 13 -76 8 -74 4 Z" fill="#C74440" stroke="none" opacity=0.68
path patch_12 d="M -14 -6 C 0 -11 17 -11 31 -6 C 26 8 26 22 32 36 C 14 41 -8 40 -25 35 C -20 20 -20 7 -14 -6 Z" fill="#841819" stroke="none" opacity=0.78
path patch_13 d="M 38 -3 C 56 -2 71 5 82 17 C 74 30 61 38 45 42 C 39 31 32 22 30 35 C 25 20 26 9 38 -3 Z" fill="#CF4541" stroke="none" opacity=0.62
path patch_14 d="M -44 46 C -28 41 -9 42 6 48 C -1 62 -9 74 -20 86 C -38 79 -52 68 -62 55 C -58 51 -52 48 -44 46 Z" fill="#801718" stroke="none" opacity=0.75
path patch_15 d="M 10 49 C 27 44 46 47 62 58 C 51 70 39 80 24 88 C 17 75 12 62 10 49 Z" fill="#D1514B" stroke="none" opacity=0.6
path lower_rim d="M -62 80 C -20 108 50 100 84 54 C 68 88 34 106 -7 106 C -30 106 -49 97 -62 80 Z" fill="#260404" stroke="none" opacity=0.42
path meridian_1 d="M 0 -104 C -46 -70 -46 70 0 104 C 46 70 46 -70 0 -104 Z" fill="none" stroke="#F08A80" strokeWidth=2.4 opacity=0.42
path meridian_2 d="M -48 -90 C -16 -52 -16 52 -48 90" fill="none" stroke="#3F0B0C" strokeWidth=2.6 opacity=0.7
path meridian_3 d="M 48 -90 C 16 -52 16 52 48 90" fill="none" stroke="#F08A80" strokeWidth=2.4 opacity=0.34
path latitude_1 d="M -88 -54 C -36 -32 36 -32 88 -54" fill="none" stroke="#F6A098" strokeWidth=1.6 opacity=0.32
path latitude_2 d="M -100 -16 C -42 5 42 5 100 -16" fill="none" stroke="#3F0B0C" strokeWidth=1.8 opacity=0.48
path latitude_3 d="M -100 20 C -42 44 42 44 100 20" fill="none" stroke="#F6A098" strokeWidth=1.5 opacity=0.28
circle highlight r=30 at -42,-44 fill="#F1988C" stroke="none" opacity=0.64
circle highlight_core r=12 at -56,-58 fill="#FFD0C8" stroke="none" opacity=0.72
group sphere sphere_shadow sphere_base band_1 band_2 band_3 band_4 patch_1 patch_2 patch_3 patch_4 patch_5 patch_6 patch_7 patch_8 patch_9 patch_10 patch_11 patch_12 patch_13 patch_14 patch_15 lower_rim meridian_1 meridian_2 meridian_3 latitude_1 latitude_2 latitude_3 highlight highlight_core at 0,28

wait 1s
