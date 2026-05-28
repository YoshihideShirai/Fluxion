---
title: PointWithTrace
description: "Manim Example: `PointWithTrace` (`#pointwithtrace`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointwithtrace
source_example_path: examples/gallery/point-with-trace.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "Dot motion uses DSL-native `Rotating(... about=RIGHT)` and `Animate(... shift=...)`; trace uses `tracedPath target=dot`, which rebuilds the target motion history on seek. Fine sampling can still differ from Manim's per-frame updater history."
    layer: dsl
    impact: low
    workaround: "半回転は `Rotating(dot, PI, about=RIGHT)`、上/左移動は `Animate(dot, shift=...)` で表し、trace は `tracedPath target=dot` で seek 時点までの target transform をサンプリングし、滑らかな cubic path として再構築する。`Rotating` は公式ソースの既定 `linear`、後続 `.animate.shift` は既定 `smooth` として扱う。"
    closure_condition: "Manim と同じ per-frame updater sampling まで一致する。"
    fidelity_upgrade_condition: "Manim の `path.add_updater(update_path)` と同等の履歴追記で再現できる時。"
category: Manim Stable Examples
status: ported
order: 71
gap_id: GAP-024
---
scene width=960 height=540 fps=60

rect bg w=960 h=540 at 0,0 fill="#000000"
circle dot r=5.4 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=0
tracedPath trace target=dot start=0s samples=240 stroke="#FFFFFF" strokeWidth=4

at 0s:
  play Rotating(dot, 3.141592654, about=RIGHT) duration=2s easing=linear
at 2s:
  wait 1s
at 3s:
  play Animate(dot, shift=UP) duration=1s easing=smooth
at 4s:
  play Animate(dot, shift=LEFT) duration=1s easing=smooth
at 5s:
  wait 1s
