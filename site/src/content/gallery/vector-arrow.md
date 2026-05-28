---
title: VectorArrow
description: "Manim Example: `VectorArrow` (`#vectorarrow`) の Fluxion 移植版。"
source_manim_url: https://docs.manim.community/en/stable/examples.html#vectorarrow
source_example_path: examples/gallery/vector-arrow.fluxion.txt
porting_strategy: faithful
fidelity: faithful
known_gaps:
  - symptom: "NumberPlane は `numberPlane` helper で Manim 16:9 frame の 1 unit = 67.5px に展開し、`background_line_style` / `faded_line_style`、境界 grid line を含めない Manim の背景線生成、x/y axis の主要 stroke style、任意の tick/coordinate label を扱えるが、label direction など axis style の全オプションまでは未実装。Arrow は default `stroke_width=6`、`tip_length=0.35`、buff と tip/stroke length clamp を反映し、Manim の predefined tip_shape 名も DSL の `tipShape` として扱える。Text labels は `next_to(..., buff=SMALL_BUFF)` 相当の `nextTo` に展開し、公式 `self.add(numberplane, dot, arrow, origin_text, tip_text)` の静止フレーム z-order を保持する。"
    layer: dsl
    impact: low
    workaround: "`NumberPlane()` は frame radius、`BLUE_D` / white axes、境界を除く背景線配置に合わせ、`Arrow(ORIGIN, [2, 2, 0], buff=0)` は dot より後に描画し、67.5px/unit、default white、tip length 23.625px として展開する。"
    closure_condition: "NumberPlane の label direction などを含む axis style の互換が実装される。"
    fidelity_upgrade_condition: "既知差分が解消され、視覚・時間挙動がManimと同等と判断できる時。"
category: Manim Stable Examples
status: ported
gap_id: GAP-031
order: 78
---
scene width=960 height=540 fps=60
rect bg w=960 h=540 at 0,0 fill="#000000"
numberPlane plane
circle origin r=5.4 at 0,0 fill="#FFFFFF" stroke="#FFFFFF" strokeWidth=0
arrow vec x1=0 y1=0 x2=135 y2=-135 buff=0
circle tip_anchor r=0 at 135,-135 fill="none" stroke="none" opacity=0
text origin_label "(0, 0)" at 0,0 size=48 fill="#FFFFFF" w=128.25 h=63.45
text tip_label "(2, 2)" at 0,0 size=48 fill="#FFFFFF" w=128.25 h=63.45
nextTo origin_label origin direction=down buff=16.875
nextTo tip_label tip_anchor direction=right buff=16.875
wait 1s
