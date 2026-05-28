---
title: SimpleCircle
description: "Manim Example: `SimpleCircle` (`#simplecircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#simplecircle
source_example_path: examples/simple_circle.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Circle の Create は再現しているが、Cairo の描画順・アンチエイリアスとは完全一致しない。"
    layer: renderer
    impact: low
    workaround: "視覚確認時は形状・色・タイミングの一致を優先する。"
    closure_condition: "レンダラー差分が許容範囲内であることをスクリーンショット比較で確認する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Basic Concepts
status: ported
order: 10
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle circle r=96 at 0,0 fill="#0d6efd" stroke="#0d6efd" strokeWidth=4 opacity=0

play Create(circle) duration=1s easing=easeInOut
wait 1s
