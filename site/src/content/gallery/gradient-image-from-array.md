---
title: GradientImageFromArray
description: "Manim Example: `GradientImageFromArray` (`#gradientimagefromarray`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#gradientimagefromarray
source_example_path: examples/gradient_image_from_array.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の 256x256 `np.uint8` 配列は、Fluxion の `image data=...` へ 16x16 の等間隔サンプルとして展開している。"
    layer: compiler
    impact: low
    workaround: "`image data=...` の行列を増やすと、元の 256x256 配列にさらに近づけられる。"
    closure_condition: "ギャラリーで 256x256 配列を直接使っても JSON サイズと描画性能が許容範囲に収まる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 63
gap_id: GAP-017
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
image image w=240 h=240 at 0,0 data="0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255;0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255"
rect frame w=252 h=252 at 0,0 fill="none" stroke="#83C167" strokeWidth=3

wait 1s
