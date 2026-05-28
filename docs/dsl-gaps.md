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
| GAP-001 | animations-using-animate | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-002 | opening-manim | visual approximation improved: timings now follow the official `wait()`, `Create(grid, run_time=3, lag_ratio=0.1)`, and nonlinear transform `run_time=3` cadence more closely; Tex titles now keep default white styling and `Transform` materializes target text/LaTeX content at the animation end. | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-003 | simple-circle | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-004 | plotting-sin-cos | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-005 | square-to-circle | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-006 | transform-matching-tex | visual approximation improved: scene is reduced to the official white MathTex-only `MatchingEquationParts` choreography, hidden target tokens are materialized for chained transforms, and the hidden `variables` group moves down into `eq2` during the first transform. | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-007 | orbital-dot | parity確認のみ（追加ギャップ未特定） | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-008 | moving-frame-box | parity確認のみ（追加ギャップ未特定） | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-009 | manim-ce-logo | parity確認のみ（追加ギャップ未特定） | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-010 | brace-annotation | visual approximation improved: line bounds are normalized, `direction=perpendicular` renders a filled brace ribbon along diagonal line targets, and labels are placed near brace tips closer to Manim's `get_text` / `get_tex`; fine curl details remain approximated. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-011 | sine-curve-unit-circle | visual parity ported: updater-built sine curve history is represented with `tracedPath` plus synchronized value bindings. | `web/src/runtime/*`, `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-012 | special-camera | visual approximation improved: FollowingGraphCamera now keeps the official default 1s `MoveAlongPath(..., rate_func=linear)` cadence and follows it with 36 linear `animateFrame` samples at zoom scale 2. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-013 | arg-min-example | visual parity ported: `ax.c2p` and dot updater are represented with fixed-scale value bindings matching the source motion. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-014 | boolean-operations | visual approximation improved: hand-authored boolean SVG paths now split fill and stroke so Manim's `fill_opacity=0.5` keeps stronger outlines while preserving the official one-play-per-operation scale/move choreography; true path boolean primitives are still missing. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-015 | fixed-in-frame-m-object-test | visual parity ported: ThreeDAxes projection and fixed-in-frame text are hand-authored until 3D camera/fixed layers exist. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-016 | graph-area-plot | visual parity ported: `get_riemann_rectangles` and bounded `get_area` are represented with manual rect/path geometry matching the source figure. | `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-017 | gradient-image-from-array | visual parity ported: native ImageMobject/array input is still missing, but the gallery reproduces the grayscale image with an SVG linear gradient. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-018 | heat-diagram-plot | visual parity ported: line graph is hand-positioned because axes helper origin/tick placement for asymmetric ranges is incomplete. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-019 | moving-angle | visual parity ported: `Line.rotate(..., about_point=LEFT)` and Angle/MathTex updaters are expanded to `value` + `always` bindings. | `web/src/runtime/*`, `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-020 | moving-around | visual parity ported: `.animate` target-copy syntax is expanded manually to equivalent property interpolation. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-021 | moving-dots | visual parity ported: updater API is represented with `value` trackers and `always` bindings for dot/line coordinates. | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-022 | moving-group-to-destination | visual parity ported: the VGroup shift is expanded to equivalent group x/y interpolation so the red dot aligns with the yellow destination. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-023 | moving-zoomed-scene-around | visual approximation improved: ZoomedScene sub-camera/display is hand-authored with official 2x4 grayscale image dimensions, upper-right shifted zoom display placement, anisotropic display cell scaling, display content retargeting after frame shift, and reverse pop-out fade. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-024 | point-with-trace | visual parity ported: VMobject updater history is expanded to a piecewise `tracedPath` expression synced with the dot motion. | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-025 | polygon-on-axes | visual parity ported: rectangle/dot are driven by `value` + `always` bindings matching the source `always_redraw(Polygon(...))` motion. | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-026 | rotation-updater | visual parity ported: callback updater with `dt` is expanded to equivalent linear `rotation` animations. | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-027 | three-d-camera-illusion-rotation | visual approximation improved: the official `begin_3dillusion_camera_rotation(rate=2)` updater is expanded into two projected coordinate keyframes matching its theta sine and phi cosine offsets over `wait(PI/2)`. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-028 | three-d-camera-rotation | visual approximation improved: ambient camera rotation now expands the official `rate=0.1` one-second theta sweep into projected line/path coordinate interpolation, then eases back for `move_camera`. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-029 | three-d-light-source-position | visual approximation improved: ThreeDAxes now shares the same `phi=75°, theta=30°` projection used by the 3D camera examples, and the RED_D/RED_E checkerboard sphere is centered on the projected axes origin with denser alternating patches and stronger `3*IN` light cues. | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-030 | three-d-surface-plot | visual approximation improved: Gaussian checkerboard Surface now uses official ORANGE/BLUE 0.5-opacity faces with GREEN strokes, a taller central peak, and additional mid-cell mesh lines to suggest the source `resolution=(24,24)`. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-031 | vector-arrow | `arrow` helper は追加済み。Manim Arrow の buff/tip shape 全オプションは未実装。 | `python/fluxion/primitives/*`, `web/src/runtime/*`, `web/src/dsl/compiler.ts` |

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
