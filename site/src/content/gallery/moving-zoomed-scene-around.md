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
    workaround: "元画像と zoom display を同じ grayscale rect 群で描き、zoom display 内容は表示矩形に clip する。Manim の 16:9 frame 換算で公式 `image.height=7`、default `Dot()` 半径 0.08、`zoomed_display_width=6` / `height=1` / `zoom_factor=0.3`、右上 corner からの `shift(DOWN)` placement、透明な `BackgroundRectangle(..., fill_opacity=0, buff=MED_SMALL_BUFF)`、独立した赤い display frame、pop-out、`FadeIn(..., shift=UP)` の上方向からのテキスト移動、非等方 scale、frame shift 後の sub-camera 内容差し替え、reverse pop-out の frame 位置への畳み込み、終端の `Uncreate(zoomed_display_frame)` と `FadeOut(frame)`、最後の既定 `self.wait()` 1秒 hold を通常 animation に展開する。"
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

rect zoom_bg w=155.25 h=54 at -135,-135 fill="none" stroke="none" strokeWidth=0 opacity=0
rect zoom_display w=121.5 h=20.25 at -135,-135 fill="#242424" stroke="none" opacity=0
rect zoom_px_0 w=30.375 h=20.25 at -180.5625,-135 fill="#000000" stroke="none" opacity=0
rect zoom_px_1 w=30.375 h=20.25 at -150.1875,-135 fill="#646464" stroke="none" opacity=0
rect zoom_px_2 w=30.375 h=20.25 at -119.8125,-135 fill="#1E1E1E" stroke="none" opacity=0
rect zoom_px_3 w=30.375 h=20.25 at -89.4375,-135 fill="#C8C8C8" stroke="none" opacity=0
group zoom_display_content zoom_display zoom_px_0 zoom_px_1 zoom_px_2 zoom_px_3 clipTarget=zoom_display
rect zoom_display_frame w=121.5 h=20.25 at -135,-135 fill="none" stroke="#FC6255" strokeWidth=20 opacity=0
text zoom_text "Zoomed camera" at 244,-50 size=67 fill="#FC6255" opacity=0

at 0s:
  play AnimationGroup(Create(frame), FadeIn(frame_text, shift=UP), lagRatio=0) duration=1s
  animate zoom_bg.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_bg.x from -135 to 244 duration=1s easing=smooth
  animate zoom_bg.w from 155.25 to 438.75 duration=1s easing=smooth
  animate zoom_bg.h from 54 to 101.25 duration=1s easing=smooth
  animate zoom_display.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_display.x from -135 to 244 duration=1s easing=smooth
  animate zoom_display.w from 121.5 to 405 duration=1s easing=smooth
  animate zoom_display.h from 20.25 to 67.5 duration=1s easing=smooth
  animate zoom_display_frame.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_display_frame.x from -135 to 244 duration=1s easing=smooth
  animate zoom_display_frame.w from 121.5 to 405 duration=1s easing=smooth
  animate zoom_display_frame.h from 20.25 to 67.5 duration=1s easing=smooth
  animate zoom_px_0.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_px_0.x from -180.5625 to 92.125 duration=1s easing=smooth
  animate zoom_px_0.w from 30.375 to 101.25 duration=1s easing=smooth
  animate zoom_px_0.h from 20.25 to 67.5 duration=1s easing=smooth
  animate zoom_px_1.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_px_1.x from -150.1875 to 193.375 duration=1s easing=smooth
  animate zoom_px_1.w from 30.375 to 101.25 duration=1s easing=smooth
  animate zoom_px_1.h from 20.25 to 67.5 duration=1s easing=smooth
  animate zoom_px_2.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_px_2.x from -119.8125 to 294.625 duration=1s easing=smooth
  animate zoom_px_2.w from 30.375 to 101.25 duration=1s easing=smooth
  animate zoom_px_2.h from 20.25 to 67.5 duration=1s easing=smooth
  animate zoom_px_3.opacity from 0 to 1 duration=1s easing=smooth
  animate zoom_px_3.x from -89.4375 to 395.875 duration=1s easing=smooth
  animate zoom_px_3.w from 30.375 to 101.25 duration=1s easing=smooth
  animate zoom_px_3.h from 20.25 to 67.5 duration=1s easing=smooth
  wait 1s
  play FadeIn(zoom_text, shift=UP) duration=1s

