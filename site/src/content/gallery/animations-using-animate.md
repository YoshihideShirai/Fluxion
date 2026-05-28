---
title: AnimationsUsingAnimate
description: "Manim Example: `MovingAround` (`#movingaround`) に着想を得た Python DSL export デモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingaround
source_example_path: examples/animations_using_animate.py
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "公式 `MovingAround` と同じ `.animate.shift` / `.set_fill` / `.scale` / `.rotate` の順序を Python DSL export で再現しているが、1280x720 の Python サンプル配置を優先しているため gallery の `MovingAround` とは座標系が異なる。"
    layer: runtime
    impact: low
    workaround: "公式 `MovingAround` の完全な frame-scale 移植は `moving-around` gallery に置き、このページは Python DSL → JSON export の回帰確認として維持する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Animations
status: ported
order: 20
---
scene width=1280 height=720 fps=60

rect bg w=1280 h=720 at 640,360 fill="#000000"
rect square w=120 h=120 at 640,360 fill="#ffffff" fillOpacity=0 stroke="#ffffff" strokeWidth=4

at 0s:
  animate square.x from 640 to 520 duration=1s easing=smooth
at 1s:
  animate square.fill from "#ffffff" to "#f97316" duration=1s easing=smooth
  animate square.fillOpacity from 0 to 0.5 duration=1s easing=smooth
at 2s:
  animate square.scale from 1 to 0.3 duration=1s easing=smooth
at 3s:
  animate square.rotation from 0 to 22.918 duration=1s easing=smooth
