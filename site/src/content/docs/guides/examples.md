---
title: Examples
description: Repository examples and recommended paths for trying Fluxion authoring flows.
---

Examples connect the authoring docs to concrete files in the repository.

## Python example

`examples/simple_circle.py` builds a small scene with Python DSL and exports `examples/simple_circle.fluxion.json`.

```bash
PYTHONPATH=python python examples/simple_circle.py
```

Use it when you want to verify the Python DSL → Fluxion JSON → Web Runtime path.

## Basic Concepts demo (Square to Circle)

`examples/basic_concepts_square_to_circle.py` reproduces the Manim Basic Concepts style flow (`Create` → `Transform` → `FadeOut`) and exports `examples/basic_concepts_square_to_circle.fluxion.json`.

```bash
PYTHONPATH=python python examples/basic_concepts_square_to_circle.py
```

## Animations demo (Using `.animate`)

`examples/animations_using_animate.py` reproduces the Manim Animations-style `MovingAround` flow (shift → fill change → scale → rotate) and exports `examples/animations_using_animate.fluxion.json`.

```bash
PYTHONPATH=python python examples/animations_using_animate.py
```

## Plotting demo (Sin/Cos)

`examples/plotting_with_manim.py` reproduces the Manim Plotting-style flow by drawing axes and function curves (`sin(x)`, `cos(x)`) and exports `examples/plotting_with_manim.fluxion.json`.

```bash
PYTHONPATH=python python examples/plotting_with_manim.py
```

## Special Camera Settings demo

`examples/special_camera_settings.py` reproduces the Manim Special Camera Settings style flow by animating camera position/scale changes around scene content and exports `examples/special_camera_settings.fluxion.json`.

```bash
PYTHONPATH=python python examples/special_camera_settings.py
```


## Python example ↔ Text DSL gallery mapping

移植比較は次の読み方で統一します。

- `fidelity: faithful`（忠実移植）: Manim の流れ・意図をできるだけ保持。
- `fidelity: visual_approximation`（視覚近似）: 見た目を優先し、内部実装や挙動の一部は近似。


### known_gaps 記述規約

`site/src/content/gallery/*.md` の frontmatter `known_gaps` は、次のテンプレートで統一します。

```yaml
known_gaps:
  - symptom: "症状（何が違うか）"
    layer: dsl # dsl / compiler / runtime / renderer
    impact: medium # low / medium / high
    workaround: "回避策（ある場合。なければ『なし』）"
    closure_condition: "解消条件（どこが直れば閉じられるか）"
    fidelity_upgrade_condition: "fidelity を faithful へ昇格できる条件"
```

補足:
- `known_gaps` は **項目ごと**に独立して管理し、複数ギャップがある場合は配列で追加します。
- `fidelity_upgrade_condition` は `closure_condition` と同一でも構いませんが、**昇格判定として読める文**で明記します。
- `fidelity: faithful` の項目でも、残差分があれば `known_gaps` を残して追跡します。

| Python example / source | Gallery demo | Porting strategy | Fidelity | Notes |
| --- | --- | --- | --- | --- |
| `examples/simple_circle.py` | `site/src/content/gallery/simple-circle.md` | `visual_approximation` | `visual_approximation` | 主題の Circle 作成を保ちつつ、ギャラリー表示用の背景・半径ガイドを追加。 |
| `examples/basic_concepts_square_to_circle.py` | `site/src/content/gallery/square-to-circle.md` | `visual_approximation` | `visual_approximation` | Transform内部の補間は近似を含み、ギャラリー表示用の変換前後ガイドを追加。 |
| `examples/animations_using_animate.py` | `site/src/content/gallery/animations-using-animate.md` | `visual_approximation` | `visual_approximation` | `.animate` の主題を保ちつつ、モーションパスと property label を追加。 |
| `examples/plotting_with_manim.py` | `site/src/content/gallery/plotting-sin-cos.md` | `visual_approximation` | `visual_approximation` | 軸スケールとサンプリングを簡略化。 |
| `examples/special_camera_settings.py` | `site/src/content/gallery/special-camera.md` | `visual_approximation` | `visual_approximation` | カメラモデルは現行実装で近似。 |
| Manim `MovingFrameBox` | `site/src/content/gallery/moving-frame-box.md` | `visual_approximation` | `visual_approximation` | `SurroundingRectangle` は `surroundingRect` で表現。MathTex parts は宣言 bounds による近似。 |

