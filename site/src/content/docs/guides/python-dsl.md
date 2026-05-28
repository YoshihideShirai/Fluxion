---
title: Python DSL
description: Manim 風 Python API から Fluxion JSON を生成する authoring guide。
---

Python DSL は、Manim 風の `Scene` と object API で scene を書き、動画ではなく `.fluxion.json` を export する authoring frontend です。

## 最小例

```python
from fluxion import Circle, Scene


class Demo(Scene):
    def construct(self):
        c = Circle(id="c1", r=40).move_to(220, 360)
        self.add(c)
        self.play(c.animate.move_to(640, 360), run_time=2)
```

## 実行する

Repository root から example scene を実行します。

```bash
PYTHONPATH=python python examples/simple_circle.py
```

生成された `examples/simple_circle.fluxion.json` は Web Runtime と Playground で読み込める Fluxion IR です。

## 主な概念

- `Scene`: node と timeline を保持し、`export_json()` で `.fluxion.json` を書き出す root。
- `Mobject`: transform、style、geometry、children を持つ Scene Graph node。
- `Circle`, `Rectangle`, `Line`, `Path`, `Text`, `Math`, `ImageMobject`, `ThreeDAxes`, `ProjectedCircle`, `GaussianSurface`, `SphereSurface`, `Group`: Runtime が描画できる node type。
- `self.add()`: node を scene に追加し、Runtime の初期 graph / create operation に反映する。
- `self.play()`: `.animate` builder や animation helper から Timeline operation を生成する。

`ImageMobject` は Manim の `ImageMobject(np.uint8(...))` と同じ用途の primitive で、2D のグレースケール行列を `image` node の `geometry.data` として export します。

```python
from fluxion import ImageMobject

image = ImageMobject(id="gradient", data=[[0, 128, 255], [0, 128, 255]], w=240, h=120)
```

`ThreeDAxes`, `ProjectedCircle`, `GaussianSurface`, `SphereSurface` は、Manim gallery の 3D 移植で使う投影済み geometry を export します。ネイティブ 3D runtime ではなく、Text DSL の `threeDAxes` / `projectedCircle` / `gaussianSurface` / `sphereSurface` helper と同じ IR 形状を Python から生成するための primitive です。`phi=75, theta=30, ...` を指定すると、Manim `ThreeDCamera` の回転行列順と透視係数を使って投影済み geometry を export できます。

```python
from fluxion import GaussianSurface, ThreeDAxes

axes = ThreeDAxes(id="axes")
surface = GaussianSurface(id="gauss", resolution=24, sigma=0.4, mu=(0, 0), shade=True)
```

## 関連ページ

- [Examples](../examples/) で repository 内の sample を確認する。
- [Fluxion JSON / Scene Graph](../../reference/ir/) で export 後の document 形状を確認する。
- [Timeline](../../reference/timeline/) で `self.play()` が生成する operation semantics を確認する。
