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
    workaround: "元画像と zoom display を同じ grayscale rect 群で描き、Manim の 16:9 frame 換算で公式 `image.height=7`、default `Dot()` 半径 0.08、`zoomed_display_width=6` / `height=1` / `zoom_factor=0.3`、右上 corner からの `shift(DOWN)` placement、独立した赤い display frame、pop-out、非等方 scale、shift、fade を通常 animation に展開する。"
    closure_condition: "独立した sub-camera / viewport primitive を導入し、実シーンの拡大レンダリングを表示できる。"
    fidelity_upgrade_condition: "ズーム枠とズーム表示が同一ソース描画から生成され、本家と同等の追尾挙動になった時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-023
order: 70
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"

rect px_00 w=236.25 h=236.25 at -354.375,-118.125 fill="#000000" stroke="none"
rect px_01 w=236.25 h=236.25 at -118.125,-118.125 fill="#646464" stroke="none"
rect px_02 w=236.25 h=236.25 at 118.125,-118.125 fill="#1E1E1E" stroke="none"
rect px_03 w=236.25 h=236.25 at 354.375,-118.125 fill="#C8C8C8" stroke="none"
rect px_10 w=236.25 h=236.25 at -354.375,118.125 fill="#FFFFFF" stroke="none"
rect px_11 w=236.25 h=236.25 at -118.125,118.125 fill="#000000" stroke="none"
rect px_12 w=236.25 h=236.25 at 118.125,118.125 fill="#050505" stroke="none"
rect px_13 w=236.25 h=236.25 at 354.375,118.125 fill="#212121" stroke="none"

circle dot r=5.4 at -135,-135 fill="#FFFFFF" stroke="none"
rect frame w=121.5 h=20.25 at -135,-135 fill="none" stroke="#9A72AC" strokeWidth=3 opacity=0
text frame_text "Frame" at -135,-84 size=67 fill="#9A72AC" opacity=0

rect zoom_bg w=155.25 h=54 at -135,-135 fill="#000000" stroke="#000000" strokeWidth=10 opacity=0
rect zoom_display w=121.5 h=20.25 at -135,-135 fill="#242424" stroke="none" opacity=0
rect zoom_px_0 w=30.375 h=20.25 at -180.5625,-135 fill="#000000" stroke="none" opacity=0
rect zoom_px_1 w=30.375 h=20.25 at -150.1875,-135 fill="#646464" stroke="none" opacity=0
rect zoom_px_2 w=30.375 h=20.25 at -119.8125,-135 fill="#1E1E1E" stroke="none" opacity=0
rect zoom_px_3 w=30.375 h=20.25 at -89.4375,-135 fill="#C8C8C8" stroke="none" opacity=0
rect zoom_display_frame w=121.5 h=20.25 at -135,-135 fill="none" stroke="#FC6255" strokeWidth=20 opacity=0
text zoom_text "Zoomed camera" at 244,-50 size=67 fill="#FC6255" opacity=0

at 0s:
  play AnimationGroup(Create(frame), FadeIn(frame_text), lagRatio=0.1) duration=0.8s
  animate zoom_bg.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_bg.x from -135 to 244 duration=0.9s easing=smooth
  animate zoom_bg.w from 155.25 to 438.75 duration=0.9s easing=smooth
  animate zoom_bg.h from 54 to 101.25 duration=0.9s easing=smooth
  animate zoom_display.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_display.x from -135 to 244 duration=0.9s easing=smooth
  animate zoom_display.w from 121.5 to 405 duration=0.9s easing=smooth
  animate zoom_display.h from 20.25 to 67.5 duration=0.9s easing=smooth
  animate zoom_display_frame.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_display_frame.x from -135 to 244 duration=0.9s easing=smooth
  animate zoom_display_frame.w from 121.5 to 405 duration=0.9s easing=smooth
  animate zoom_display_frame.h from 20.25 to 67.5 duration=0.9s easing=smooth
  animate zoom_px_0.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_px_0.x from -180.5625 to 92.125 duration=0.9s easing=smooth
  animate zoom_px_0.w from 30.375 to 101.25 duration=0.9s easing=smooth
  animate zoom_px_0.h from 20.25 to 67.5 duration=0.9s easing=smooth
  animate zoom_px_1.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_px_1.x from -150.1875 to 193.375 duration=0.9s easing=smooth
  animate zoom_px_1.w from 30.375 to 101.25 duration=0.9s easing=smooth
  animate zoom_px_1.h from 20.25 to 67.5 duration=0.9s easing=smooth
  animate zoom_px_2.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_px_2.x from -119.8125 to 294.625 duration=0.9s easing=smooth
  animate zoom_px_2.w from 30.375 to 101.25 duration=0.9s easing=smooth
  animate zoom_px_2.h from 20.25 to 67.5 duration=0.9s easing=smooth
  animate zoom_px_3.opacity from 0 to 1 duration=0.9s easing=smooth
  animate zoom_px_3.x from -89.4375 to 395.875 duration=0.9s easing=smooth
  animate zoom_px_3.w from 30.375 to 101.25 duration=0.9s easing=smooth
  animate zoom_px_3.h from 20.25 to 67.5 duration=0.9s easing=smooth
  wait 0.9s
  play FadeIn(zoom_text) duration=0.5s
  play AnimationGroup(FadeOut(frame_text), FadeOut(zoom_text), lagRatio=0.0) duration=0.45s

