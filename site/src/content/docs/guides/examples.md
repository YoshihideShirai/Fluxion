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
| `examples/gallery/simple-circle.fluxion.txt` | `site/src/content/gallery/simple-circle.md` | `faithful` | `faithful` | 公式 quickstart の `Circle().set_fill(PINK, opacity=0.5)` と `Create(circle)` を Manim frame scale で表現し、`set_fill(..., opacity=0.5)` は `fillOpacity` として保持。 |
| `examples/gallery/square-to-circle.fluxion.txt` | `site/src/content/gallery/square-to-circle.md` | `faithful` | `faithful` | 公式 quickstart の `Square().rotate(PI / 4)` と `Circle().set_fill(PINK, opacity=0.5)` を同構造 path に展開し、Create → path morph Transform → FadeOut を再現。 |
| `examples/gallery/animations-using-animate.fluxion.txt` | `site/src/content/gallery/animations-using-animate.md` | `faithful` | `faithful` | 公式 `MovingAround` の `.animate.shift(LEFT)` / `.set_fill(ORANGE)` / `.scale(0.3)` / `.rotate(0.4)` sequence を Manim frame scale で保持。 |
| `examples/gallery/plotting-sin-cos.fluxion.txt` | `site/src/content/gallery/plotting-sin-cos.md` | `faithful` | `faithful` | `Axes(..., x_length=10)` と既定 `y_length=6` を 675x405px に展開し、`axes.plot(...)`、`get_vertical_line(...)`、graph labels を Text DSL helper で表現。 |
| `examples/gallery/special-camera.fluxion.txt` | `site/src/content/gallery/special-camera.md` | `faithful` | `faithful` | `Axes(...).plot(...)` は Manim 既定 axis 長・Dot 半径を frame scale で `axes`/`plot` に展開し、MovingCameraScene の不可視 frame updater は `followCamera` と restore camera operation で同じ可視挙動にする。 |
| Manim `MovingFrameBox` | `site/src/content/gallery/moving-frame-box.md` | `faithful` | `faithful` | `SurroundingRectangle` は `surroundingRect` で表現し、`ReplacementTransform(framebox1, framebox2)` は frame の morph 後に target へ置換。 |

## 移植ロードマップ

優先度ルール:

- **P0**: 入門導線・主要API（Getting Started/Python DSL/Plotting/Camera で参照する導線）。
- **P1**: 中級表現（合成アニメーション、図形注釈、座標系ベースの派生表現）。
- **P2**: 特殊表現（3D、高度な updater、画像配列、ブーリアン演算など）。

Gallery の `source_example_path` は `examples/gallery/*.fluxion.txt` を正とし、ページ本文と同期させます。Python DSL / JSON export サンプルは別途導線として維持します。

