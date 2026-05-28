---
title: TexTransformExample
description: "Manim Example: `TexTransformExample` (`#textransformexample`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#textransformexample
source_example_path: examples/gallery/transform_matching_tex.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Token geometry interpolation is approximate because browser text shaping differs from Manim's TeX rasterization; hidden target token materialization is handled explicitly so chained TransformMatchingTex scenes remain visible."
    layer: runtime
    impact: medium
    workaround: "target root を非表示のまま使わず、変形後の token を次の変形 source として materialize して、easing・duration・中間キーを調整して差を吸収する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Advanced Projects
status: ported
order: 50
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#000000"
math variables "a\\quad b\\quad c" at 0,86 size=44 fill="#ffffff" renderer=katex expandTokens=true opacity=0
math eq1 "x^2+y^2=z^2" at 0,0 size=58 fill="#ffffff" renderer=katex expandTokens=true
math eq2 "a^2+b^2=c^2" at 0,0 size=58 fill="#ffffff" renderer=katex expandTokens=true opacity=0
math eq3 "a^2=c^2-b^2" at 0,0 size=58 fill="#ffffff" renderer=katex expandTokens=true opacity=0
at 0s:
  show eq1
  wait 0.5s
  play AnimationGroup(TransformMatchingTex(eq1, eq2), FadeIn(variables), lagRatio=0.0) duration=1s easing=easeInOut
  animate variables.y from 86 to 0 start=0.5s duration=1s easing=easeInOut
  animate variables.scale from 1 to 1.32 start=0.5s duration=1s easing=easeInOut
  animate variables.opacity from 1 to 0 start=1.15s duration=0.35s easing=easeInOut
  wait 0.5s
  play TransformMatchingTex(eq2, eq3) duration=1s easing=easeInOut
  wait 0.5s
