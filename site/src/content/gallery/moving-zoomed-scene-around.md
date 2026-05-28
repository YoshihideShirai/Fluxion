---
title: MovingZoomedSceneAround
description: "Manim Example: `MovingZoomedSceneAround` (`#movingzoomedscenearound`) の Fluxion 移植版（近似）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingzoomedscenearound
source_example_path: examples/gallery/moving-zoomed-scene-around.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "ZoomedScene の独立 sub-camera / ImageMobjectFromCamera は未実装のため、公式例の 2x4 image と zoomed display を同期した図形として手動再現している。"
    layer: runtime
    impact: medium
    workaround: "元画像と zoom display を同じ grayscale rect 群で描き、frame/display の pop-out、非等方 scale、shift、fade を通常 animation に展開する。"
    closure_condition: "独立した sub-camera / viewport primitive を導入し、実シーンの拡大レンダリングを表示できる。"
    fidelity_upgrade_condition: "ズーム枠とズーム表示が同一ソース描画から生成され、本家と同等の追尾挙動になった時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-023
order: 70
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

rect px_00 w=210 h=210 at -315,-105 fill="#000000" stroke="none"
rect px_01 w=210 h=210 at -105,-105 fill="#646464" stroke="none"
rect px_02 w=210 h=210 at 105,-105 fill="#1E1E1E" stroke="none"
rect px_03 w=210 h=210 at 315,-105 fill="#C8C8C8" stroke="none"
rect px_10 w=210 h=210 at -315,105 fill="#FFFFFF" stroke="none"
rect px_11 w=210 h=210 at -105,105 fill="#000000" stroke="none"
rect px_12 w=210 h=210 at 105,105 fill="#050505" stroke="none"
rect px_13 w=210 h=210 at 315,105 fill="#212121" stroke="none"

circle dot r=8 at -120,-120 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=2
rect frame w=110 h=72 at -120,-120 fill="none" stroke="#9A72AC" strokeWidth=3 opacity=0
text frame_text "Frame" at -120,-54 size=42 fill="#9A72AC" opacity=0

rect zoom_bg w=388 h=88 at 220,-120 fill="#000000" stroke="#000000" strokeWidth=10 opacity=0
rect zoom_display w=360 h=60 at 220,-120 fill="#242424" stroke="#FF0000" strokeWidth=20 opacity=0
rect zoom_px_0 w=90 h=60 at 85,-120 fill="#000000" stroke="none" opacity=0
rect zoom_px_1 w=90 h=60 at 175,-120 fill="#646464" stroke="none" opacity=0
rect zoom_px_2 w=90 h=60 at 265,-120 fill="#1E1E1E" stroke="none" opacity=0
rect zoom_px_3 w=90 h=60 at 355,-120 fill="#C8C8C8" stroke="none" opacity=0
text zoom_text "Zoomed camera" at 220,-50 size=42 fill="#FF0000" opacity=0

at 0s:
  play AnimationGroup(Create(frame), FadeIn(frame_text), lagRatio=0.1) duration=0.8s
  play AnimationGroup(FadeIn(zoom_bg), FadeIn(zoom_display), FadeIn(zoom_px_0), FadeIn(zoom_px_1), FadeIn(zoom_px_2), FadeIn(zoom_px_3), lagRatio=0.03) duration=0.9s easing=easeOut
  play FadeIn(zoom_text) duration=0.5s
  play AnimationGroup(FadeOut(frame_text), FadeOut(zoom_text), lagRatio=0.0) duration=0.45s

animate frame.w from 110 to 55 duration=0.7s easing=easeInOut
animate frame.h from 72 to 108 duration=0.7s easing=easeInOut
animate zoom_display.w from 360 to 180 duration=0.7s easing=easeInOut
animate zoom_display.h from 60 to 90 duration=0.7s easing=easeInOut
animate zoom_bg.w from 388 to 208 duration=0.7s easing=easeInOut
animate zoom_bg.h from 88 to 118 duration=0.7s easing=easeInOut
animate zoom_px_0.w from 90 to 45 duration=0.7s easing=easeInOut
animate zoom_px_0.h from 60 to 90 duration=0.7s easing=easeInOut
animate zoom_px_0.x from 85 to 152.5 duration=0.7s easing=easeInOut
animate zoom_px_1.w from 90 to 45 duration=0.7s easing=easeInOut
animate zoom_px_1.h from 60 to 90 duration=0.7s easing=easeInOut
animate zoom_px_1.x from 175 to 197.5 duration=0.7s easing=easeInOut
animate zoom_px_2.w from 90 to 45 duration=0.7s easing=easeInOut
animate zoom_px_2.h from 60 to 90 duration=0.7s easing=easeInOut
animate zoom_px_2.x from 265 to 242.5 duration=0.7s easing=easeInOut
animate zoom_px_3.w from 90 to 45 duration=0.7s easing=easeInOut
animate zoom_px_3.h from 60 to 90 duration=0.7s easing=easeInOut
animate zoom_px_3.x from 355 to 287.5 duration=0.7s easing=easeInOut
wait 0.5s

animate zoom_bg.scale from 1 to 2 duration=0.8s easing=easeInOut
animate zoom_display.scale from 1 to 2 duration=0.8s easing=easeInOut
animate zoom_px_0.scale from 1 to 2 duration=0.8s easing=easeInOut
animate zoom_px_1.scale from 1 to 2 duration=0.8s easing=easeInOut
animate zoom_px_2.scale from 1 to 2 duration=0.8s easing=easeInOut
animate zoom_px_3.scale from 1 to 2 duration=0.8s easing=easeInOut
wait 0.5s

animate frame.y from -120 to 30 duration=0.8s easing=easeInOut
animate zoom_px_0.fill from "#000000" to "#FFFFFF" duration=0.8s easing=easeInOut
animate zoom_px_1.fill from "#646464" to "#000000" duration=0.8s easing=easeInOut
animate zoom_px_2.fill from "#1E1E1E" to "#050505" duration=0.8s easing=easeInOut
animate zoom_px_3.fill from "#C8C8C8" to "#212121" duration=0.8s easing=easeInOut
wait 0.5s

animate zoom_bg.scale from 2 to 1 duration=0.6s easing=easeInOut
animate zoom_display.scale from 2 to 1 duration=0.6s easing=easeInOut
animate zoom_px_0.scale from 2 to 1 duration=0.6s easing=easeInOut
animate zoom_px_1.scale from 2 to 1 duration=0.6s easing=easeInOut
animate zoom_px_2.scale from 2 to 1 duration=0.6s easing=easeInOut
animate zoom_px_3.scale from 2 to 1 duration=0.6s easing=easeInOut
animate zoom_bg.opacity from 1 to 0 duration=0.6s easing=easeInOut
animate zoom_display.opacity from 1 to 0 duration=0.6s easing=easeInOut
animate zoom_px_0.opacity from 1 to 0 duration=0.6s easing=easeInOut
animate zoom_px_1.opacity from 1 to 0 duration=0.6s easing=easeInOut
animate zoom_px_2.opacity from 1 to 0 duration=0.6s easing=easeInOut
animate zoom_px_3.opacity from 1 to 0 duration=0.6s easing=easeInOut
play AnimationGroup(FadeOut(frame), lagRatio=0.05) duration=0.35s
wait 0.5s
