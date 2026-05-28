---
title: OpeningManim
description: "Manim Example: `OpeningManim` (`#openingmanim`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#openingmanim
source_example_path: examples/gallery/opening_manim.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Text kerning still depends on browser font metrics and may differ slightly from Manim raster output."
    layer: renderer
    impact: low
    workaround: "必要に応じてスタイル値を手動調整する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Advanced Projects
status: ported
order: 51
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#000000"
math title "\\text{This is some }\\LaTeX" at 0,58 size=54 fill="#ffffff" renderer=katex opacity=0
math basel "\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}" at 0,-102 size=48 fill="#ffffff" renderer=katex opacity=0
math transformTitle "\\text{That was a transform}" at -270,206 size=42 fill="#ffffff" renderer=katex opacity=0
math gridTitle "\\text{This is a grid}" at -270,206 size=62 fill="#ffffff" renderer=katex opacity=0
math warpedTitle "\\begin{gathered}\\text{That was a non-linear function}\\\\\\text{applied to the grid}\\end{gathered}" at -184,184 size=38 fill="#ffffff" renderer=katex opacity=0
rect codeCard w=362 h=86 at 250,196 fill="#0b1220" stroke="#334155" strokeWidth=1.5 opacity=0
text codeLine1 "VGroup(title, basel).arrange(DOWN)" at 250,216 size=16 fill="#c4b5fd" opacity=0
text codeLine2 "Transform(title, transform_title)" at 250,194 size=16 fill="#bae6fd" opacity=0
text codeLine3 "grid.animate.apply_function(...)" at 250,172 size=16 fill="#fde68a" opacity=0
rect phaseTex w=112 h=26 at -368,-218 fill="#312e81" stroke="#818cf8" strokeWidth=1.2 opacity=0
text phaseTexLabel "Tex + MathTex" at -368,-218 size=15 fill="#ddd6fe" opacity=0
rect phaseGrid w=112 h=26 at -234,-218 fill="#164e63" stroke="#22d3ee" strokeWidth=1.2 opacity=0
text phaseGridLabel "NumberPlane" at -234,-218 size=15 fill="#cffafe" opacity=0
rect phaseWarp w=142 h=26 at -86,-218 fill="#78350f" stroke="#f59e0b" strokeWidth=1.2 opacity=0
text phaseWarpLabel "non-linear transform" at -86,-218 size=15 fill="#fed7aa" opacity=0

path grid_h0 d="M -430 -170 L 430 -170" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_h1 d="M -430 -118 L 430 -118" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_h2 d="M -430 -66 L 430 -66" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_h3 d="M -430 -14 L 430 -14" at 0,-24 fill="none" stroke="#334155" strokeWidth=1.8 opacity=0
path grid_h4 d="M -430 38 L 430 38" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_h5 d="M -430 90 L 430 90" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_h6 d="M -430 142 L 430 142" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0

