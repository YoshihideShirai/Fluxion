---
title: FixedInFrameMObjectTest
description: "Manim Example: `FixedInFrameMObjectTest` (`#fixedinframemobjecttest`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#fixedinframemobjecttest
source_example_path: examples/gallery/fixed-in-frame-m-object-test.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Fluxion には ThreeDScene / fixed-in-frame camera layer がないため、公式出力のカメラ投影と固定位置テキストを DSL helper と固定座標で再現している。"
    layer: compiler
    impact: medium
    workaround: "`ThreeDAxes()` は `threeDAxes` helper で公式既定の `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)` を投影済み line/tick/tip 群に展開し、`add_fixed_in_frame_mobjects(text3d)` と default `Text(..., font_size=48).to_corner(UL)` はカメラに追従しない固定座標テキストとして配置する。"
    closure_condition: "3D camera projection と fixed-in-frame mobject layer を DSL/runtime に追加する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 62
gap_id: GAP-015
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
text text3d "This is a 3D text" at -270,-212 size=48 fill="#FFFFFF"

threeDAxes axes at -40,42 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 xBasis=43.333333,21.333333 yBasis=-47.6,23.6 zBasis=0,-60 stroke="#FFFFFF" strokeWidth=4 tickSize=10 tickStrokeWidth=2 includeTips=true

wait 1s
