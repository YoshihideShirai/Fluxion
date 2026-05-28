---
title: SimpleCircle
description: "Manim Quickstart Example: `CreateCircle` に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/tutorials/quickstart.html#animating-a-circle
source_example_path: examples/gallery/simple-circle.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "公式 quickstart の `Circle().set_fill(PINK, opacity=0.5)` と `Create(circle)` を再現しているが、Cairo の描画順・アンチエイリアスとは完全一致しない。"
    layer: renderer
    impact: low
    workaround: "default `Circle(radius=1)` を Manim frame scale の 67.5px 半径に展開し、fill は Manim `PINK`、stroke は default white のまま保持する。"
    closure_condition: "レンダラー差分が許容範囲内であることをスクリーンショット比較で確認する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Basic Concepts
status: ported
gap_id: GAP-003
order: 10
---
scene width=1280 height=720 fps=60

rect bg w=1280 h=720 at 640,360 fill="#000000"
circle circle r=67.5 at 640,360 fill="#D147BD" fillOpacity=0.5 stroke="#ffffff" strokeWidth=4

play Create(circle) duration=1s easing=easeInOut
wait 1s