at 3s:
  animate frame.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate frame.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_display.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_display.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_display_frame.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_display_frame.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_bg.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_bg.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_px_0.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_px_0.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_px_0.x from 92.125 to 168.0625 duration=1s easing=easeInOut
  animate zoom_px_1.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_px_1.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_px_1.x from 193.375 to 218.6875 duration=1s easing=easeInOut
  animate zoom_px_2.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_px_2.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_px_2.x from 294.625 to 269.3125 duration=1s easing=easeInOut
  animate zoom_px_3.scaleX from 1 to 0.5 duration=1s easing=easeInOut
  animate zoom_px_3.scaleY from 1 to 1.5 duration=1s easing=easeInOut
  animate zoom_px_3.x from 395.875 to 319.9375 duration=1s easing=easeInOut
  animate frame_text.opacity from 1 to 0 duration=1s easing=easeInOut
  animate zoom_text.opacity from 1 to 0 duration=1s easing=easeInOut
  wait 2s
  animate zoom_bg.scale from 1 to 2 duration=1s easing=easeInOut
  animate zoom_display.scale from 1 to 2 duration=1s easing=easeInOut
  animate zoom_display_frame.scale from 1 to 2 duration=1s easing=easeInOut
  animate zoom_px_0.scale from 1 to 2 duration=1s easing=easeInOut
  animate zoom_px_1.scale from 1 to 2 duration=1s easing=easeInOut
  animate zoom_px_2.scale from 1 to 2 duration=1s easing=easeInOut
  animate zoom_px_3.scale from 1 to 2 duration=1s easing=easeInOut
  wait 2s
  animate frame.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_px_0.fill from "#000000" to "#FFFFFF" duration=1s easing=easeInOut
  animate zoom_px_1.fill from "#646464" to "#000000" duration=1s easing=easeInOut
  animate zoom_px_2.fill from "#1E1E1E" to "#050505" duration=1s easing=easeInOut
  animate zoom_px_3.fill from "#C8C8C8" to "#212121" duration=1s easing=easeInOut
  wait 2s
  animate zoom_bg.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_display.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_display_frame.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_px_0.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_px_1.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_px_2.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_px_3.scale from 2 to 1 duration=1s easing=easeInOut
  animate zoom_bg.x from 244 to -135 duration=1s easing=easeInOut
  animate zoom_bg.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_display.x from 244 to -135 duration=1s easing=easeInOut
  animate zoom_display.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_display_frame.x from 244 to -135 duration=1s easing=easeInOut
  animate zoom_display_frame.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_px_0.x from 168.0625 to -180.5625 duration=1s easing=easeInOut
  animate zoom_px_0.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_px_1.x from 218.6875 to -150.1875 duration=1s easing=easeInOut
  animate zoom_px_1.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_px_2.x from 269.3125 to -119.8125 duration=1s easing=easeInOut
  animate zoom_px_2.y from -135 to 33.75 duration=1s easing=easeInOut
  animate zoom_px_3.x from 319.9375 to -89.4375 duration=1s easing=easeInOut
  animate zoom_px_3.y from -135 to 33.75 duration=1s easing=easeInOut
  wait 1s
  animate zoom_bg.opacity from 1 to 0 duration=1s easing=easeInOut
  animate zoom_display.opacity from 1 to 0 duration=1s easing=easeInOut
  animate zoom_px_0.opacity from 1 to 0 duration=1s easing=easeInOut
  animate zoom_px_1.opacity from 1 to 0 duration=1s easing=easeInOut
  animate zoom_px_2.opacity from 1 to 0 duration=1s easing=easeInOut
  animate zoom_px_3.opacity from 1 to 0 duration=1s easing=easeInOut
  play AnimationGroup(Uncreate(zoom_display_frame), FadeOut(frame), lagRatio=0) duration=1s easing=easeInOut
  wait 1s