## 移植ロードマップ

優先度ルール:

- **P0**: 入門導線・主要API（Getting Started/Python DSL/Plotting/Camera で参照する導線）。
- **P1**: 中級表現（合成アニメーション、図形注釈、座標系ベースの派生表現）。
- **P2**: 特殊表現（3D、高度な updater、画像配列、ブーリアン演算など）。

`source_example_path` がある項目を優先して整備し、`examples/*.py` / `*.fluxion.json` が揃っていないものは dependency に **要サンプル生成** と明記します。

| demo slug | current status | priority | dependency | exit criteria |
| --- | --- | --- | --- | --- |
| simple-circle | ported | P0 | sample parity 完了（`examples/simple_circle.py` + `.fluxion.json`）; gallery view は装飾追加 | Circle 作成の主題を維持しつつ、ギャラリー表示で見やすい半径ガイドまで再生できる。 |
| square-to-circle | ported | P0 | sample parity 完了（`examples/basic_concepts_square_to_circle.py` + `.fluxion.json`）; gallery view は装飾追加 | Create→Transform→FadeOut の主題を維持し、変換前後ガイド込みで再生できる。 |
| animations-using-animate | ported | P0 | sample parity 完了（`examples/animations_using_animate.py` + `.fluxion.json`）; gallery view は装飾追加 | `.animate` 連鎖（move/fill/scale/rotate）が視覚ガイド付きで再現される。 |
| plotting-sin-cos | ported | P0 | sample parity 完了（`examples/plotting_with_manim.py` + `.fluxion.json`）; gallery view は装飾追加 | 軸+sin/cos プロットが grid/tick label 付きで再生可能。 |
| special-camera | ported | P0 | sample parity 完了（`examples/special_camera_settings.py` + `.fluxion.json`）; camera runtime parity | カメラ追従/ズームが frame guide 付きで再生可能。 |
| moving-frame-box | ported | P1 | Text DSL sample 完了（`examples/gallery/moving_frame_box.fluxion.txt`）; SurroundingRectangle/MathTex part bounds の安定化 | フレーム追従と注釈矩形の見た目差分が許容範囲。 |
| transform-matching-tex | ported | P1 | Text DSL sample 完了（`examples/gallery/transform_matching_tex.fluxion.txt`）; tex token matching runtime | 文字列分割の対応付けが破綻せずに再生できる。 |
| brace-annotation | ported | P1 | Text DSL sample 完了（`examples/gallery/brace_annotation.fluxion.txt`）; brace primitive + label anchoring | brace とラベル位置が主要ブラウザで安定。 |
| opening-manim | ported | P1 | Text DSL sample 完了（`examples/gallery/opening_manim.fluxion.txt`）; text + grid choreography | LaTeX → transform → grid → non-linear grid の主要シーケンスが drop なしで完走。 |
| orbital-dot | ported | P1 | Text DSL sample 完了（`examples/gallery/orbital_dot.fluxion.txt`）; path-follow + rate function parity | 軌道追従点が同等速度感で再現。 |
| sine-curve-unit-circle | partial | P1 | Text DSL sample 完了（`examples/gallery/sine-curve-unit-circle.fluxion.txt`）; synchronized updater + tracing | unit circle と sine trace が同期し、専用 tracing parity 実装後に fidelity を上げる。 |
| moving-around | partial | P1 | Text DSL sample 完了（`examples/gallery/moving-around.fluxion.txt`）; camera frame high-level DSL の追加 | camera frame guide と target movement で視覚近似し、frame API sugar 実装後に fidelity を上げる。 |
| moving-angle | partial | P1 | Text DSL sample 完了（`examples/gallery/moving-angle.fluxion.txt`）; Angle primitive（半径/象限/装飾）DSL の追加 | Angle helper と tracker で弧とラベルを視覚近似し、Angle API parity 実装後に fidelity を上げる。 |
| polygon-on-axes | partial | P1 | Text DSL sample 完了（`examples/gallery/polygon-on-axes.fluxion.txt`）; axes data座標 helper（coords_to_point 相当）の追加 | dataPolygon helper で配置し、汎用 coords_to_point 実装後に fidelity を上げる。 |
| point-with-trace | partial | P1 | Text DSL sample 完了（`examples/gallery/point-with-trace.fluxion.txt`）; TracedPath primitive DSL/runtime の追加 | tracedPath helper で視覚近似し、履歴追跡 parity 実装後に fidelity を上げる。 |
| moving-group-to-destination | ported | P1 | sample parity 完了（group transform animate） | `animate dots.x/y` で group 単位移動が再現される。 |
| arg-min-example | partial | P2 | Text DSL sample 完了（`examples/gallery/arg-min-example.fluxion.txt`）; graph query helper（argmin） | 手描き曲線と注釈で argmin/argmax を視覚近似し、query helper 実装後に fidelity を上げる。 |
| boolean-operations | partial | P2 | Text DSL sample 完了（`examples/gallery/boolean-operations.fluxion.txt`）; boolean path ops（union/intersection/subtract） | レイヤー表現で概念を視覚近似し、path boolean 実装後に fidelity を上げる。 |
| gradient-image-from-array | partial | P2 | Text DSL sample 完了（`examples/gallery/gradient-image-from-array.fluxion.txt`）; image-from-array runtime | colored cell grid と拡大表示で視覚近似し、image array primitive 実装後に fidelity を上げる。 |
| graph-area-plot | partial | P2 | Text DSL sample 完了（`examples/gallery/graph-area-plot.fluxion.txt`）; area-under-curve fill primitive | closed path fill と境界線で面積を視覚近似し、専用 area primitive 実装後に fidelity を上げる。 |
| heat-diagram-plot | partial | P2 | Text DSL sample 完了（`examples/gallery/heat-diagram-plot.fluxion.txt`）; heatmap grid + colormap | stepped colormap のセルグリッドで heatmap を視覚近似し、連続 colormap 実装後に fidelity を上げる。 |
| fixed-in-frame-m-object-test | partial | P2 | Text DSL sample 完了（`examples/gallery/fixed-in-frame-m-object-test.fluxion.txt`）; fixed-in-frame layer support | HUD 風レイヤーで視覚近似し、camera 分離レンダリング実装後に fidelity を上げる。 |
| moving-dots | partial | P2 | Text DSL sample 完了（`examples/gallery/moving-dots.fluxion.txt`）; multi-object updater performance | 位相差付き tracker で複数 dot 更新を視覚近似し、updater parity 実装後に fidelity を上げる。 |
| rotation-updater | partial | P2 | Text DSL sample 完了（`examples/gallery/rotation-updater.fluxion.txt`）; continuous updater dt parity | value/always で回転 updater を視覚近似し、dt updater 実装後に fidelity を上げる。 |
| vector-arrow | partial | P2 | Text DSL sample 完了（`examples/gallery/vector-arrow.fluxion.txt`）; vector field/arrow tip geometry | arrow helper と成分補助線で視覚近似し、tip geometry parity 実装後に fidelity を上げる。 |
| manim-ce-logo | ported | P2 | Text DSL sample 完了（`examples/gallery/manim_ce_logo.fluxion.txt`）; complex path composition | ロゴ形状合成が主要ブラウザで一致。 |
| three-d-camera-rotation | partial | P2 | Text DSL sample 完了（`examples/gallery/three-d-camera-rotation.fluxion.txt`）; 3D camera orbit controls | 2D投影 + cameraFrame sweep で視覚近似し、3D camera runtime 実装後に fidelity を上げる。 |
| three-d-camera-illusion-rotation | partial | P2 | Text DSL sample 完了（`examples/gallery/three-d-camera-illusion-rotation.fluxion.txt`）; faux-3D transform stack | projected ring と camera swing で視覚近似し、3D transform stack 実装後に fidelity を上げる。 |
| three-d-light-source-position | partial | P2 | Text DSL sample 完了（`examples/gallery/three-d-light-source-position.fluxion.txt`）; light source/shading runtime | 2D疑似球体・ハイライト・光線で光源移動を視覚近似し、3D runtime 実装後に fidelity を上げる。 |
| three-d-surface-plot | partial | P2 | Text DSL sample 完了（`examples/gallery/three-d-surface-plot.fluxion.txt`）; surface mesh primitive | 投影済み checkerboard patch で Gaussian surface を視覚近似し、surface mesh 実装後に fidelity を上げる。 |
| moving-zoomed-scene-around | partial | P2 | Text DSL sample 完了（`examples/gallery/moving-zoomed-scene-around.fluxion.txt`）; zoomed scene inset camera support | inset panel と link line で視覚近似し、独立 inset camera 実装後に fidelity を上げる。 |

