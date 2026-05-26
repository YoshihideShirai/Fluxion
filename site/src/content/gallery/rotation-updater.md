---
title: RotationUpdater
description: "Manim Example: `RotationUpdater` (`#rotationupdater`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#rotationupdater
source_example_path: examples/gallery/rotation-updater.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "本家の updater callback 連鎖は未対応のため、value tracker と `always` で回転合成を近似している。"
    layer: dsl
    impact: medium
    workaround: "角度を value で管理し、`always` で複数要素へ回転を伝播する。"
    closure_condition: "callback ベース updater（引数 `dt`）を DSL/runtime で直接扱えるようにする。"
    fidelity_upgrade_condition: "Manim の updater 関数をそのまま記述して同挙動を再現できる時。"
category: Manim Stable Examples
status: partial
priority: high
gap_id: GAP-026
order: 73
---
scene width=960 height=540 fps=60
value theta = 0
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "RotationUpdater" at 0,220 size=40 fill="#e2e8f0"
circle ring r=120 at 0,-20 fill="none" stroke="#334155" strokeWidth=2
line needle x1=0 y1=0 x2=120 y2=0 at 0,-20 stroke="#38bdf8" strokeWidth=4
rect follower w=40 h=40 at 170,-20 fill="none" stroke="#f59e0b" strokeWidth=3
always needle.rotation = expr=theta
always follower.rotation = expr=-1.8*theta
always follower.y = expr=-20 + 40*sin(theta)
at 0s:
  play FadeIn(title) duration=0.5s
  play Create(ring) duration=0.6s
  play Create(needle) duration=0.5s
  play Create(follower) duration=0.5s
wait 0.2s
animate theta from 0 to 6.283 duration=3.5s easing=linear
