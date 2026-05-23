# Fluxion docs

Canonical documentation lives under [`site/src/content/docs/`](../site/src/content/docs/) and is published by the GitHub Pages build.

Root `docs/` is intentionally kept as a pointer only so Fluxion has a single documentation source of truth. Please update the matching file under `site/src/content/docs/` instead of adding long-form mirrors here.

Useful entry points:

- [Overview](../site/src/content/docs/overview.md)
- [Getting Started](../site/src/content/docs/guides/getting-started.md)
- [Architecture](../site/src/content/docs/concepts/architecture.md)
- [MVP Scope](../site/src/content/docs/concepts/mvp.md)
- [Text DSL reference](../site/src/content/docs/reference/text-dsl.md)
- [Web Runtime reference](../site/src/content/docs/reference/runtime.md)

## Gallery Porting DoD（最低条件 / Review Checklist）

`site/src/content/gallery/*.md` のレビューでは、以下を最低条件（DoD）としてチェックしてください。

- [ ] frontmatter 必須項目が埋まっている（`title`, `source_manim_url`, `status`, `fidelity`, `known_gaps`）。
- [ ] Play でクラッシュしない（`GalleryPage.astro` 上で初期化可能）。
- [ ] `known_gaps` が規約形式で記述されている（テンプレート準拠）。
- [ ] 対応する source example（`source_example_path`）が存在する。
  - [ ] 未作成の場合は、未作成理由が明記されている。

status 遷移ルール（`blocker` → `partial` → `ported`）:
- `blocker`: 欠落 capability により再生成立を阻害。
- `partial`: 再生は可能だが差分や未解消ギャップあり。
- `ported`: Play で安定再生でき、主要シーケンスが完走。

判定運用:
- `blocker` → `partial`: 再生不能の主因が解消し、最低限再生可能になったら昇格。
- `partial` → `ported`: DoD 最低条件を満たし、主要差分が許容範囲になったら昇格。
- 回帰時は `ported` から `partial` / `blocker` へ降格する。
