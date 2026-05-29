---
title: MovingGroupToDestination
description: "Manim Example: `MovingGroupToDestination` (`#movinggrouptodestination`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movinggrouptodestination
source_example_path: examples/gallery/moving-group-to-destination.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Dot spacing, source child order, scaled source dot radius, destination dot radius, Manim color constants, official `self.add(group, dest)` z-order, and shift target are expanded from Manim units into gallery pixel coordinates; the group movement uses DSL-native `Animate(..., shift=...)`."
    layer: dsl
    impact: low
    workaround: "`VGroup(...).scale(1.4)` の scale-about-center 後座標、source Dot 半径 `0.08*1.4`、destination Dot 半径 `0.08`、`dest.get_center() - group[2].get_center()` を `Animate(dots, shift=(189,-202.5))` で表し、最後の `wait(0.5)` は明示時刻の hold として保持する。"
    closure_condition: "座標変換の Manim 単位系プリセットを導入する。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Manim Stable Examples
status: ported
order: 69
gap_id: GAP-022
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle c1 r=7.56 at -108,0 fill="#FFFFFF" stroke="none"
circle c2 r=7.56 at -13.5,0 fill="#FFFFFF" stroke="none"
circle c3 r=7.56 at 81,0 fill="#FC6255" stroke="none"
circle c4 r=7.56 at 175.5,0 fill="#FFFFFF" stroke="none"
group dots c1 c2 c3 c4
circle dest r=5.4 at 270,-202.5 fill="#F7D96F" stroke="none"

at 0s:
  play Animate(dots, shift=(189,-202.5)) duration=1s easing=smooth
at 1s:
  wait 0.5s
