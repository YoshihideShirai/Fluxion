---
title: RotationUpdater
description: "Manim Example: `RotationUpdater` (`#rotationupdater`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#rotationupdater
source_example_path: examples/gallery/rotation-updater.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Manim の callback updater `(mobj, dt)` は直接実行しないが、`rotate_about_origin(dt)` の累積結果を `rotateUpdater` で `rotation` アニメーションへ展開している。"
    layer: dsl
    impact: low
    workaround: "`rotateUpdater rate=1 duration=2s` と `rate=-1` で、Manim の rad/s `dt` 累積を約 114.592 度の線形回転と逆回転に変換する。"
    closure_condition: "callback ベース updater（引数 `dt`）を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "Manim の updater 関数をそのまま記述して同挙動を再現できる時。"
category: Manim Stable Examples
status: ported
priority: high
gap_id: GAP-026
order: 73
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
line line_reference x1=0 y1=0 x2=-180 y2=0 stroke="#FFFFFF" strokeWidth=8
line line_moving x1=0 y1=0 x2=-180 y2=0 stroke="#FFFF00" strokeWidth=8

rotateUpdater line_moving rate=1 duration=2s
rotateUpdater line_moving rate=-1 duration=2s
wait 0.5s
