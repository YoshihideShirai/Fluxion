---
title: ManimCELogo
description: "Manim Example: `ManimCELogo` (`#manimcelogo`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#manimcelogo
source_example_path: examples/gallery/manim_ce_logo.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "公式の `Circle()`, `Square()`, `Triangle()`, `MathTex(...).scale(7)` と `VGroup(...).move_to(ORIGIN)` 後の配置を Manim frame scale で手動展開しているが、Exact MathTex glyph metrics differ slightly from Manim/LaTeX output."
    layer: renderer
    impact: low
    workaround: "公式PNGの色領域観測とソースの shift / group centering を照合し、circle center `(0, 56.25)`, square center `(67.5, -11.25)`, triangle center `(135, 42.1875)`, MathTex center `(-84.375, -45)` として固定する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Basic Concepts
status: ported
gap_id: GAP-009
order: 12
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#ece6e2"
triangle t w=116.9 h=101.25 at 135,42.1875 fill="#e07a5f" stroke="#e07a5f" strokeWidth=0
rect s w=135 h=135 at 67.5,-11.25 fill="#525893" stroke="#525893" strokeWidth=0
circle c r=67.5 at 0,56.25 fill="#87c2a5" stroke="#87c2a5" strokeWidth=0
math m "\\mathbb{M}" at -84.375,-45 size=174 fill="#343434" renderer=katex
group logo t s c m
wait 1s