## Browser example

The Playground includes a Text DSL editor. Paste snippets from [Text DSL reference](../../reference/text-dsl/) or [Playground tour](../playground/) and compile them directly in the browser.

## Suggested learning order

1. Run [Getting Started](../getting-started/) to generate and preview the sample IR.
2. Modify `examples/simple_circle.py` with the [Python DSL](../python-dsl/) concepts.
3. Recreate a similar animation in [Text DSL reference](../../reference/text-dsl/).
4. Compare both outputs with [Fluxion JSON / Scene Graph](../../reference/ir/) and [Timeline](../../reference/timeline/).

## Manim coverage matrix（移植率）

See the live matrix in [Gallery](/gallery/) (English page: [/en/gallery/](/en/gallery/)).

Status meanings:
- `ported`: runnable in Fluxion DSL (差分メモは残る場合があります).
- `partial`: partially ported; known gaps are larger or unresolved.
- `blocker`: blocked by missing primitives/runtime capability.

## Gallery Porting DoD（最低条件 / Review Checklist）

レビュー時は、各 gallery エントリが以下を満たすことを **Definition of Done (DoD)** とします。

- [ ] frontmatter 必須項目が埋まっている:
  - `title`
  - `source_manim_url`
  - `status`
  - `fidelity`
  - `known_gaps`
