---
title: SimpleCircle
description: "Manim Example: `SimpleCircle` (`#simplecircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#simplecircle
source_example_path: examples/simple_circle.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Python export と同じ 1280x720 中心配置・半透明 fill・Create drawProgress を再現しているが、Cairo の描画順・アンチエイリアスとは完全一致しない。"
    layer: renderer
    impact: low
    workaround: "視覚確認時は形状・色・タイミングの一致を優先する。"
    closure_condition: "レンダラー差分が許容範囲内であることをスクリーンショット比較で確認する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Basic Concepts
status: ported
order: 10
---
scene width=1280 height=720 fps=60

rect bg w=1280 h=720 at 640,360 fill="#000000"
circle circle r=96 at 640,360 fill="#0d6efd" fillOpacity=0.5 stroke="#0d6efd" strokeWidth=4

play Create(circle) duration=1s easing=easeInOut
wait 1s