at 2.65s:
  animate frame.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate frame.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_display.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_display.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_display_frame.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_display_frame.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_bg.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_bg.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_px_0.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_px_0.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_px_0.x from 92.125 to 168.0625 duration=0.7s easing=easeInOut
  animate zoom_px_1.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_px_1.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_px_1.x from 193.375 to 218.6875 duration=0.7s easing=easeInOut
  animate zoom_px_2.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_px_2.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_px_2.x from 294.625 to 269.3125 duration=0.7s easing=easeInOut
  animate zoom_px_3.scaleX from 1 to 0.5 duration=0.7s easing=easeInOut
  animate zoom_px_3.scaleY from 1 to 1.5 duration=0.7s easing=easeInOut
  animate zoom_px_3.x from 395.875 to 319.9375 duration=0.7s easing=easeInOut
  wait 1.2s
  animate zoom_bg.scale from 1 to 2 duration=0.8s easing=easeInOut
  animate zoom_display.scale from 1 to 2 duration=0.8s easing=easeInOut
  animate zoom_display_frame.scale from 1 to 2 duration=0.8s easing=easeInOut
  animate zoom_px_0.scale from 1 to 2 duration=0.8s easing=easeInOut
  animate zoom_px_1.scale from 1 to 2 duration=0.8s easing=easeInOut
  animate zoom_px_2.scale from 1 to 2 duration=0.8s easing=easeInOut
  animate zoom_px_3.scale from 1 to 2 duration=0.8s easing=easeInOut
  wait 1.3s
  animate frame.y from -135 to 33.75 duration=0.8s easing=easeInOut
  animate zoom_px_0.fill from "#000000" to "#FFFFFF" duration=0.8s easing=easeInOut
  animate zoom_px_1.fill from "#646464" to "#000000" duration=0.8s easing=easeInOut
  animate zoom_px_2.fill from "#1E1E1E" to "#050505" duration=0.8s easing=easeInOut
  animate zoom_px_3.fill from "#C8C8C8" to "#212121" duration=0.8s easing=easeInOut
  wait 1.3s
  animate zoom_bg.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_display.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_display_frame.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_px_0.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_px_1.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_px_2.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_px_3.scale from 2 to 1 duration=0.6s easing=easeInOut
  animate zoom_bg.opacity from 1 to 0 duration=0.6s easing=easeInOut
  animate zoom_display.opacity from 1 to 0 duration=0.6s easing=easeInOut
  animate zoom_display_frame.opacity from 1 to 0 duration=0.6s easing=easeInOut
  animate zoom_px_0.opacity from 1 to 0 duration=0.6s easing=easeInOut
  animate zoom_px_1.opacity from 1 to 0 duration=0.6s easing=easeInOut
  animate zoom_px_2.opacity from 1 to 0 duration=0.6s easing=easeInOut
  animate zoom_px_3.opacity from 1 to 0 duration=0.6s easing=easeInOut
  wait 0.6s
  play AnimationGroup(FadeOut(frame), lagRatio=0.05) duration=0.35s
  wait 0.5s