- [ ] Play でクラッシュしない（`GalleryPage.astro` 上で初期化可能）。
- [ ] `known_gaps` が本ページの「known_gaps 記述規約」に沿っている。
- [ ] 対応する source example（`source_example_path`）が存在する。
  - [ ] もし未作成なら、理由が frontmatter かレビュー記録に明記されている。

### status 遷移ルール（blocker → partial → ported）

- `blocker`:
  - 必須 primitive / runtime capability が欠け、シーン再生成立が阻害される状態。
  - `known_gaps` には「何が不足して再生不能か」を明記する。
- `partial`:
  - 再生は可能だが、挙動差分や欠落機能が残る状態。
  - `known_gaps` に症状・影響・回避策・解消条件を明記する。
- `ported`:
  - Play 上で安定再生でき、主要シーケンスが意図どおり完走する状態。
  - 残差分がある場合も `known_gaps` で追跡可能（空にする必要はない）。

遷移判定:
- `blocker` → `partial`: クラッシュ/再生不能の主因が解消し、最低限の再生が可能になった時点。
- `partial` → `ported`: DoD 最低条件をすべて満たし、主要シーケンス差分が許容範囲に収まった時点。
- `ported` からの降格: 回帰で Play 初期化不能・主要シーケンス破綻・必須項目欠落が出た場合は `partial` もしくは `blocker` に戻す。
