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
path square d="M 0 -84.853 C 0 -84.853 84.853 0 84.853 0 C 84.853 0 0 84.853 0 84.853 C 0 84.853 -84.853 0 -84.853 0 C -84.853 0 0 -84.853 0 -84.853 Z" at 640,360 fill="#ec4899" fillOpacity=0 stroke="#ffffff" strokeWidth=4
path circle d="M 0 -56 C 30.928 -56 56 -30.928 56 0 C 56 30.928 30.928 56 0 56 C -30.928 56 -56 30.928 -56 0 C -56 -30.928 -30.928 -56 0 -56 Z" at 640,360 fill="#ec4899" fillOpacity=0.5 stroke="#ffffff" strokeWidth=4

play Create(square) duration=1s easing=easeInOut
play Transform(square, circle) duration=1s easing=easeInOut
play FadeOut(square) duration=1s easing=easeInOut
