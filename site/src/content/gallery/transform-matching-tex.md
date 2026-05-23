---
title: TexTransformExample
description: "Manim Example: `TexTransformExample` (`#textransformexample`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#textransformexample
source_example_path: examples/gallery/transform_matching_tex.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Token geometry interpolation is approximate because browser text shaping differs from Manim's TeX rasterization."
    layer: runtime
    impact: medium
    workaround: "easing・duration・中間キーを調整して差を吸収する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Advanced Projects
status: ported
order: 50
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#111827"
math eq1 "x^2+y^2=(r)^2" at 0,-50 size=58 fill="#bae6fd" renderer=katex expandTokens=true
math eq2 "x^2+y^2=(R)^2" at 0,-50 size=58 fill="#fde68a" renderer=katex expandTokens=true
at 0s:
  play Write(eq1) duration=1.2s easing=easeOut
wait 0.4s
play TransformMatchingTex(eq1, eq2) duration=1.3s easing=easeInOut
