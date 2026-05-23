---
title: SimpleCircle
description: "Manim Example: `SimpleCircle` (`#simplecircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#simplecircle
source_example_path: examples/simple_circle.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Stroke join/cap rendering can differ slightly across browsers."
    layer: renderer
    impact: low
    workaround: "必要に応じてスタイル値を手動調整する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Basic Concepts
status: ported
order: 10
---
scene width=960 height=540 fps=60
circle circle r=80 at 0,0 fill="#38bdf8" stroke="#0f172a" strokeWidth=6
at 0s:
  play Create(circle) duration=1.0s easing=easeOut
wait 0.6s
play FadeOut(circle) duration=0.8s easing=easeInOut
