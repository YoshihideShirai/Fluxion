---
title: FixedInFrameMObjectTest
description: "Manim Example: `FixedInFrameMObjectTest` (`#fixedinframemobjecttest`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#fixedinframemobjecttest
source_example_path: examples/gallery/fixed-in-frame-m-object-test.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Fluxion にはネイティブな ThreeDScene はないが、公式出力の Manim camera 投影と fixed-in-frame text は `threeDAxes` と `fixedInFrame=true` で再現している。"
    layer: runtime
    impact: low
    workaround: "`ThreeDAxes()` は未移動の Manim scene origin に置き、`threeDAxes` helper で公式既定の `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, `x_length=10.5`, `y_length=10.5`, `z_length=6.5` と `set_camera_orientation(phi=75°, theta=-45°)` を Manim `ThreeDCamera` 投影済み line/tick/tip 群に展開する。`add_fixed_in_frame_mobjects(text3d)` と default `Text(..., font_size=48).to_corner(UL)` は `fixedInFrame=true` で camera transform の外側に描画する。"
    closure_condition: "ネイティブ 3D camera / mobject layer を runtime に追加する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 62
gap_id: GAP-015
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
text text3d "This is a 3D text" at -270,-212 size=48 fill="#FFFFFF" fixedInFrame=true

threeDAxes axes at 0,0 xRange=-6,6,1 yRange=-5,5,1 zRange=-4,4,1 xLength=10.5 yLength=10.5 zLength=6.5 phi=75 theta=-45 unitScale=67.5 stroke="#FFFFFF" strokeWidth=2 tickSize=10 tickStrokeWidth=2 includeTips=true

wait 1s
