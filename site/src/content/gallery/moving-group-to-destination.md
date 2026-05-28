---
title: MovingGroupToDestination
description: "Manim Example: `MovingGroupToDestination` (`#movinggrouptodestination`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movinggrouptodestination
source_example_path: examples/gallery/moving-group-to-destination.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Dot spacing and shift target are matched visually, but exact Manim point units are represented in gallery pixel coordinates."
    layer: dsl
    impact: low
    workaround: "必要な微調整は `animate` の座標指定で補う。"
    closure_condition: "座標変換の Manim 単位系プリセットを導入する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 69
gap_id: GAP-022
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle c1 r=22 at -72,0 fill="#ffffff" stroke="none"
circle c2 r=22 at -24,0 fill="#ffffff" stroke="none"
circle c3 r=22 at 24,0 fill="#ff0000" stroke="none"
circle c4 r=22 at 72,0 fill="#ffffff" stroke="none"
group dots c1 c2 c3 c4
circle dest r=22 at 256,-144 fill="#ffff00" stroke="none"

at 0s:
  animate dots.x from 0 to 232 duration=1s easing=smooth
at 0s:
  animate dots.y from 0 to -144 duration=1s easing=smooth
wait 0.5s
