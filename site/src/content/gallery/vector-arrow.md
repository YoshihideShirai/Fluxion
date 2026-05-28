---
title: VectorArrow
description: "Manim Example: `VectorArrow` (`#vectorarrow`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#vectorarrow
source_example_path: examples/gallery/vector-arrow.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "NumberPlane は `numberPlane` helper で Manim 16:9 frame の 1 unit = 67.5px に展開するが、細かな faded line / axis style 全オプションは未実装。Arrow は buff と tip/stroke length clamp を Manim 風に反映するが、全 tip_shape オプションは未実装。"
    layer: dsl
    impact: low
    workaround: "`numberPlane` と `arrow` の寸法・色を Manim 出力に合わせて調整する。"
    closure_condition: "NumberPlane と Arrow の tip_shape 互換が実装される。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-031
order: 78
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#000000"
numberPlane plane xRange=-7,7 yRange=-4,4 unit=67.5 stroke="#00bcd4" axisStroke="#dff9ff" strokeWidth=1.4 axisStrokeWidth=1.8 opacity=0.9 axisOpacity=0.95
arrow vec x1=0 y1=0 x2=135 y2=-135 buff=0 stroke="#f8fafc" fill="#f8fafc" strokeWidth=6 tipLength=21 tipWidth=21
circle origin r=5.5 at 0,0 fill="#f8fafc" stroke="#f8fafc" strokeWidth=0
text origin_label "(0, 0)" at 0,54 size=42 fill="#f8fafc"
text tip_label "(2, 2)" at 210,-135 size=42 fill="#f8fafc"
at 0s:
  play AnimationGroup(Create(plane), FadeIn(origin), Create(vec), FadeIn(origin_label), FadeIn(tip_label), lagRatio=0.04) duration=1s easing=smooth
  wait 1.4s
