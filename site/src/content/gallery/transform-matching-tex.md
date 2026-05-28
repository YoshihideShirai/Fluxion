---
title: MatchingEquationParts
description: "Manim Reference Example: `MatchingEquationParts` (`#matchingequationparts`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/reference/manim.animation.transform_matching_parts.TransformMatchingTex.html#matchingequationparts
source_example_path: examples/gallery/transform_matching_tex.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Token geometry interpolation follows the official matching choreography, with minor renderer drift because browser/KaTeX metrics differ from Manim's TeX rasterization."
    layer: runtime
    impact: low
    workaround: "target root を非表示のまま使わず、変形後の token を次の変形 source として materialize し、公式の `TransformMatchingTex(Group(eq1, variables), eq2)` と同じ source group から token を再帰的に対応付ける。"
    closure_condition: "TeX rasterization と token bounds が Manim 出力と同等になる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Advanced Projects
status: ported
gap_id: GAP-006
order: 50
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#000000"
math varA "a" at -42,0 size=48 fill="#ffffff" renderer=katex opacity=1
math varB "b" at 0,0 size=48 fill="#ffffff" renderer=katex opacity=1
math varC "c" at 42,0 size=48 fill="#ffffff" renderer=katex opacity=1
group variables varA varB varC at 0,-67.5 opacity=1
math eq1 "{{x}}^2+{{y}}^2={{z}}^2" at 0,0 size=48 fill="#ffffff" renderer=katex expandTokens=true
math eq2 "{{a}}^2+{{b}}^2={{c}}^2" at 0,0 size=48 fill="#ffffff" renderer=katex expandTokens=true opacity=0
math eq3 "{{a}}^2={{c}}^2-{{b}}^2" at 0,0 size=48 fill="#ffffff" renderer=katex expandTokens=true opacity=0
group eq1WithVariables eq1 variables
at 0s:
  show eq1
  wait 0.5s
  show variables
  play TransformMatchingTex(eq1WithVariables, eq2) duration=1s easing=easeInOut
  wait 0.5s
  play TransformMatchingTex(eq2, eq3) duration=1s easing=easeInOut
  wait 0.5s
