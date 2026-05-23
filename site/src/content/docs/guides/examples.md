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
| `examples/simple_circle.py` | `site/src/content/gallery/simple-circle.md` | `faithful` | `faithful` | Browserごとの差は最小限。 |
| `examples/basic_concepts_square_to_circle.py` | `site/src/content/gallery/square-to-circle.md` | `faithful` | `faithful` | Transform内部の補間は近似を含む。 |
| `examples/animations_using_animate.py` | `site/src/content/gallery/animations-using-animate.md` | `faithful` | `faithful` | easing既定値差分の可能性あり。 |
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
| simple-circle | ported | P0 | sample parity 完了（`examples/simple_circle.py` + `.fluxion.json`） | Gallery と examples の両方で再生でき、差分メモが許容範囲。 |
| square-to-circle | ported | P0 | **要サンプル生成**（`examples/square_to_circle.py/.fluxion.json` の命名で追加） | slug 対応の examples から再生成可能で、Create→Transform→FadeOut が一致。 |
| animations-using-animate | ported | P0 | sample parity 完了（`examples/animations_using_animate.py` + `.fluxion.json`） | `.animate` 連鎖（shift/fill/scale/rotate）が再現される。 |
| plotting-sin-cos | ported | P0 | **要サンプル生成**（`examples/plotting_sin_cos.py/.fluxion.json`） | 軸+sin/cos プロットが slug 対応 sample から再現可能。 |
| special-camera | ported | P0 | **要サンプル生成**（`examples/special_camera.py/.fluxion.json`）; camera runtime parity | カメラ追従/ズームが slug 対応 sample で再生可能。 |
| moving-frame-box | ported | P1 | **要サンプル生成**; SurroundingRectangle/MathTex part bounds の安定化 | フレーム追従と注釈矩形の見た目差分が許容範囲。 |
| transform-matching-tex | ported | P1 | **要サンプル生成**; tex token matching runtime | 文字列分割の対応付けが破綻せずに再生できる。 |
| brace-annotation | ported | P1 | **要サンプル生成**; brace primitive + label anchoring | brace とラベル位置が主要ブラウザで安定。 |
| opening-manim | ported | P1 | **要サンプル生成**; text + shape choreography | 主要シーケンスが drop なしで完走。 |
| orbital-dot | ported | P1 | **要サンプル生成**; path-follow + rate function parity | 軌道追従点が同等速度感で再現。 |
| sine-curve-unit-circle | partial | P1 | **要サンプル生成**; synchronized updater + tracing | partial 要因（同期/トレース欠損）が解消し ported 化。 |
| moving-around | blocker | P1 | **要サンプル生成**; composite animate pipeline | blocker 解消後に `.animate` の複合変換を連続再生可能。 |
| moving-angle | blocker | P1 | **要サンプル生成**; dynamic angle/arc updater | 角度更新とラベル同期が破綻しない。 |
| polygon-on-axes | blocker | P1 | **要サンプル生成**; axes coordinate transform parity | 座標変換と polygon 配置が一致。 |
| point-with-trace | blocker | P1 | **要サンプル生成**; traced path primitive | 軌跡線が欠損なく描画・更新される。 |
| moving-group-to-destination | blocker | P1 | **要サンプル生成**; group transform origin handling | group 全体の移動/整列が意図どおり。 |
| arg-min-example | blocker | P2 | **要サンプル生成**; graph query helper（argmin） | argmin ハイライトの導出と注釈が再現。 |
| boolean-operations | blocker | P2 | **要サンプル生成**; boolean path ops（union/intersection/subtract） | 図形ブーリアン演算結果が正しくレンダリング。 |
| gradient-image-from-array | blocker | P2 | **要サンプル生成**; image-from-array runtime | 配列由来 gradient が色ずれなく表示。 |
| graph-area-plot | blocker | P2 | **要サンプル生成**; area-under-curve fill primitive | 曲線下面積の塗りが正しく更新。 |
| heat-diagram-plot | blocker | P2 | **要サンプル生成**; heatmap grid + colormap | ヒートマップのセル色マッピングが正しい。 |
| fixed-in-frame-m-object-test | blocker | P2 | **要サンプル生成**; fixed-in-frame layer support | カメラ変化中でも固定オブジェクト位置が不変。 |
| moving-dots | blocker | P2 | **要サンプル生成**; multi-object updater performance | 複数dot更新でフレーム落ち・位置ズレなし。 |
| rotation-updater | blocker | P2 | **要サンプル生成**; continuous updater dt parity | 連続回転 updater が時間依存で安定。 |
| vector-arrow | blocker | P2 | **要サンプル生成**; vector field/arrow tip geometry | 矢印向きと tip 形状が正しく追従。 |
| manim-ce-logo | ported | P2 | **要サンプル生成**; complex path composition | ロゴ形状合成が主要ブラウザで一致。 |
| three-d-camera-rotation | blocker | P2 | **要サンプル生成**; 3D camera orbit controls | 3D 回転カメラで破綻なく再生。 |
| three-d-camera-illusion-rotation | blocker | P2 | **要サンプル生成**; faux-3D transform stack | 疑似3D回転の遠近感が維持される。 |
| three-d-light-source-position | blocker | P2 | **要サンプル生成**; light source/shading runtime | 光源位置変化がシェーディングに反映。 |
| three-d-surface-plot | blocker | P2 | **要サンプル生成**; surface mesh primitive | surface が穴抜けなく描画される。 |
| moving-zoomed-scene-around | blocker | P2 | **要サンプル生成**; zoomed scene inset camera support | inset とメイン視点の同期が成立。 |

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
