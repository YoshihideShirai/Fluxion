---
title: MovingFrameBox
description: "Manim Example: `MovingFrameBox` (`#movingframebox`) に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingframebox
source_example_path: examples/gallery/moving_frame_box.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "MathTex part layout is approximated with separate math nodes, and the frame bounds use declared width/height metrics rather than Manim glyph boxes; Write reveal uses left-to-right clipping and frame Create uses stroke-dash drawing rather than exact Manim vector tracing."
    layer: renderer
    impact: low
    workaround: "必要に応じてスタイル値を手動調整する。"
    closure_condition: "該当レンダリング差分が解消され、Manim 出力との視覚差が許容範囲に収まる。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Animations
status: ported
order: 24
---
scene width=960 height=540 fps=60
math lhs "\frac{d}{dx}f(x)g(x)=" at -185,20 size=30 w=220 h=80 fill="#e2e8f0" renderer=katex
math termA "f(x)\frac{d}{dx}g(x)" at 15,20 size=30 w=210 h=80 fill="#bae6fd" renderer=katex
math plus "+" at 120,20 size=30 w=28 h=66 fill="#e2e8f0" renderer=katex
math termB "g(x)\frac{d}{dx}f(x)" at 230,20 size=30 w=215 h=80 fill="#fde68a" renderer=katex
rect termAFrameTarget w=166 h=72 at 12,20 fill="none" opacity=0
rect termBFrameTarget w=166 h=72 at 235,20 fill="none" opacity=0
group productRule lhs termA plus termB
surroundingRect frameA target=termAFrameTarget buff=7 stroke="#fbbf24" strokeWidth=4
surroundingRect frameB target=termBFrameTarget buff=7 stroke="#fbbf24" strokeWidth=4
text caption "MovingFrameBox" at 0,-150 size=24 fill="#cbd5e1"

at 0s:
  play Write(productRule) duration=1.2s easing=easeOut
wait 0.3s
play Create(frameA) duration=0.7s easing=easeOut
wait 0.5s
play Transform(frameA, frameB) duration=1s easing=easeInOut
wait 0.5s
