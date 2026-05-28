---
title: MovingFrameBox
description: "Manim Example: `MovingFrameBox` (`#movingframebox`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingframebox
source_example_path: examples/gallery/moving_frame_box.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "MathTex part layout is approximated with separate math nodes, and the frame bounds use declared width/height metrics rather than Manim glyph boxes."
    layer: renderer
    impact: low
    workaround: "必要に応じてスタイル値を手動調整する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Animations
status: ported
order: 24
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
math lhs "\frac{d}{dx}f(x)g(x)=" at -185,0 size=32 w=220 h=82 fill="#ffffff" renderer=katex opacity=0
math termA "f(x)\frac{d}{dx}g(x)" at 15,0 size=32 w=210 h=82 fill="#ffffff" renderer=katex opacity=0
math plus "+" at 124,0 size=32 w=28 h=66 fill="#ffffff" renderer=katex opacity=0
math termB "g(x)\frac{d}{dx}f(x)" at 236,0 size=32 w=215 h=82 fill="#ffffff" renderer=katex opacity=0
rect termAFrameTarget w=166 h=76 at 12,0 fill="none" opacity=0
rect termBFrameTarget w=166 h=76 at 236,0 fill="none" opacity=0
group productRule lhs termA plus termB
surroundingRect frameA target=termAFrameTarget buff=7 stroke="#ffff00" strokeWidth=4 opacity=0
surroundingRect frameB target=termBFrameTarget buff=7 stroke="#ffff00" strokeWidth=4 opacity=0

play Write(productRule) duration=1.2s easing=smooth
play Create(frameA) duration=1s easing=smooth
wait 1s
play Transform(frameA, frameB) duration=1s easing=smooth
wait 1s
