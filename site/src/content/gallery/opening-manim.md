---
title: OpeningManim
description: "Manim Example: `OpeningManim` (`#openingmanim`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#openingmanim
source_example_path: examples/gallery/opening_manim.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Text kerning and the in-flight nonlinear grid morph still depend on browser renderer/path approximation and may differ slightly from Manim raster output, but the final warped grid preserves the cubic target paths."
    layer: renderer
    impact: low
    workaround: "`NumberPlane()` を Manim frame scale の full-frame grid に展開し、`p + [sin(p[1]), sin(p[0]), 0]` 由来の cubic path target で非線形変形を近似する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Advanced Projects
status: ported
gap_id: GAP-002
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

path grid_h0 d="M -480 -270 L 480 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h1 d="M -480 -202.5 L 480 -202.5" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h2 d="M -480 -135 L 480 -135" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h3 d="M -480 -67.5 L 480 -67.5" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h4 d="M -480 0 L 480 0" at 0,0 fill="none" stroke="#FFFFFF" strokeWidth=2 opacity=0
path grid_h5 d="M -480 67.5 L 480 67.5" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h6 d="M -480 135 L 480 135" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h7 d="M -480 202.5 L 480 202.5" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_h8 d="M -480 270 L 480 270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0

path grid_v0 d="M -472.5 270 L -472.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v1 d="M -405 270 L -405 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v2 d="M -337.5 270 L -337.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v3 d="M -270 270 L -270 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v4 d="M -202.5 270 L -202.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v5 d="M -135 270 L -135 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v6 d="M -67.5 270 L -67.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v7 d="M 0 270 L 0 -270" at 0,0 fill="none" stroke="#FFFFFF" strokeWidth=2 opacity=0
path grid_v8 d="M 67.5 270 L 67.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v9 d="M 135 270 L 135 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v10 d="M 202.5 270 L 202.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v11 d="M 270 270 L 270 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v12 d="M 337.5 270 L 337.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v13 d="M 405 270 L 405 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
path grid_v14 d="M 472.5 270 L 472.5 -270" at 0,0 fill="none" stroke="#29ABCA" strokeWidth=2 opacity=0
group grid grid_h0 grid_h1 grid_h2 grid_h3 grid_h4 grid_h5 grid_h6 grid_h7 grid_h8 grid_v0 grid_v1 grid_v2 grid_v3 grid_v4 grid_v5 grid_v6 grid_v7 grid_v8 grid_v9 grid_v10 grid_v11 grid_v12 grid_v13 grid_v14
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
  play AnimationGroup(Write(title), FadeIn(basel), lagRatio=0.12) duration=1.45s easing=smooth
  animate basel.y from -102 to -62 start=0s duration=1.45s easing=smooth
  wait 0.8s
  play AnimationGroup(Transform(title, transformTitle), FadeOut(basel), lagRatio=0.12) duration=1s easing=easeInOut
  animate basel.y from -62 to -102 start=2.25s duration=1s easing=easeInOut
  wait 1s
  play AnimationGroup(FadeOut(title), FadeIn(gridTitle), Create(grid), lagRatio=0.05) duration=3s easing=smooth
  animate gridTitle.y from 246 to 206 duration=3s easing=smooth
  wait 1s
  animate grid_h0.d from "M -480 -270 L 480 -270" to "M -523.6 -225.7 C -208.4 -221 106.2 -319 421.4 -314.3" duration=3s easing=easeInOut
  animate grid_h1.d from "M -480 -202.5 L 480 -202.5" to "M -463 -158.2 C -147.7 -153.5 166.8 -251.5 482 -246.8" duration=3s easing=easeInOut
  animate grid_h2.d from "M -480 -135 L 480 -135" to "M -411.1 -90.7 C -95.9 -86 218.7 -184 533.9 -179.3" duration=3s easing=easeInOut
  animate grid_h3.d from "M -480 -67.5 L 480 -67.5" to "M -415.7 -23.2 C -100.5 -18.5 214.1 -116.5 529.3 -111.8" duration=3s easing=easeInOut
  animate grid_h4.d from "M -480 0 L 480 0" to "M -472.5 44.3 C -157.3 49 157.3 -49 472.5 -44.3" duration=3s easing=easeInOut
  animate grid_h5.d from "M -480 67.5 L 480 67.5" to "M -529.3 111.8 C -214.1 116.5 100.5 18.5 415.7 23.2" duration=3s easing=easeInOut
  animate grid_h6.d from "M -480 135 L 480 135" to "M -533.9 179.3 C -218.7 184 95.9 86 411.1 90.7" duration=3s easing=easeInOut
  animate grid_h7.d from "M -480 202.5 L 480 202.5" to "M -482 246.8 C -166.8 251.5 147.7 153.5 463 158.2" duration=3s easing=easeInOut
  animate grid_h8.d from "M -480 270 L 480 270" to "M -421.4 314.3 C -106.2 319 208.4 221 523.6 225.7" duration=3s easing=easeInOut
  animate grid_v0.d from "M -472.5 270 L -472.5 -270" to "M -421.4 314.3 C -538.1 134.1 -406.9 -45.4 -523.6 -225.7" duration=3s easing=easeInOut
  animate grid_v1.d from "M -405 270 L -405 -270" to "M -353.9 251.1 C -470.6 70.9 -339.4 -108.6 -456.1 -288.9" duration=3s easing=easeInOut
  animate grid_v2.d from "M -337.5 270 L -337.5 -270" to "M -286.4 205.3 C -403.1 25 -271.9 -154.5 -388.6 -334.7" duration=3s easing=easeInOut
  animate grid_v3.d from "M -270 270 L -270 -270" to "M -218.9 218.9 C -335.6 38.7 -204.4 -140.9 -321.1 -321.1" duration=3s easing=easeInOut
  animate grid_v4.d from "M -202.5 270 L -202.5 -270" to "M -151.4 279.5 C -268.1 99.3 -136.9 -80.2 -253.6 -260.5" duration=3s easing=easeInOut
  animate grid_v5.d from "M -135 270 L -135 -270" to "M -83.9 331.4 C -200.6 151.2 -69.4 -28.4 -186.1 -208.6" duration=3s easing=easeInOut
  animate grid_v6.d from "M -67.5 270 L -67.5 -270" to "M -16.4 326.8 C -133.1 146.6 -1.9 -33 -118.6 -213.2" duration=3s easing=easeInOut
  animate grid_v7.d from "M 0 270 L 0 -270" to "M 51.1 270 C -65.6 89.8 65.6 -89.8 -51.1 -270" duration=3s easing=easeInOut
  animate grid_v8.d from "M 67.5 270 L 67.5 -270" to "M 118.6 213.2 C 1.9 33 133.1 -146.6 16.4 -326.8" duration=3s easing=easeInOut
  animate grid_v9.d from "M 135 270 L 135 -270" to "M 186.1 208.6 C 69.4 28.4 200.6 -151.2 83.9 -331.4" duration=3s easing=easeInOut
  animate grid_v10.d from "M 202.5 270 L 202.5 -270" to "M 253.6 260.5 C 136.9 80.2 268.1 -99.3 151.4 -279.5" duration=3s easing=easeInOut
  animate grid_v11.d from "M 270 270 L 270 -270" to "M 321.1 321.1 C 204.4 140.9 335.6 -38.7 218.9 -218.9" duration=3s easing=easeInOut
  animate grid_v12.d from "M 337.5 270 L 337.5 -270" to "M 388.6 334.7 C 271.9 154.5 403.1 -25 286.4 -205.3" duration=3s easing=easeInOut
  animate grid_v13.d from "M 405 270 L 405 -270" to "M 456.1 288.9 C 339.4 108.6 470.6 -70.9 353.9 -251.1" duration=3s easing=easeInOut
  animate grid_v14.d from "M 472.5 270 L 472.5 -270" to "M 523.6 225.7 C 406.9 45.4 538.1 -134.1 421.4 -314.3" duration=3s easing=easeInOut
  wait 1s
  play Transform(gridTitle, warpedTitle) duration=1s easing=easeInOut
  wait 1s
