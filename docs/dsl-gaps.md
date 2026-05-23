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
| GAP-002 | opening-manim | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-003 | simple-circle | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-004 | plotting-sin-cos | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-005 | square-to-circle | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `web/src/runtime/*` |
| GAP-006 | transform-matching-tex | parity確認のみ（追加ギャップ未特定） | `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-007 | orbital-dot | parity確認のみ（追加ギャップ未特定） | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-008 | moving-frame-box | parity確認のみ（追加ギャップ未特定） | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-009 | manim-ce-logo | parity確認のみ（追加ギャップ未特定） | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-010 | brace-annotation | parity確認のみ（追加ギャップ未特定） | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-011 | sine-curve-unit-circle | parity確認のみ（追加ギャップ未特定） | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-012 | special-camera | parity確認のみ（追加ギャップ未特定） | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-013 | arg-min-example | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-014 | boolean-operations | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-015 | fixed-in-frame-m-object-test | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-016 | graph-area-plot | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-017 | gradient-image-from-array | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-018 | heat-diagram-plot | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-019 | moving-angle | `Angle` 専用 primitive が未実装で、path/updater による近似実装に留まる。 | `web/src/runtime/*`, `web/src/dsl/compiler.ts`, `python/fluxion/primitives/*` |
| GAP-020 | moving-around | camera frame 向け高水準 DSL が未実装で、camera transform の直接 animate で近似している。 | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-021 | moving-dots | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-022 | moving-group-to-destination | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-023 | moving-zoomed-scene-around | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-024 | point-with-trace | `TracedPath` 専用 primitive が未実装で、`always ... = path(...)` による近似で対応している。 | `web/src/dsl/compiler.ts`, `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-025 | polygon-on-axes | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/dsl/compiler.ts` |
| GAP-026 | rotation-updater | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-027 | three-d-camera-illusion-rotation | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-028 | three-d-camera-rotation | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `web/src/dsl/compiler.ts` |
| GAP-029 | three-d-light-source-position | Required primitives/effects are not fully mapped yet. | `web/src/runtime/*`, `python/fluxion/primitives/*` |
| GAP-030 | three-d-surface-plot | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/runtime/*` |
| GAP-031 | vector-arrow | Required primitives/effects are not fully mapped yet. | `python/fluxion/primitives/*`, `web/src/runtime/*` |

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
