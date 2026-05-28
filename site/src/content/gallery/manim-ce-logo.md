---
title: ManimCELogo
description: "Manim Example: `ManimCELogo` (`#manimcelogo`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#manimcelogo
source_example_path: examples/gallery/manim_ce_logo.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "公式の `Circle()`, `Square()`, `Triangle()`, `MathTex(...).scale(7)` を Manim frame scale で手動配置しているが、Exact MathTex glyph metrics differ slightly from Manim/LaTeX output."
    layer: renderer
    impact: low
    workaround: "必要に応じてスタイル値を手動調整する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Basic Concepts
status: ported
order: 12
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#ece6e2"
triangle t w=116.9 h=101.25 at 110,-32 fill="#e07a5f" stroke="#e07a5f" strokeWidth=0
rect s w=135 h=135 at 58,34 fill="#525893" stroke="#525893" strokeWidth=0
circle c r=67.5 at -12,-32 fill="#87c2a5" stroke="#87c2a5" strokeWidth=0
math m "\\mathbb{M}" at -110,78 size=174 fill="#343434" renderer=katex
group logo t s c m
wait 1s
