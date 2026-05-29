---
title: AnimationsUsingAnimate
description: "Manim Example: `MovingAround` (`#movingaround`) の `.animate` sequence に対応するデモ。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingaround
source_example_path: examples/gallery/animations-using-animate.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "公式 `MovingAround` と同じ `.animate.shift` / `.set_fill` / `.scale` / `.rotate` の順序を、DSL-native `Animate(...)` target-state primitive として再現している。"
    layer: runtime
    impact: low
    workaround: "default `Square(color=BLUE, fill_opacity=1)` は 135px square、`Animate(square, shift=LEFT)` は x=-67.5 への target shift、`Animate(square, fill=ORANGE)` は Manim `ORANGE`、`scale=0.3` / `rotate=0.4` は target-state 差分として順序通りの 1s smooth animation に展開する。"
    closure_condition: "補間・レート関数の挙動がManim準拠になる。"
    fidelity_upgrade_condition: "追加対応不要。"
category: Animations
status: ported
gap_id: GAP-001
order: 20
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
rect square w=135 h=135 at 0,0 fill="#58C4DD" stroke="#58C4DD" strokeWidth=4

at 0s:
  play Animate(square, shift=LEFT) duration=1s easing=smooth
at 1s:
  play Animate(square, fill="#FF862F") duration=1s easing=smooth
at 2s:
  play Animate(square, scale=0.3) duration=1s easing=smooth
at 3s:
  play Animate(square, rotate=0.4) duration=1s easing=smooth