path grid_v0 d="M -390 -190 L -390 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v1 d="M -312 -190 L -312 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v2 d="M -234 -190 L -234 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v3 d="M -156 -190 L -156 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v4 d="M -78 -190 L -78 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v5 d="M 0 -190 L 0 160" at 0,-24 fill="none" stroke="#334155" strokeWidth=1.8 opacity=0
path grid_v6 d="M 78 -190 L 78 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v7 d="M 156 -190 L 156 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v8 d="M 234 -190 L 234 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v9 d="M 312 -190 L 312 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
path grid_v10 d="M 390 -190 L 390 160" at 0,-24 fill="none" stroke="#1d4ed8" strokeWidth=1.8 opacity=0
group grid grid_h0 grid_h1 grid_h2 grid_h3 grid_h4 grid_h5 grid_h6 grid_v0 grid_v1 grid_v2 grid_v3 grid_v4 grid_v5 grid_v6 grid_v7 grid_v8 grid_v9 grid_v10
line xAxis x1=-430 y1=-38 x2=430 y2=-38 at 0,0 stroke="#f8fafc" strokeWidth=2.4 opacity=0
line yAxis x1=0 y1=-214 x2=0 y2=136 at 0,0 stroke="#f8fafc" strokeWidth=2.4 opacity=0
circle origin r=5 at 0,-38 fill="#f8fafc" stroke="none" opacity=0
text xMinus "-4" at -312,-58 size=16 fill="#94a3b8" opacity=0
text xPlus "4" at 312,-58 size=16 fill="#94a3b8" opacity=0
text yPlus "2" at 18,66 size=16 fill="#94a3b8" opacity=0
text yMinus "-2" at 22,-162 size=16 fill="#94a3b8" opacity=0
path warpCue1 d="M -260 58 C -214 108 -146 102 -92 68" at 0,0 fill="none" stroke="#fbbf24" strokeWidth=3 opacity=0
path warpCue2 d="M 64 -124 C 118 -80 180 -84 242 -130" at 0,0 fill="none" stroke="#fb7185" strokeWidth=3 opacity=0
path warpCue3 d="M -18 86 C 28 126 94 126 144 88" at 0,0 fill="none" stroke="#34d399" strokeWidth=3 opacity=0
text warpEq "p -> p + [sin(y), sin(x), 0]" at 226,-198 size=18 fill="#fde68a" opacity=0
text createLag "Create(grid, run_time=3, lag_ratio=0.1)" at 214,-224 size=15 fill="#93c5fd" opacity=0
at 0s:
  play AnimationGroup(Write(title), FadeIn(basel), lagRatio=0.12) duration=1.45s easing=easeOut
  animate basel.y from -102 to -62 start=0s duration=1.45s easing=easeOut
  wait 0.8s
  play AnimationGroup(Transform(title, transformTitle), FadeOut(basel), lagRatio=0.12) duration=1s easing=easeInOut
  animate basel.y from -62 to -102 start=2.25s duration=1s easing=easeInOut
  wait 1s
  play AnimationGroup(FadeOut(title), FadeIn(gridTitle), Create(grid), Create(xAxis), Create(yAxis), lagRatio=0.05) duration=3s easing=easeOut
  animate gridTitle.y from 246 to 206 duration=3s easing=easeOut
  wait 1s
  animate grid_h0.d from "M -430 -170 L 430 -170" to "M -430 -118 C -214 -210 214 -128 430 -202" duration=3s easing=easeInOut
  animate grid_h1.d from "M -430 -118 L 430 -118" to "M -430 -68 C -204 -156 196 -68 430 -152" duration=3s easing=easeInOut
  animate grid_h2.d from "M -430 -66 L 430 -66" to "M -430 -22 C -230 -108 200 -12 430 -102" duration=3s easing=easeInOut
  animate grid_h3.d from "M -430 -14 L 430 -14" to "M -430 18 C -210 -58 204 40 430 -46" duration=3s easing=easeInOut
  animate grid_h4.d from "M -430 38 L 430 38" to "M -430 54 C -198 -18 210 96 430 2" duration=3s easing=easeInOut
  animate grid_h5.d from "M -430 90 L 430 90" to "M -430 90 C -208 30 224 148 430 54" duration=3s easing=easeInOut
  animate grid_h6.d from "M -430 142 L 430 142" to "M -430 132 C -212 82 214 194 430 112" duration=3s easing=easeInOut
  animate grid_v0.d from "M -390 -190 L -390 160" to "M -426 -190 C -344 -82 -482 28 -380 160" duration=3s easing=easeInOut
  animate grid_v1.d from "M -312 -190 L -312 160" to "M -348 -190 C -266 -78 -398 34 -302 160" duration=3s easing=easeInOut
  animate grid_v2.d from "M -234 -190 L -234 160" to "M -266 -190 C -190 -72 -310 40 -226 160" duration=3s easing=easeInOut
  animate grid_v3.d from "M -156 -190 L -156 160" to "M -178 -190 C -112 -66 -226 42 -154 160" duration=3s easing=easeInOut
  animate grid_v4.d from "M -78 -190 L -78 160" to "M -88 -190 C -28 -62 -130 42 -84 160" duration=3s easing=easeInOut
  animate grid_v5.d from "M 0 -190 L 0 160" to "M 0 -190 C 58 -58 -42 42 0 160" duration=3s easing=easeInOut
  animate grid_v6.d from "M 78 -190 L 78 160" to "M 88 -190 C 144 -62 42 42 82 160" duration=3s easing=easeInOut
  animate grid_v7.d from "M 156 -190 L 156 160" to "M 178 -190 C 232 -66 120 42 152 160" duration=3s easing=easeInOut
  animate grid_v8.d from "M 234 -190 L 234 160" to "M 266 -190 C 314 -72 202 40 224 160" duration=3s easing=easeInOut
  animate grid_v9.d from "M 312 -190 L 312 160" to "M 348 -190 C 392 -78 274 34 302 160" duration=3s easing=easeInOut
  animate grid_v10.d from "M 390 -190 L 390 160" to "M 426 -190 C 468 -82 352 28 382 160" duration=3s easing=easeInOut
  wait 1s
  play Transform(gridTitle, warpedTitle) duration=1s easing=easeInOut
  wait 1s
