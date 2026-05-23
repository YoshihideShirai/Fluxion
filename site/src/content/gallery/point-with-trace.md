---
title: PointWithTrace
description: "Manim Example: `PointWithTrace` (`#pointwithtrace`) の未移植デモ（プレースホルダー）。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#pointwithtrace
source_example_path: examples/gallery/point-with-trace.fluxion.txt
porting_strategy: omitted_parts
fidelity: visual_approximation
known_gaps:
  - symptom: "この Example はまだ Fluxion へ移植されていません（プレースホルダー表示のみ）。"
    layer: compiler
    impact: high
    workaround: "同テーマの移植済み Example を参照する。"
    closure_condition: "当該 Example の DSL 実装とアニメーションシーケンスが追加される。"
    fidelity_upgrade_condition: "プレースホルダーではなく元Example相当のシーンが再現され、主要差分が解消された時。"
category: Manim Stable Examples
status: blocker
blocker_reason: Required primitives/effects are not fully mapped yet.
order: 71
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#0b1020"
text title "PointWithTrace" at 0,-20 size=42 fill="#e2e8f0"
text note "Placeholder: not ported yet" at 0,46 size=24 fill="#f59e0b"
at 0s:
  play FadeIn(title) duration=0.6s easing=easeOut
  play FadeIn(note) duration=0.6s easing=easeOut
