# Text DSL 機能ギャップ台帳

## 目的

この文書は、Text DSL の移植・拡張時に発生した不足機能を「機能ギャップ台帳」として一元管理する。

- 命令カタログの正は `site/src/content/docs/en/reference/text-dsl.md` とする。
- 本文書では「未実装/差分/互換方針」に加え、gallery 単位の追跡キーを管理する。
- `site/src/content/gallery/*.md` の `blocker_reason` / `missing_instructions` は、本台帳の `tracking_id`（=`gap_id`）で参照できる状態を目標とする。

## 参照元（SoT）

- Source of Truth: `site/src/content/docs/en/reference/text-dsl.md`
- 翻訳・展開対象: `site/src/content/docs/reference/text-dsl.md`（日本語）

---

## Gallery ギャップ台帳（必須項目）

各 gallery 項目ごとに、以下を必ず持つ。

1. `gallery_slug`
2. `reason`（blocker / partial を短文で）
3. `related_modules`（実装起点モジュール）
4. `tracking_id`（一意キー）

### 台帳

| tracking_id | gallery_slug | reason | related_modules |
|---|---|---|---|
| GAP-001 | animations-using-animate | faithful Python-export regression sample with low runtime caveat: the MovingAround-style `.animate.shift`, `.set_fill(opacity=0.5)`, `.scale(0.3)`, and `.rotate(22.918)` sequence is expanded to sequential property animations matching `examples/animations_using_animate.py`; browser interpolation may differ slightly from Manim's target-copy pipeline. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-002 | opening-manim | faithful port with low renderer caveat: timings follow the official `wait()`, `Create(grid, run_time=3, lag_ratio=0.1)`, and nonlinear transform `run_time=3` cadence; Tex titles keep default white styling and `Transform` materializes target text/LaTeX content at the animation end. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-003 | simple-circle | faithful port with low renderer caveat: the Python `Circle(...).set_fill(..., opacity=0.5).set_stroke(...)` export and gallery mirror use the same 1280x720 centered circle, and `Create(circle)` is represented by `geometry.drawProgress`; antialiasing can differ from Manim/Cairo. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-004 | plotting-sin-cos | faithful port with low DSL caveat: `Axes(...)` is represented by the `axes` helper with generated x ticks/numbers, `axes.plot(...)` by `plot`, and `axes.get_vertical_line(axes.i2gp(TAU, cos_graph), ...)` by `dataLine`; graph labels remain explicit positions matching the source output. | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-005 | square-to-circle | faithful port with low runtime caveat: square and circle are represented by same-command cubic paths so `Transform(square, circle)` can morph geometry and fill opacity before `FadeOut`; residual differences are limited to path interpolation and renderer antialiasing. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-006 | transform-matching-tex | faithful port with low renderer caveat: scene follows the official white MathTex-only `MatchingEquationParts` choreography, hidden target tokens are materialized for chained transforms, and `TransformMatchingTex(Group(eq1, variables), eq2)` recursively matches tokens from the source group; browser/KaTeX metrics may drift from Manim TeX rasterization. | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-007 | orbital-dot | faithful port with low DSL caveat: the source `GrowFromCenter(circle)`, `Transform(dot, dot.copy().shift(RIGHT))`, explicit linear `MoveAlongPath(dot, circle, run_time=2)`, and smooth `Rotating(dot, about_point=[2, 0, 0], run_time=1.5)` choreography are expanded into ordered scale/position/value bindings. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-008 | moving-frame-box | faithful port with low renderer caveat: official `SurroundingRectangle(text[1], buff=.1)` / `SurroundingRectangle(text[3], buff=.1)` are represented by `surroundingRect` over declared MathTex part bounds, and `ReplacementTransform(framebox1, framebox2)` now morphs the source frame before replacing it with the target frame. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-009 | manim-ce-logo | faithful port with low renderer caveat: official `MathTex(r"\\mathbb{M}").scale(7)`, `Circle()`, `Square()`, `Triangle()`, color constants, z-order, and `VGroup(...).move_to(ORIGIN)` are expanded into Manim-frame pixel geometry; MathTex browser glyph metrics can drift from Manim/LaTeX. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-010 | brace-annotation | faithful port with low renderer caveat: line bounds are normalized, `direction=perpendicular` follows the source `line.copy().rotate(PI / 2).get_unit_vector()` side for diagonal line targets, `sharpness` follows Manim's target-width scaling model, and the renderer derives the curl from Manim's Brace SVG path template / `default_min_width=0.90552` / `linear_section_length`; labels are primitive `get_text` / `get_tex`-style brace labels anchored from the computed tip rather than separate hand-positioned nodes. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-011 | sine-curve-unit-circle | faithful port via value bindings: updater-built sine curve history is represented with `tracedPath` plus synchronized bindings, using Manim's 16:9 frame scale for x-axis endpoints `[-6,0]`/`[6,0]`, origin `[-4,0]`, unit circle radius 1, and `t_offset += dt * 0.25` over `wait(8.5)`. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-012 | special-camera | visual approximation improved: FollowingGraphCamera now uses the `axes` helper for the official `Axes(x_range=[-1, 10], y_range=[-1, 10])` layout with Manim's default `x_length=12`, `y_length=6` expanded to 810x405px at the 16:9 frame scale, and the `plot` helper for `axes.plot(..., x_range=[0, 3*PI])` with Manim BLUE/default Dot sizing. It starts from the official `self.add(...)` static graph, uses the default 1s zoom-in, 1s `MoveAlongPath(..., rate_func=linear)`, and 1s `Restore` cadence, and follows the moving dot through continuous `camera.target.x/y` bindings instead of sampled `animateFrame` moves. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-013 | arg-min-example | faithful port with low DSL caveat: official default `Axes` length is expanded at Manim frame scale (12x6 units -> 810x405 px), ticks are generated by `axes`, the parabola is sampled by `plot`, and the dot updater is represented by `dataDot`; the animation target follows the source `np.linspace(..., 200).argmin()` sample at `x≈4.974874`. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-014 | boolean-operations | faithful port with low runtime caveat: the two official `Ellipse(width=4.0, height=5.0)` shapes are expanded at Manim's 16:9 frame scale into analytic SVG arc paths for Intersection/Union/Exclusion/Difference, with split fill and stroke so Manim's `fill_opacity=0.5` keeps stronger outlines; generic path boolean primitives are still missing. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-015 | fixed-in-frame-m-object-test | faithful port with low runtime caveat: `ThreeDAxes()` is represented by the `threeDAxes` helper using the official default `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, and `z_range=(-4,4,1)` projected into line/tick/tip geometry; `add_fixed_in_frame_mobjects(text3d)` and default `Text(..., font_size=48).to_corner(UL)` are represented by a fixed screen-space text placement. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-016 | graph-area-plot | faithful port with low DSL caveat: official default `Axes` length is expanded at Manim frame scale (12x6 units -> 810x405 px), `axes` generates ticks/numbers, `dataLine` represents the vertical graph markers, `dataRiemannRects` left-samples the official curve, and `dataArea` samples the bounded region between the two source curves. | `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-017 | gradient-image-from-array | visual parity improved: Text DSL has an `image` primitive that renders grayscale matrix data as pixel cells, and Python DSL exposes `ImageMobject` for array-to-image export; gallery uses a sampled array to avoid huge checked-in JSON. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-018 | heat-diagram-plot | faithful port with low DSL caveat: explicit source `Axes(x_length=9, y_length=6)` is expanded at Manim frame scale (607.5x405 px), the asymmetric-range origin is preserved, `xNumbers` follows `np.arange(0, 40, 5)`, and `dataLineGraph` maps data points to a Manim-style yellow line graph with default-size vertex dots; axis labels are still explicit math nodes. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-019 | moving-angle | faithful port via DSL helpers/value bindings: `Line.rotate(..., about_point=LEFT)` is represented by `rotatingLine`, while Angle/MathTex updaters are expanded to `value` + `always` bindings with the label placed at the Manim `Angle(..., radius=0.5 + 3 * SMALL_BUFF).point_from_proportion(0.5)` radius. | `web/src/runtime/*`, `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-020 | moving-around | faithful port with low runtime caveat: the official default `Square(color=BLUE, fill_opacity=1)` is expanded to a 135px square at Manim's 67.5px/unit 16:9 frame scale, and `.animate.shift(LEFT)`, `.set_fill(ORANGE)`, `.scale(0.3)`, and `.rotate(0.4)` are expanded to equivalent sequential property interpolation. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-021 | moving-dots | faithful port with low DSL caveat: `VGroup(d1,d2).arrange(RIGHT,buff=1)` is expanded to Manim-frame pixel spacing, `Dot.set_x` / `Dot.set_y` updaters are represented with `value` trackers and `always` bindings, and `Line(...).become(...)` connector updates are represented by `dynamicLine` endpoint bindings. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-022 | moving-group-to-destination | faithful port with low DSL caveat: `VGroup(Dot(LEFT), Dot(ORIGIN), Dot(RIGHT, color=RED), Dot(2 * RIGHT)).scale(1.4)` is expanded into Manim-frame pixel coordinates, and the group shift target is computed so the red dot lands on `Dot([4, 3, 0], color=YELLOW)`. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-023 | moving-zoomed-scene-around | visual approximation improved: ZoomedScene sub-camera/display is hand-authored with official 2x4 grayscale image dimensions, Manim 16:9 frame-unit sizing for `image.height=7`, default `Dot()` radius 0.08, `zoomed_display_width=6`, `zoomed_display_height=1`, and `zoom_factor=0.3`, right-corner-plus-`DOWN` zoom display placement, pop-out from the frame rectangle, Transform-level `scaleX`/`scaleY` anisotropic scaling, display content retargeting after frame shift, and reverse pop-out fade. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-024 | point-with-trace | faithful port via value bindings: VMobject updater history is represented as a single piecewise `tracedPath` synced with the dot motion across `Rotating(dot, angle=PI, about_point=RIGHT, run_time=2)`, `dot.animate.shift(UP)`, and `dot.animate.shift(LEFT)`, expanded at Manim's 16:9 frame scale. | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-025 | polygon-on-axes | faithful port with low DSL caveat: axes ticks are generated by `axes`, the `25/x` graph is sampled by `plot`, and the `always_redraw(Polygon(... ax.c2p ...))` rectangle plus moving dot are represented by `dataRect`/`dataDot` value bindings. | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-026 | rotation-updater | faithful port with low DSL caveat: callback updater `rotate_about_origin(rate * dt)` is represented by the `rotateUpdater` helper, which expands rad/s `dt` accumulation into equivalent linear `rotation` animations. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-027 | three-d-camera-illusion-rotation | visual approximation improved: the official default `Circle(radius=1)` initial shape is generated by the `projectedCircle` helper from the same XY projection basis as the axes, and `begin_3dillusion_camera_rotation(rate=2)` is expanded into two projected coordinate keyframes matching its theta sine and phi cosine offsets over `wait(PI/2)`, including tick marks that move with the projected ThreeDAxes. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-028 | three-d-camera-rotation | visual approximation improved: the official default `Circle(radius=1)` initial shape is generated by the `projectedCircle` helper from the same XY projection basis as the axes, and ambient camera rotation expands the official `rate=0.1` one-second theta sweep into projected axes/circle/tick coordinate interpolation, then eases back for `move_camera`. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-029 | three-d-light-source-position | visual approximation improved: `ThreeDAxes()` is represented by the `threeDAxes` helper using the same `phi=75°, theta=30°` projection style as the 3D camera examples, and the official `Surface(..., checkerboard_colors=[RED_D, RED_E], resolution=(15,32))` sphere is represented by the `sphereSurface` helper with shaded projected checkerboard faces. The composed sphere group is scaled to 101.25px radius from the official radius 1.5 at Manim's 67.5px/unit 16:9 frame scale, with a `3*IN`-style top-centered highlight/sheen and opposite-side terminator shadow. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-030 | three-d-surface-plot | visual approximation improved: `ThreeDAxes()` is represented by `threeDAxes` with visible tick marks and tips, and Gaussian checkerboard Surface uses a `gaussianSurface` Text DSL helper that expands the official `param_gauss`, `resolution=(24,24)`, `scale(2)`, ORANGE/BLUE 0.5-opacity checkerboard styling, GREEN strokes, and height-based face shading into projected path faces. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-031 | vector-arrow | faithful port with low DSL caveat: `NumberPlane()` is represented by the `numberPlane` helper at Manim's 16:9 frame scale, `Arrow(ORIGIN, [2, 2, 0], buff=0)` is represented by the Manim-like `arrow` helper with endpoint, buff, and tip/stroke length ratio clamp, and `Text(...).next_to(...)` labels are expanded to explicit positions; fine NumberPlane style options and all Arrow `tip_shape` variants are still missing. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |

