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
| GAP-001 | animations-using-animate | faithful port with low runtime caveat: the official MovingAround `.animate.shift(LEFT)`, `.set_fill(ORANGE)`, `.scale(0.3)`, and `.rotate(0.4)` sequence is represented by DSL-native `Animate(...)` target-state primitives at Manim's 67.5px/unit frame scale; browser interpolation may differ slightly from Manim's renderer pipeline. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-002 | opening-manim | faithful port with low renderer caveat: timings follow the official `wait()`, `Create(grid, run_time=3, lag_ratio=0.1)`, and nonlinear transform `run_time=3` cadence; `NumberPlane()` is expanded at Manim frame scale into a full-frame 1-unit grid, and each nonlinear target grid line samples the source `p + [sin(p[1]), sin(p[0]), 0]` transform instead of using a single cubic approximation; Tex titles keep default white styling and `Transform` materializes target text/LaTeX content at the animation end. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-003 | simple-circle | faithful port with low renderer caveat: official quickstart `Circle().set_fill(PINK, opacity=0.5)` is expanded to a Manim-frame 67.5px-radius circle with default white stroke, and `Create(circle)` is represented by `geometry.drawProgress`; antialiasing can differ from Manim/Cairo. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-004 | plotting-sin-cos | faithful port with low DSL caveat: official `Axes(x_range=[-10, 10.3, 1], y_range=[-1.5, 1.5, 1], x_length=10, tips=False)` is represented by the `axes` helper at Manim's 67.5px/unit frame scale (675px x length, default 405px y length) with generated x ticks/numbers, `get_axis_labels()` by `axisLabels`, `axes.plot(...)` by `plot`, `get_graph_label(...).next_to(...).shift_onto_screen()` by `graphLabel`, and `axes.get_vertical_line(axes.i2gp(TAU, cos_graph), ...)` by `dataLine`. | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-005 | square-to-circle | faithful port with low runtime caveat: official quickstart `Square().rotate(PI / 4)` and `Circle().set_fill(PINK, opacity=0.5)` are expanded at Manim's 67.5px/unit frame scale into same-command cubic paths so `Transform(square, circle)` can morph geometry and fill opacity before `FadeOut`; residual differences are limited to path interpolation and renderer antialiasing. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-006 | transform-matching-tex | faithful port with low renderer caveat: scene follows the official white MathTex-only `MatchingEquationParts` choreography, the `VGroup(MathTex("a"), MathTex("b"), MathTex("c")).arrange_submobjects().shift(UP)` source variables are placed above the equation at Manim frame scale, hidden target tokens are materialized for chained transforms, and `TransformMatchingTex(Group(eq1, variables), eq2)` recursively matches tokens from the source group; browser/KaTeX metrics may drift from Manim TeX rasterization. | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-007 | orbital-dot | faithful port with low DSL caveat: the source `GrowFromCenter(circle)` is expanded from Manim's full-opacity, zero-scale starting mobject, `Transform(dot, dot.copy().shift(RIGHT))`, explicit linear `MoveAlongPath(dot, circle, run_time=2)` via DSL-native circular `MoveAlongPath`, default-linear `Rotating(dot, about_point=[2, 0, 0], run_time=1.5)` via DSL-native OUT-axis `Rotating`, and final default wait choreography are expanded at Manim's 67.5px/unit frame scale. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-008 | moving-frame-box | faithful port with low renderer caveat: official `Write(text)` follows Manim's length-based default as a two-second linear write, `SurroundingRectangle(text[1], buff=.1)` / `SurroundingRectangle(text[3], buff=.1)` are represented by `surroundingRect` over declared MathTex part bounds, and `ReplacementTransform(framebox1, framebox2)` morphs the source frame before replacing it with the target frame. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-009 | manim-ce-logo | faithful port with low renderer caveat: official `MathTex(r"\\mathbb{M}").scale(7)`, `Circle()`, `Square()`, `Triangle()`, color constants, z-order, and `VGroup(...).move_to(ORIGIN)` are expanded into Manim-frame pixel geometry, with the post-centering logo positions checked against the official rendered PNG color regions; MathTex browser glyph metrics can drift from Manim/LaTeX. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-010 | brace-annotation | faithful port with low renderer caveat: dot/line coordinates use Manim's 16:9 frame scale (`[-2,-1]` -> `[-135,67.5]`, default Dot radius 0.08 -> 5.4px), line bounds are normalized, `Brace(..., buff=0.2, sharpness=2)` maps to 13.5px, `direction=perpendicular` follows the source `line.copy().rotate(PI / 2).get_unit_vector()` side for diagonal line targets, and the renderer derives the curl from Manim's Brace SVG path template / `default_min_width=0.90552` / `linear_section_length`; labels are primitive `get_text` / `get_tex`-style brace labels anchored from the computed tip rather than separate hand-positioned nodes. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-011 | sine-curve-unit-circle | faithful port via value bindings: updater-built sine curve history is represented with `tracedPath` plus synchronized bindings, using Manim's 16:9 frame scale for x-axis endpoints `[-6,0]`/`[6,0]`, origin `[-4,0]`, unit circle radius 1, default `MathTex` label size, Manim `YELLOW` / `YELLOW_A` / `YELLOW_D` colors, `t_offset += dt * 0.25` over `wait(8.5)`, and the final default `self.wait()` hold. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-012 | special-camera | faithful port with low internal-representation caveat: FollowingGraphCamera uses the `axes` helper for the official `Axes(x_range=[-1, 10], y_range=[-1, 10])` layout with Manim's default `x_length=12`, `y_length=6` expanded to 810x405px at the 16:9 frame scale, and the `plot` helper for `axes.plot(..., x_range=[0, 3*PI])` with Manim BLUE/default Dot sizing. It starts from the official `self.add(...)` static graph, uses the default 1s zoom-in, DSL-native plot `MoveAlongPath(..., rate_func=linear)` expanded by arc-length proportions matching Manim's `path.point_from_proportion()`, and 1s `Restore` cadence; `cameraFrame camera_frame` keeps an invisible frame mobject in the scene graph, and `followCamera moving_dot frame=camera_frame` tracks the actual animated dot center after timeline interpolation, matching the source `camera.frame.add_updater(...move_to(moving_dot.get_center()))` visible behavior and preserving frame state. The remaining caveat is incomplete coverage of the broader `camera.frame` API. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-013 | arg-min-example | faithful port with low DSL caveat: official default `Axes` length is expanded at Manim frame scale (12x6 units -> 810x405 px), `get_axis_labels(x_label="x", y_label="f(x)")` is represented by the `axisLabels` helper at the axes' `UR` endpoints, ticks are generated by `axes`, the parabola is sampled by `plot`, and the official default-radius dot updater is represented by `dataDot`; the animation target follows the source `np.linspace(..., 200).argmin()` sample at `x≈4.974874`, followed by the final default `self.wait()` hold. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-014 | boolean-operations | faithful port with low runtime caveat: the two official `Ellipse(width=4.0, height=5.0)` shapes are expanded at Manim's 16:9 frame scale into analytic SVG arc paths for Intersection/Union/Exclusion/Difference, with split fill and stroke so Manim's `fill_opacity=0.5` keeps stronger outlines. The title uses the official `MarkupText` default `font_size=48`. The timeline follows the official sequence of default one-second `self.play(...)` calls: initial ellipse group fade-in, each result `Animate(...)` move/scale/fade-in, then each label fade-in; generic path boolean primitives are still missing. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-015 | fixed-in-frame-m-object-test | faithful port with low runtime caveat: `ThreeDAxes()` is represented at the unshifted Manim scene origin by the `threeDAxes` helper using the official default `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, `x_length=10.5`, `y_length=10.5`, `z_length=6.5`, and `set_camera_orientation(phi=75°, theta=-45°)` via Manim `ThreeDCamera`-style perspective projection; `add_fixed_in_frame_mobjects(text3d)` and default `Text(..., font_size=48).to_corner(UL)` are represented by `fixedInFrame=true`, which renders the text in a screen-space layer outside the camera transform. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-016 | graph-area-plot | faithful port with low DSL caveat: official default `Axes` length is expanded at Manim frame scale (12x6 units -> 810x405 px), `get_axis_labels()` is represented by the `axisLabels` helper at the axes' `UR` endpoints, `axes` generates ticks/numbers, `dataLine` represents the vertical graph markers, `dataRiemannRects` left-samples the official curve, and `dataArea` samples the bounded region between the two source curves. | `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-017 | gradient-image-from-array | visual parity improved: Text DSL has an `image` primitive that renders grayscale matrix data as pixel cells, and Python DSL exposes `ImageMobject` for array-to-image export. The gallery preserves the official 256x256 uint8 horizontal gradient by storing the exact 0..255 source row with `dataRows=256`, uses Manim's `ImageMobject(...).scale(2)` displayed size of about 256px square, collapses repeated rows into a smooth SVG horizontal gradient, and expands `SurroundingRectangle(image, color=GREEN)` by `SMALL_BUFF` to a 269.5px frame. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-018 | heat-diagram-plot | faithful port with low DSL caveat: explicit source `Axes(x_length=9, y_length=6)` is expanded at Manim frame scale (607.5x405 px), the asymmetric-range origin is preserved, `xNumbers` follows `np.arange(0, 40, 5)`, `get_axis_labels()` is represented by `axisLabels` with x/y-specific label size and axis-end offsets, and `dataLineGraph` maps data points to a Manim-style yellow line graph with default-size vertex dots. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-019 | moving-angle | faithful port via DSL helpers/value bindings: `Line(LEFT, RIGHT)` is expanded at Manim's 67.5px/unit frame scale, `Line.rotate(..., about_point=LEFT)` is represented by `rotatingLine`, and Angle/MathTex updaters are expanded to `value` + `always` bindings with the arc at `radius=0.5` and the label at the Manim `Angle(..., radius=0.5 + 3 * SMALL_BUFF).point_from_proportion(0.5)` radius. Explicit `start` times preserve the official wait, set-to-40, increment-by-140, 0.5s color change, and set-to-350 sequence. | `web/src/runtime/*`, `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-020 | moving-around | faithful port with low runtime caveat: the official default `Square(color=BLUE, fill_opacity=1)` is expanded to a 135px square at Manim's 67.5px/unit 16:9 frame scale, and `.animate.shift(LEFT)`, `.set_fill(ORANGE)`, `.scale(0.3)`, and `.rotate(0.4)` are represented by DSL-native `Animate(...)` target-state primitives. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-021 | moving-dots | faithful port with low DSL caveat: `VGroup(d1,d2).arrange(RIGHT,buff=1)` is expanded to Manim-frame pixel spacing, the initial updater-applied `d1.set_x(0)` state is preserved, `Dot.set_x` / `Dot.set_y` updaters are represented with `value` trackers and `always` bindings, and `Line(...).become(...)` connector updates are represented by `dynamicLine` endpoint bindings. The connector is white after the first updater frame because Manim `Mobject.become(Line(...))` copies the regenerated default `Line` style over the earlier `set_color(RED)`, keeps the official `self.add(d1,d2,l1)` z-order above the dots, and uses round caps/joins matching the DSL's VMobject-like curve helpers. The final default `self.wait()` hold is retained. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-022 | moving-group-to-destination | faithful port with low DSL caveat: `VGroup(Dot(LEFT), Dot(ORIGIN), Dot(RIGHT, color=RED), Dot(2 * RIGHT)).scale(1.4)` is expanded into Manim-frame pixel coordinates with scale-about-center spacing and scaled source dot radius 7.56px; the destination keeps the default Dot radius 5.4px and Manim `YELLOW`. The group shift target is represented by DSL-native `Animate(dots, shift=(189,-202.5))` so the red dot lands on `Dot([4, 3, 0], color=YELLOW)`, and the final `wait(0.5)` hold is retained. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-023 | moving-zoomed-scene-around | visual approximation improved: ZoomedScene sub-camera/display is hand-authored with official 2x4 grayscale image dimensions, Manim 16:9 frame-unit sizing for `image.height=7`, default `Dot()` radius 0.08, `zoomed_display_width=6`, `zoomed_display_height=1`, and `zoom_factor=0.3`, right-corner-plus-`DOWN` zoom display placement, transparent `BackgroundRectangle(..., fill_opacity=0, buff=MED_SMALL_BUFF)` that follows the display only during the `UpdateFromFunc` pop-out/reverse-pop-out plays, 1s default `self.play(...)` cadence, DSL-native `FadeIn(..., shift=UP)` text entrance motion, pop-out from the frame rectangle, a zoom crop that initially shows the single source pixel under `Dot().shift(UL*2)` plus the magnified dot, Transform-level `scaleX`/`scaleY` anisotropic scaling, display content retargeting to the lower single-pixel crop after frame shift, reverse pop-out collapse back into the shifted frame position and frame-sized display, official ending `Uncreate(zoomed_display_frame)` / `FadeOut(frame)` choreography, and the final default 1s `self.wait()` hold for a 12s total timeline. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-024 | point-with-trace | faithful port with low runtime caveat: dot motion is represented by DSL-native `Rotating(dot, PI, about=RIGHT)` plus `Animate(dot, shift=UP/LEFT)`, and `tracedPath target=dot sampling=frame` reconstructs the target motion history on seek using document-fps sample growth, closer to Manim's frame-by-frame `TracedPath` updater. The remaining caveat is exact updater lifecycle / point-array parity and browser path smoothing. | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-025 | polygon-on-axes | faithful port with low DSL caveat: official `Axes(x_length=6, y_length=6, include_tip=False)` is expanded to a 405x405px square axes, axes ticks are generated by `axes`, the `25/x` graph uses Manim `YELLOW_D`, `Create(polygon)` is the only initial animation, and the `always_redraw(Polygon(... ax.c2p ...))` rectangle plus moving dot are represented by `dataRect`/`dataDot` value bindings with the source `BLUE` fill, `YELLOW_B` stroke, and default Dot radius. | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-026 | rotation-updater | faithful port with low DSL caveat: official `Line(ORIGIN, LEFT)` is expanded to a 67.5px Manim-frame line with default stroke width, `line_moving.set_color(YELLOW)` uses the Manim `YELLOW` constant, and callback updater `rotate_about_origin(rate * dt)` is represented by the `rotateUpdater` helper, which expands rad/s `dt` accumulation into equivalent linear `rotation` animations. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-027 | three-d-camera-illusion-rotation | visual approximation improved: `Circle(radius=1)` is declared before `ThreeDAxes()` at the unshifted Manim scene origin to preserve the official `self.add(circle, axes)` z-order, then both are generated by the `projectedCircle` / `threeDAxes` helpers using Manim's default axis lengths (`x_length=10.5`, `y_length=10.5`, `z_length=6.5`) and `ThreeDCamera`-style `phi=75°, theta=30°` perspective projection. `begin_3dillusion_camera_rotation(rate=2)` is expanded into two projected coordinate keyframes matching Manim's `0.2*sin(t)` theta and `0.1*cos(t)-0.1` phi updater offsets over `wait(PI/2)`, including tick marks that move with the projected ThreeDAxes. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-028 | three-d-camera-rotation | visual approximation improved: `Circle(radius=1)` is declared before `ThreeDAxes()` at the unshifted Manim scene origin to preserve the official `self.add(circle, axes)` z-order, then both are generated by the `projectedCircle` / `threeDAxes` helpers using Manim's default axis lengths (`x_length=10.5`, `y_length=10.5`, `z_length=6.5`) and `ThreeDCamera`-style `phi=75°, theta=30°` perspective projection. The timeline matches Manim's tracker-based one-second ambient `rate=0.1` theta sweep, default one-second `move_camera(phi=75°, theta=30°)` ease-back, and final one-second hold. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-029 | three-d-light-source-position | visual approximation improved: `ThreeDAxes()` is represented by the `threeDAxes` helper at the unshifted Manim scene origin using the official default `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, default axis lengths, and `ThreeDCamera`-style `phi=75°, theta=30°` perspective projection. The official `Surface(..., checkerboard_colors=[RED_D, RED_E], resolution=(15,32))` sphere is represented after the axes to preserve `self.add(axes, sphere)` z-order, using the `sphereSurface` helper with shaded projected checkerboard faces plus the `Surface` default `LIGHT_GREY` 0.5-width face strokes. The sphere mesh keeps the official radius as `worldRadius=1.5`, projects mesh vertices through the same camera projection, and applies only Manim `get_shaded_rgb`-style face light/shadow from `light_source.move_to(3*IN)` rather than screen-space highlight overlays. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-030 | three-d-surface-plot | visual approximation improved: `ThreeDAxes()` is represented by `threeDAxes` at the unshifted Manim scene origin with visible tick marks and tips using Manim's official default `x_range=(-6,6,1)`, `y_range=(-5,5,1)`, `z_range=(-4,4,1)`, default axis lengths, and `ThreeDCamera`-style `phi=75°, theta=-30°` perspective projection. Gaussian checkerboard Surface is represented after the axes to preserve `self.add(axes, gauss_plane)` z-order, using a `gaussianSurface` Text DSL helper that expands the official `param_gauss` (`sigma=0.4`, `mu=[0,0]`), `resolution=(24,24)`, `scale(2)`, Surface default `stroke_width=0.5`, ORANGE/BLUE 0.5-opacity checkerboard styling, GREEN strokes, camera-projected mesh vertices, and height-based face shading into projected path faces. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-031 | vector-arrow | faithful port with low DSL caveat: `NumberPlane()` is represented as a static `self.add(...)` frame by the `numberPlane` helper at Manim's 16:9 frame scale, using the official full frame range, `BLUE_D` background lines, white axes, source-compatible omission of boundary grid lines, and `faded_line_ratio` / faded style semantics when requested. `Arrow(ORIGIN, [2, 2, 0], buff=0)` is represented by the Manim-like `arrow` helper with endpoint, default white styling, default 6px stroke width, default `tip_length=0.35` (23.625px), buff, and tip/stroke length ratio clamp; it is declared after the origin dot to preserve the official `self.add(numberplane, dot, arrow, origin_text, tip_text)` z-order. `Text(...).next_to(...)` labels use DSL-native `nextTo` with Manim `SMALL_BUFF`; fine axis style options such as label direction are still missing. | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |

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
