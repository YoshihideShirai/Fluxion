---
title: SquareToCircle
description: "Manim Quickstart Example: `SquareToCircle` に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/tutorials/quickstart.html#transforming-a-square-into-a-circle
source_example_path: examples/gallery/square-to-circle.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Transform の頂点対応は近似だが、公式 quickstart の `Square().rotate(PI / 4)`、`Circle().set_fill(PINK, opacity=0.5)`、`Create` → `Transform` → `FadeOut` の構成・色・タイミングに合わせている。"
    layer: runtime
    impact: low
    workaround: "default `Square(side_length=2)` の 45度回転 diamond と default `Circle(radius=1)` を Manim 16:9 frame scale の 67.5px/unit に展開し、同じ cubic command topology の path で morph する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Basic Concepts
status: ported
gap_id: GAP-005
order: 11
---
scene width=1280 height=720 fps=60

rect bg w=1280 h=720 at 640,360 fill="#000000"
path square d="M 0 -95.459 C 0 -95.459 95.459 0 95.459 0 C 95.459 0 0 95.459 0 95.459 C 0 95.459 -95.459 0 -95.459 0 C -95.459 0 0 -95.459 0 -95.459 Z" at 640,360 fill="#ffffff" fillOpacity=0 stroke="#ffffff" strokeWidth=4
path circle d="M 0 -67.5 C 37.279 -67.5 67.5 -37.279 67.5 0 C 67.5 37.279 37.279 67.5 0 67.5 C -37.279 67.5 -67.5 37.279 -67.5 0 C -67.5 -37.279 -37.279 -67.5 0 -67.5 Z" at 640,360 fill="#D147BD" fillOpacity=0.5 stroke="#ffffff" strokeWidth=4

play Create(square) duration=1s easing=easeInOut
play Transform(square, circle) duration=1s easing=easeInOut
play FadeOut(square) duration=1s easing=easeInOut