| demo slug | current status | priority | dependency | exit criteria |
| --- | --- | --- | --- | --- |
| simple-circle | ported | P0 | Text DSL sample 完了（`examples/gallery/simple-circle.fluxion.txt`）; `Create` drawProgress parity | 公式 quickstart の pink fill / white stroke circle の輪郭描画と半透明 fill が維持される。 |
| square-to-circle | ported | P0 | Text DSL sample 完了（`examples/gallery/square-to-circle.fluxion.txt`）; path morph parity | 公式 quickstart の 45度回転 default square と default circle を Manim frame scale で展開し、Create→Transform→FadeOut の主題を path morph として再生できる。 |
| animations-using-animate | ported | P0 | Text DSL sample 完了（`examples/gallery/animations-using-animate.fluxion.txt`） | `.animate` 連鎖（shift/fill/scale/rotate）が公式 `MovingAround` と同じ frame scale・色・順序で再現される。 |
| plotting-sin-cos | ported | P0 | Text DSL sample 完了（`examples/gallery/plotting-sin-cos.fluxion.txt`）; `axes` + `plot` + `dataLine` | 公式 `Axes(..., x_length=10)` と既定 `y_length=6` を 675x405px に展開し、sin/cos plot、`x=2π` vertical marker、graph labels を helper 生成 geometry で再現する。 |
| special-camera | ported | P0 | Text DSL sample 完了（`examples/gallery/special-camera.fluxion.txt`）; camera frame follow parity | 公式 `Axes(x_range=[-1,10], y_range=[-1,10])` の既定 12x6 unit と Dot 半径を Manim frame scale に展開し、`MoveAlongPath` は sine graph の累積弧長で moving dot を動かし、`followCamera` がその dot を追従して最後に保存 frame へ復帰する。 |
| moving-frame-box | ported | P1 | Text DSL sample 完了（`examples/gallery/moving_frame_box.fluxion.txt`）; SurroundingRectangle/MathTex part bounds の安定化 | `Write(text)` の2s linear + overlapped lag cadence と `SurroundingRectangle(..., buff=.1)` の frame morph を再現する。 |
| transform-matching-tex | ported | P1 | Text DSL sample 完了（`examples/gallery/transform_matching_tex.fluxion.txt`）; tex token matching runtime | 公式 `MatchingEquationParts` の `variables.shift(UP)` と `TransformMatchingTex(Group(eq1, variables), eq2)` を Manim frame scale で再現する。 |
| brace-annotation | ported | P1 | Text DSL sample 完了（`examples/gallery/brace_annotation.fluxion.txt`）; Manim Brace SVG template + primitive `get_text`/`get_tex` label anchoring | 公式 `Dot([-2,-1,0])` / `Dot([2,1,0])`、default Dot 半径、`Brace(..., buff=0.2, sharpness=2)` を Manim frame scale で展開する。 |
| opening-manim | ported | P1 | Text DSL sample 完了（`examples/gallery/opening_manim.fluxion.txt`）; text + grid choreography | `NumberPlane()` を Manim frame scale の全面 1-unit grid に展開し、`p + [sin(p[1]), sin(p[0]), 0]` をサンプリングした non-linear grid へ変形する。 |
| orbital-dot | ported | P1 | Text DSL sample 完了（`examples/gallery/orbital_dot.fluxion.txt`）; path-follow + rate function parity | 公式 `Circle(radius=1)`、`GrowFromCenter` の full-opacity zero-scale start、`Line([3,0,0],[5,0,0])`、`MoveAlongPath(..., rate_func=linear)`、`Rotating(... about_point=[2,0,0])`、最後の `wait()` を 67.5px/unit の値バインドへ展開する。 |
| sine-curve-unit-circle | ported | P1 | Text DSL sample 完了（`examples/gallery/sine-curve-unit-circle.fluxion.txt`）; synchronized updater + tracing | 公式の x/y 軸、origin `[-4,0]`、unit circle、既定 `MathTex` label size、`YELLOW` / `YELLOW_A` / `YELLOW_D`、`t_offset += dt * 0.25` を Manim frame scale と同じ trackerで同期する。 |
| moving-around | ported | P1 | Text DSL sample 完了（`examples/gallery/moving-around.fluxion.txt`）; manual target-copy expansion | default `Square()` と `shift(LEFT)` を Manim frame scale で展開し、`.animate` target-copy syntax を同等の property interpolation にして再現する。 |
| moving-angle | ported | P1 | Text DSL sample 完了（`examples/gallery/moving-angle.fluxion.txt`）; `rotatingLine` + Angle path binding | `Line(LEFT, RIGHT)` / `Angle(..., radius=0.5)` / `Angle(..., radius=0.5 + 3 * SMALL_BUFF).point_from_proportion(0.5)` を 67.5px/unit で展開し、主要 updater 挙動を value binding で再現する。 |
| polygon-on-axes | ported | P1 | Text DSL sample 完了（`examples/gallery/polygon-on-axes.fluxion.txt`）; `axes` + `plot` + `dataRect`/`dataDot` | 公式 `Axes(x_length=6, y_length=6)`、`Create(polygon)`、`YELLOW_D` graph、`BLUE`/`YELLOW_B` rectangle、`ax.c2p` ベースの rectangle/dot updater を data 座標 helper から生成する。 |
| point-with-trace | ported | P1 | Text DSL sample 完了（`examples/gallery/point-with-trace.fluxion.txt`）; single piecewise `tracedPath` | `Rotating(... about_point=RIGHT, run_time=2)` の linear 半回転、待機、上移動、左移動、最終待機の dot 履歴を Manim frame scale の trace path として再現する。 |
| moving-group-to-destination | ported | P1 | sample parity 完了（group transform animate） | `VGroup(...).scale(1.4)` の dot spacing / source dot 半径 7.56px、destination default dot 半径 5.4px、`dest.get_center() - group[2].get_center()` を pixel 座標へ展開し、group 単位移動を再現する。 |
| arg-min-example | ported | P2 | Text DSL sample 完了（`examples/gallery/arg-min-example.fluxion.txt`）; `axes` + `plot` + `dataDot` | 公式既定 `Axes` の 12x6 units、`get_axis_labels` の軸端配置、既定 `Dot()` 半径、`ax.c2p` ベースの dot updater と `np.linspace(..., 200).argmin()` の移動先を再現する。 |
| boolean-operations | ported | P2 | Text DSL sample 完了（`examples/gallery/boolean-operations.fluxion.txt`）; `fillRule` 付き複合 path で結果形状を近似 | 公式 `Ellipse(width=4.0,height=5.0)` と `MarkupText` 既定 `font_size=48` を frame scale で展開し、同じ楕円配置・結果色・0.5 opacity・既定1秒 cadence で視覚近似する。 |
| gradient-image-from-array | ported | P2 | Text DSL sample 完了（`examples/gallery/gradient-image-from-array.fluxion.txt`）; Python `ImageMobject` sample も維持 | 公式 256x256 `ImageMobject(...).scale(2)` の横グレースケールを `dataRows=256`、256px 表示、`SMALL_BUFF` 付き緑枠で再現する。 |
| graph-area-plot | ported | P2 | Text DSL sample 完了（`examples/gallery/graph-area-plot.fluxion.txt`）; `dataLine` + `dataRiemannRects` + `dataArea` | 公式既定 `Axes` の 12x6 units を 810x405px に展開し、`get_vertical_line`、`get_riemann_rectangles`、`get_area(... bounded_graph=...)` の主要 geometry を axes データ座標から生成する。 |
| heat-diagram-plot | ported | P2 | Text DSL sample 完了（`examples/gallery/heat-diagram-plot.fluxion.txt`）; asymmetric axes origin + `xNumbers`/`yNumbers` + dataLineGraph | 公式 `Axes(x_length=9, y_length=6)` を 607.5x405px に展開し、`np.arange(0, 40, 5)` 由来の x 数値、折れ線、既定サイズ vertex dots を生成する。 |
| fixed-in-frame-m-object-test | ported | P2 | Text DSL sample 完了（`examples/gallery/fixed-in-frame-m-object-test.fluxion.txt`）; `threeDAxes` + fixed screen text | `ThreeDAxes()` を `set_camera_orientation(phi=75°, theta=-45°)` の Manim camera 投影で描き、default `Text(..., font_size=48).to_corner(UL)` を固定座標で再現する。 |
| moving-dots | ported | P2 | Text DSL sample 完了（`examples/gallery/moving-dots.fluxion.txt`）; `always` + `dynamicLine` updater expansion | `VGroup(...).arrange(RIGHT,buff=1)`、`Dot.set_x` / `Dot.set_y`、connector `Line(...).become(...)` を value binding で再現し、`become(Line(...))` 後の default white connector style も反映する。 |
| rotation-updater | ported | P2 | Text DSL sample 完了（`examples/gallery/rotation-updater.fluxion.txt`）; `rotateUpdater` dt accumulation expansion | `Line(ORIGIN, LEFT)` と `YELLOW` を Manim frame scale / color constants で展開し、`rotate_about_origin(dt)` と逆方向 updater を rad/s 累積の rotation animation として再現する。 |
| vector-arrow | ported | P2 | Text DSL sample 完了（`examples/gallery/vector-arrow.fluxion.txt`）; `numberPlane` + Manim-like `arrow` | 静止 `self.add(numberplane, dot, arrow, origin_text, tip_text)` 例として、公式 full-frame `NumberPlane()` と default white / `tip_length=0.35` の `Arrow(ORIGIN, [2, 2, 0], buff=0)` を Manim frame scale と公式 z-order で helper 生成する。 |
| manim-ce-logo | ported | P2 | Text DSL sample 完了（`examples/gallery/manim_ce_logo.fluxion.txt`）; primitive logo composition | 公式の `Triangle` / `Square` / `Circle` / `MathTex` の色・重なり順・frame scale を手動配置で再現する。 |
| three-d-camera-rotation | ported | P2 | Text DSL sample 完了（`examples/gallery/three-d-camera-rotation.fluxion.txt`）; `projectedCircle` + 3D camera orbit controls | default `Circle(radius=1)` を投影済み circle として axes の下に描き、公式の 1s ambient rotation / 1s `move_camera` / 1s hold の cadence で視覚近似する。 |
| three-d-camera-illusion-rotation | ported | P2 | Text DSL sample 完了（`examples/gallery/three-d-camera-illusion-rotation.fluxion.txt`）; `projectedCircle` + faux-3D transform stack | default `Circle(radius=1)` を投影済み circle として axes の下に描き、ThreeDCamera 風の axes と illusion wobble で視覚近似する。 |
| three-d-light-source-position | ported | P2 | Text DSL sample 完了（`examples/gallery/three-d-light-source-position.fluxion.txt`）; `threeDAxes` + `sphereSurface` 15x32 shaded checkerboard mesh | 公式 `ThreeDAxes()` の default ranges/tick/tip、半径 1.5 の `Surface(... checkerboard_colors=[RED_D, RED_E])`、`light_source.move_to(3*IN)` の主題を helper 生成 geometry で視覚近似する。 |
| three-d-surface-plot | ported | P2 | Text DSL sample 完了（`examples/gallery/three-d-surface-plot.fluxion.txt`）; `threeDAxes` + `gaussianSurface` 24x24 projected mesh | 公式 `ThreeDAxes()` の default ranges/tick/tip と `Surface(param_gauss)` の checkerboard/peak を Manim light/normal-shaded helper path で再現する。 |
| moving-zoomed-scene-around | ported | P2 | Text DSL sample 完了（`examples/gallery/moving-zoomed-scene-around.fluxion.txt`）; zoomed scene inset camera support | 公式 2x4 grayscale image、default Dot 半径、zoom display、1s 既定 cadence、Dot 周辺の単一 pixel crop と拡大 Dot、frame shift 後の表示内容変化、reverse pop-out の frame 位置への畳み込みを手動展開して視覚近似する。 |

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
- [ ] `source_manim_url` が `https://docs.manim.community/en/stable/` 配下の具体的なアンカーを指している。
- [ ] 対応する source example（`source_example_path`）が `examples/gallery/*.fluxion.txt` として存在し、ページ本文と同期している。
- [ ] `examples/gallery/*.fluxion.txt` と `site/src/content/gallery/*.md` が一対一で対応している（未参照 source / 重複参照がない）。

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
