---
title: SquareToCircle
description: "Manim Example: `SquareToCircle` (`#squaretocircle`) をそのまま移植したデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#squaretocircle
source_example_path: examples/basic_concepts_square_to_circle.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Transform の頂点対応は近似だが、公式デモの構成・色・タイミングに合わせている。"
    layer: runtime
    impact: low
    workaround: "easing・duration・中間キーを調整して差を吸収する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Basic Concepts
status: ported
order: 11
---
scene width=1280 height=720 fps=60

rect bg w=1280 h=720 at 640,360 fill="#000000"
rect square w=120 h=120 at 640,360 fill="#ffffff" stroke="#111827" strokeWidth=2 rotation=45 opacity=0
circle circle r=56 at 640,360 fill="#ec4899" stroke="#ec4899" strokeWidth=2 opacity=0.5

play Create(square) duration=1s easing=easeInOut
play Transform(square, circle) duration=1s easing=easeInOut
play FadeOut(square) duration=1s easing=easeInOut
