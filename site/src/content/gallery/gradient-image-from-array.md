---
title: GradientImageFromArray
description: "Manim Example: `GradientImageFromArray` (`#gradientimagefromarray`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#gradientimagefromarray
source_example_path: examples/gallery/gradient-image-from-array.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "配列から直接画像を生成する ImageMobject は未対応のため、横グレースケール画像を SVG linear-gradient で再現している。"
    layer: compiler
    impact: medium
    workaround: "`linear-gradient(#000000,#ffffff)` で `np.uint8` 由来の横グラデーションを再現する。"
    closure_condition: "image(width,height,data=...) 形式のプリミティブとピクセル配列入力を実装する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 63
gap_id: GAP-017
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
rect image w=240 h=240 at 0,0 fill="linear-gradient(#000000,#ffffff)" stroke="none"
rect frame w=252 h=252 at 0,0 fill="none" stroke="#83C167" strokeWidth=3

wait 1s
