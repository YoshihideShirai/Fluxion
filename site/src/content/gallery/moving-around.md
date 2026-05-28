---
title: MovingAround
description: "Manim Example: `MovingAround` (`#movingaround`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingaround
source_example_path: examples/gallery/moving-around.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Fluxion は `.animate.shift` / `.set_fill` / `.scale` / `.rotate` を DSL-native `Animate(...)` target-state primitive で表現し、差分を transform/style interpolation に展開している。"
    layer: runtime
    impact: low
    workaround: "default `Square()` の side_length=2 を Manim 16:9 frame scale の 135px に展開し、`Animate(square, shift=LEFT)`、`Animate(square, fill=ORANGE)`、`Animate(square, scale=0.3)`、`Animate(square, rotate=0.4)` を順序通り 1s smooth animation として記述する。"
    closure_condition: "より広い mobject method と updater を `.animate` 互換レイヤーで扱える。"
    fidelity_upgrade_condition: "Manim と同等の `.animate` 補間挙動で同等の視覚結果を表現できる時。"
category: Manim Stable Examples
status: ported
order: 67
gap_id: GAP-020
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
