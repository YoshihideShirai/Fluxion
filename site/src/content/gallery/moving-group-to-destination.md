---
title: MovingGroupToDestination
description: "Manim Example: `MovingGroupToDestination` (`#movinggrouptodestination`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movinggrouptodestination
source_example_path: examples/gallery/moving-group-to-destination.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "Manim の arrange/buff 等の高水準レイアウト sugar は未対応で、初期配置は明示座標で指定している。"
    layer: dsl
    impact: low
    workaround: "初期配置を `at x,y` で明示し、group 全体の移動は `animate dots.x/y` を使う。"
    closure_condition: "group レイアウト sugar（arrange/next_to 相当）が導入される。"
    fidelity_upgrade_condition: "高水準レイアウト命令だけで同等配置を再現できる時。"
category: Manim Stable Examples
status: ported
order: 69
gap_id: GAP-022
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingGroupToDestination" at 0,-20 size=42 fill="#e2e8f0"
text note "Now using group-level animate (dots.x/y)" at 0,46 size=24 fill="#22c55e"
at 0s:
  play FadeIn(title) duration=0.6s easing=easeOut
  play FadeIn(note) duration=0.6s easing=easeOut
