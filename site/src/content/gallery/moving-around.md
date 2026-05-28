---
title: MovingAround
description: "Manim Example: `MovingAround` (`#movingaround`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#movingaround
source_example_path: examples/gallery/moving-around.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Fluxion は Manim の `.animate` target-copy pipeline ではなく、等価な transform/style property interpolation に展開している。"
    layer: runtime
    impact: low
    workaround: "shift, set_fill, scale, rotate を同じ順序・duration・色定数で明示的な property animation として記述する。"
    closure_condition: "`.animate` の target-state 補間をDSLで直接表現できる。"
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
  animate square.x from 0 to -68 duration=1s easing=smooth
at 1s:
  animate square.fill from "#58C4DD" to "#FF862F" duration=1s easing=smooth
at 2s:
  animate square.scale from 1 to 0.3 duration=1s easing=smooth
at 3s:
  animate square.rotation from 0 to 22.918 duration=1s easing=smooth
