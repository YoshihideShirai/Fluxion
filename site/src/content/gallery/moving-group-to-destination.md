---
title: MovingGroupToDestination
description: "Manim Example: `MovingGroupToDestination` (`#movinggrouptodestination`) の Fluxion 移植版（group destination 移動の近似実装）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movinggrouptodestination
source_example_path: examples/gallery/moving-group-to-destination.fluxion.txt
porting_strategy: visual_approximation
fidelity: visual_approximation
known_gaps:
  - symptom: "group 自体を 1 命令で destination へ移動させる高水準 DSL（例: group animate/moveTo）が未実装のため、子要素ごとの座標 animate で近似している。"
    layer: dsl
    impact: medium
    workaround: "group children を個別に animate して相対位置を維持しつつ destination へ移動させる。"
    closure_condition: "group に対する移動/整列の高水準命令を DSL へ追加し、単一命令で destination 遷移を記述できる。"
    fidelity_upgrade_condition: "Manim 同様に group 単位の destination 指定で遷移でき、子要素の相対配置が自動維持される時。"
category: Manim Stable Examples
status: partial
order: 69
gap_id: GAP-022
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "MovingGroupToDestination" at 0,-20 size=42 fill="#e2e8f0"
text note "Group destination move is now approximated" at 0,46 size=24 fill="#f59e0b"
at 0s:
  play FadeIn(title) duration=0.6s easing=easeOut
  play FadeIn(note) duration=0.6s easing=easeOut