---

## `gap_id` 導入方針（frontmatter）

`site/src/content/gallery/*.md` の frontmatter へ `gap_id` を追加し、台帳 `tracking_id` と1:1対応させる。

### ルール

- `gap_id` の形式は `GAP-###`（3桁ゼロ埋め）とする。
- `gap_id` は slug ごとに不変（理由文が変わってもIDは維持）。
- `blocker_reason` が存在する項目は **必須**。
- `missing_instructions` のみを持つ項目でも **必須**。
- 実装完了後に blocker が解消しても、`gap_id` は履歴参照のため残す。

### 記述例

```md
---
slug: three-d-surface-plot
title: Three D Surface Plot
status: blocked
gap_id: GAP-030
blocker_reason: Required primitives/effects are not fully mapped yet.
missing_instructions:
  - Implement 3D surface mesh primitive mapping.
  - Add camera/light interpolation parity.
---
```

### 更新手順

1. gallery 追加時: 新しい `tracking_id/gap_id` を本台帳に採番。
2. 同PRで対象 `site/src/content/gallery/<slug>.md` に `gap_id` を追加。
3. `blocker_reason` / `missing_instructions` の変更時は、同一 `gap_id` を使って台帳 `reason` を同期。
4. 解消時は `reason` を「resolved（date）」に更新し、ID自体は保持。

---

## 拡張時の同時更新ルール（必須）

Text DSL に新しい命令・構文・意味論を追加する場合、**最低限** 次を同一PRで更新する。

1. `web/src/dsl/compiler.ts`（構文解析・AST/IR変換）
2. `schemas/fluxion.schema.json`（IRスキーマ）
3. `web/src/runtime/*`（再生挙動）
4. `site/src/content/docs/en/reference/text-dsl.md` と `site/src/content/docs/reference/text-dsl.md`（日英仕様）

補足:

- 仕様だけ先行し、実装が追随しない状態を禁止する。
- 実装だけ先行し、日英ドキュメントが欠落する状態を禁止する。
- 互換破壊の可能性がある場合は schema の変更理由と移行方針をPR本文に明記する。
