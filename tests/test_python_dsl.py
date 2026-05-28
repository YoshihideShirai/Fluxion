import json
import tempfile
import unittest
from pathlib import Path

from fluxion import Circle, Scene


class Demo(Scene):
    def construct(self):
        circle = Circle(id="c1", r=10).move_to(10, 20)
        self.add(circle)
        self.play(circle.animate.move_to(100, 120), run_time=2)


class PythonDslTest(unittest.TestCase):
    def test_scene_exports_graph_and_timeline(self):
        scene = Demo()
        scene.construct()
        data = scene.to_dict()

        self.assertEqual(data["version"], "0.1")
        self.assertEqual(data["duration"], 2.0)
        self.assertEqual(data["nodes"][0]["id"], "c1")
        self.assertEqual(data["timeline"][0]["op"], "create")
        self.assertEqual([op["path"] for op in data["timeline"][1:]], ["transform.x", "transform.y"])
        self.assertEqual(data["timeline"][1]["from"], 10)
        self.assertEqual(data["timeline"][1]["to"], 100)

    def test_fadein_create_and_fadeout_delete(self):
        from fluxion import FadeIn, FadeOut

        scene = Scene()
        circle = Circle(id="fade", r=10)

        scene.play(FadeIn(circle), run_time=0.5)
        scene.play(FadeOut(circle), run_time=0.25)
        data = scene.to_dict()

        self.assertEqual(data["duration"], 0.75)
        self.assertEqual(data["nodes"], [])
        self.assertEqual(data["timeline"][0]["op"], "create")
        self.assertEqual(data["timeline"][0]["node"]["transform"]["opacity"], 0)
        self.assertEqual(data["timeline"][1]["op"], "effect")
        self.assertEqual(data["timeline"][1]["effect"], "fadeIn")
        self.assertEqual(data["timeline"][2]["path"], "transform.opacity")
        self.assertEqual(data["timeline"][2]["from"], 0)
        self.assertEqual(data["timeline"][2]["to"], 1)
        self.assertEqual(data["timeline"][-1], {"t": 0.75, "op": "delete", "id": "fade"})

    def test_fadein_preserves_target_opacity(self):
        from fluxion import FadeIn

        scene = Scene()
        circle = Circle(id="half", r=10).set_opacity(0.4)
        scene.play(FadeIn(circle), run_time=0.5)
        data = scene.to_dict()

        self.assertEqual(data["timeline"][0]["node"]["transform"]["opacity"], 0)
        self.assertEqual(data["timeline"][2]["path"], "transform.opacity")
        self.assertEqual(data["timeline"][2]["to"], 0.4)
        self.assertEqual(data["nodes"][0]["transform"]["opacity"], 0.4)

    def test_create_draws_drawable_geometry(self):
        from fluxion import Create

        scene = Scene()
        circle = Circle(id="draw", r=10).set_fill("#ec4899", opacity=0.5)
        scene.play(Create(circle), run_time=0.5)
        data = scene.to_dict()

        self.assertEqual(data["timeline"][0]["op"], "create")
        self.assertEqual(data["timeline"][0]["node"]["geometry"]["drawProgress"], 0)
        self.assertEqual(data["timeline"][2]["path"], "geometry.drawProgress")
        self.assertEqual(data["timeline"][2]["from"], 0)
        self.assertEqual(data["timeline"][2]["to"], 1)
        self.assertEqual(data["timeline"][0]["node"]["style"]["fillOpacity"], 0.5)

    def test_write_reveals_text_progressively(self):
        from fluxion import Text, Write

        scene = Scene()
        text = Text(id="title", text="Fluxion")
        scene.play(Write(text), run_time=0.5)
        data = scene.to_dict()

        self.assertEqual(data["timeline"][0]["op"], "create")
        self.assertEqual(data["timeline"][0]["node"]["geometry"]["writeProgress"], 0)
        self.assertEqual(data["timeline"][2]["path"], "geometry.writeProgress")
        self.assertEqual(data["timeline"][2]["from"], 0)
        self.assertEqual(data["timeline"][2]["to"], 1)

    def test_transform_and_animation_composition(self):
        from fluxion import AnimationGroup, Succession, Transform

        scene = Scene()
        src = Circle(id="shape", r=10).move_to(0, 0)
        dst = Circle(id="shape-target", r=20).move_to(100, 0).set_style(fill="#38bdf8")
        other = Circle(id="other", r=5)
        scene.add(src, other)

        scene.play(
            Succession(
                Transform(src, dst),
                AnimationGroup(other.animate.move_to(20, 30), lag_ratio=0.5),
            ),
            run_time=2,
        )
        data = scene.to_dict()

        transform_ops = [op for op in data["timeline"] if op.get("id") == "shape" and op["op"] == "animate"]
        self.assertIn("geometry.r", [op["path"] for op in transform_ops])
        self.assertIn("style.fill", [op["path"] for op in transform_ops])
        self.assertIn("transform.x", [op["path"] for op in transform_ops])
        self.assertTrue(all(op["duration"] == 1 for op in transform_ops))
        other_ops = [op for op in data["timeline"] if op.get("id") == "other" and op["op"] == "animate"]
        self.assertEqual([op["t"] for op in other_ops], [1.0, 1.0])
        self.assertEqual(data["duration"], 2.0)

    def test_square_primitive_exports_equal_sides(self):
        from fluxion import Square

        square = Square(id="sq", side=24)
        data = square.to_dict()

        self.assertEqual(data["type"], "rect")
        self.assertEqual(data["geometry"], {"w": 24, "h": 24})

    def test_animate_set_fill_and_stroke_paths(self):
        from fluxion import Square

        scene = Scene()
        square = Square(id="sq2", side=20)
        scene.add(square)
        scene.play(square.animate.set_fill("#22c55e", opacity=0.5), run_time=0.5)
        scene.play(square.animate.set_stroke("#111827", width=6), run_time=0.5)
        data = scene.to_dict()

        square_ops = [op for op in data["timeline"] if op.get("id") == "sq2" and op["op"] == "animate"]
        self.assertIn("style.fill", [op["path"] for op in square_ops])
        self.assertIn("style.fillOpacity", [op["path"] for op in square_ops])
        self.assertIn("style.stroke", [op["path"] for op in square_ops])
        self.assertIn("style.strokeWidth", [op["path"] for op in square_ops])


    def test_path_primitive_exports_svg_path_geometry(self):
        from fluxion import Path

        scene = Scene()
        path = Path(id="curve", d="M 0 0 C 20 40 40 40 60 0", style={"stroke": "#38bdf8", "fill": "none"})
        scene.add(path)
        data = scene.to_dict()

        self.assertEqual(data["nodes"][0]["type"], "path")
        self.assertEqual(data["nodes"][0]["geometry"], {"d": "M 0 0 C 20 40 40 40 60 0"})
        self.assertEqual(data["nodes"][0]["style"]["stroke"], "#38bdf8")

    def test_image_mobject_exports_grayscale_matrix_geometry(self):
        from fluxion import ImageMobject

        image = ImageMobject(id="img", data=[[0, 127.6, 255], [300, -5, 64]], w=160, h=80)
        data = image.to_dict()

        self.assertEqual(data["type"], "image")
        self.assertEqual(data["geometry"]["w"], 160)
        self.assertEqual(data["geometry"]["h"], 80)
        self.assertEqual(data["geometry"]["data"], "0,128,255;255,0,64")
        self.assertEqual(data["geometry"]["sampling"], "nearest")

    def test_gaussian_surface_exports_projected_checkerboard_faces(self):
        from fluxion import GaussianSurface

        surface = GaussianSurface(
            id="gauss",
            resolution=4,
            scale=2,
            sigma=0.4,
            mu=(0, 0),
            x_basis=(63, 31),
            y_basis=(-60, 30),
            z_basis=(0, -130),
            fill_opacity=0.5,
            shade=True,
        )
        data = surface.to_dict()

        self.assertEqual(data["type"], "group")
        self.assertEqual(data["geometry"]["gaussianSurface"], True)
        self.assertEqual(data["geometry"]["resolution"], 4)
        self.assertEqual(data["geometry"]["mu"], [0, 0])
        self.assertEqual(data["geometry"]["xBasis"], [63, 31])
        self.assertEqual(data["geometry"]["yBasis"], [-60, 30])
        self.assertEqual(data["geometry"]["zBasis"], [0, -130])
        self.assertEqual(len(data["children"]), 16)
        self.assertTrue(all(child["type"] == "path" for child in data["children"]))
        self.assertTrue(all(child["geometry"]["d"].endswith(" Z") for child in data["children"]))
        self.assertEqual(data["children"][0]["style"]["strokeWidth"], 0.5)
        self.assertEqual(data["children"][0]["style"]["fillOpacity"], 0.5)

    def test_gaussian_surface_exports_manim_camera_projection(self):
        from fluxion import GaussianSurface

        surface = GaussianSurface(
            id="gauss",
            u_range=(-1, 1),
            v_range=(-1, 1),
            resolution=2,
            scale=2,
            sigma=0.4,
            mu=(0, 0),
            phi=75,
            theta=30,
            unit_scale=108.75,
            shade=True,
        )
        data = surface.to_dict()

        self.assertEqual(data["geometry"]["cameraProjection"], "manim")
        self.assertEqual(data["geometry"]["phi"], 75)
        self.assertEqual(data["geometry"]["theta"], 30)
        self.assertEqual(len(data["children"]), 4)
        self.assertEqual(
            data["children"][0]["geometry"]["d"],
            "M -70.333659 -68.295405 L -179.877654 -35.693937 L 0 -215.670839 L 100.460552 -53.562289 Z",
        )

    def test_sphere_surface_exports_projected_checkerboard_faces(self):
        from fluxion import SphereSurface

        sphere = SphereSurface(
            id="sphere",
            radius=104,
            world_radius=1.5,
            resolution=(3, 4),
            x_basis=(67.5, 0),
            y_basis=(0, 12.15),
            z_basis=(0, -67.5),
            light=(0, -0.35, 1),
        )
        data = sphere.to_dict()

        self.assertEqual(data["type"], "group")
        self.assertEqual(data["geometry"]["sphereSurface"], True)
        self.assertEqual(data["geometry"]["uResolution"], 3)
        self.assertEqual(data["geometry"]["vResolution"], 4)
        self.assertEqual(data["geometry"]["worldRadius"], 1.5)
        self.assertEqual(data["geometry"]["xBasis"], [67.5, 0])
        self.assertEqual(data["geometry"]["yBasis"], [0, 12.15])
        self.assertEqual(data["geometry"]["zBasis"], [0, -67.5])
        self.assertEqual(len(data["children"]), 12)
        self.assertTrue(all(child["type"] == "path" for child in data["children"]))
        self.assertTrue(all(child["style"]["stroke"] == "#BBBBBB" for child in data["children"]))

    def test_sphere_surface_exports_manim_camera_projection(self):
        from fluxion import SphereSurface

        sphere = SphereSurface(
            id="sphere",
            radius=104,
            world_radius=1.5,
            resolution=(2, 4),
            phi=75,
            theta=30,
            unit_scale=108.75,
            light=(0, -0.35, 1),
        )
        data = sphere.to_dict()

        self.assertEqual(data["geometry"]["cameraProjection"], "manim")
        self.assertEqual(data["geometry"]["phi"], 75)
        self.assertEqual(data["geometry"]["theta"], 30)
        self.assertEqual(len(data["children"]), 8)
        self.assertEqual(
            data["children"][0]["geometry"]["d"],
            "M 0 154.566298 L 76.747462 -34.404946 L -136.332141 -20.372009 L 0 154.566298 Z",
        )

    def test_three_d_axes_exports_projected_axes_ticks_and_tips(self):
        from fluxion import ThreeDAxes

        axes = ThreeDAxes(
            id="axes",
            x_range=(-6, 6, 1),
            y_range=(-5, 5, 1),
            z_range=(-4, 4, 1),
            include_tips=True,
        )
        data = axes.to_dict()

        self.assertEqual(data["type"], "group")
        self.assertEqual(data["geometry"]["threeDAxes"], True)
        self.assertEqual(data["geometry"]["xRange"], [-6, 6, 1])
        self.assertEqual(len([child for child in data["children"] if child["type"] == "line"]), 33)
        self.assertEqual(len([child for child in data["children"] if child["type"] == "path"]), 3)
        self.assertIn("axes:x:tip", {child["id"] for child in data["children"]})

    def test_three_d_axes_exports_manim_camera_projection(self):
        from fluxion import ThreeDAxes

        axes = ThreeDAxes(
            id="axes",
            x_range=(-2, 2, 1),
            y_range=(-2, 2, 1),
            z_range=(-1, 1, 1),
            phi=75,
            theta=30,
            unit_scale=108.75,
            include_tips=True,
        )
        data = axes.to_dict()

        self.assertEqual(data["geometry"]["cameraProjection"], "manim")
        self.assertEqual(data["geometry"]["phi"], 75)
        self.assertEqual(data["geometry"]["theta"], 30)
        self.assertEqual(len(data["children"]), 16)
        x_axis = next(child for child in data["children"] if child["id"] == "axes:x:axis")
        self.assertEqual(round(x_axis["geometry"]["x1"], 6), 100.35513)
        self.assertEqual(round(x_axis["geometry"]["x2"], 6), -118.677572)
        z_tip = next(child for child in data["children"] if child["id"] == "axes:z:tip")
        self.assertEqual(z_tip["geometry"]["d"], "M 0 -106.421631 L 7 -88.421631 L -7 -88.421631 Z")

    def test_projected_circle_exports_xy_plane_path(self):
        from fluxion import ProjectedCircle

        circle = ProjectedCircle(
            id="circle_xy",
            radius=0.67,
            x_basis=(-56.75, 25.5),
            y_basis=(87.75, 13.25),
        )
        data = circle.to_dict()

        self.assertEqual(data["type"], "path")
        self.assertEqual(data["geometry"]["projectedCircle"], True)
        self.assertEqual(data["geometry"]["radius"], 0.67)
        self.assertEqual(
            data["geometry"]["d"],
            "M -38.0225 17.085 C -5.552299 21.987908 37.793253 18.313285 58.7925 8.8775 C 79.791747 -0.558285 70.492701 -12.182092 38.0225 -17.085 C 5.552299 -21.987908 -37.793253 -18.313285 -58.7925 -8.8775 C -79.791747 0.558285 -70.492701 12.182092 -38.0225 17.085 Z",
        )

    def test_projected_circle_exports_manim_camera_projection_path(self):
        from fluxion import ProjectedCircle

        circle = ProjectedCircle(id="circle_xy", radius=1, phi=75, theta=30, unit_scale=108.75, samples=16)
        data = circle.to_dict()

        self.assertEqual(data["type"], "path")
        self.assertEqual(data["geometry"]["projectedCircle"], True)
        self.assertEqual(data["geometry"]["cameraProjection"], "manim")
        self.assertEqual(data["geometry"]["phi"], 75)
        self.assertEqual(data["geometry"]["theta"], 30)
        self.assertTrue(data["geometry"]["d"].startswith("M -56.748555 25.439681 L "))
        self.assertEqual(data["geometry"]["d"].count(" L "), 15)

    def test_wait_advances_scene_duration(self):
        scene = Scene()
        scene.wait(1.25)
        data = scene.to_dict()

        self.assertEqual(data["duration"], 1.25)
        self.assertEqual(data["timeline"], [])

    def test_transform_path_morph_exports_geometry_and_fill_opacity(self):
        from fluxion import Path, Transform

        square = Path(
            id="square",
            d="M 0 -84.853 C 0 -84.853 84.853 0 84.853 0 C 84.853 0 0 84.853 0 84.853 C 0 84.853 -84.853 0 -84.853 0 C -84.853 0 0 -84.853 0 -84.853 Z",
        ).set_style(fill="#ec4899", fillOpacity=0, stroke="#ffffff", strokeWidth=4)
        circle = Path(
            id="circle",
            d="M 0 -56 C 30.928 -56 56 -30.928 56 0 C 56 30.928 30.928 56 0 56 C -30.928 56 -56 30.928 -56 0 C -56 -30.928 -30.928 -56 0 -56 Z",
        ).set_fill("#ec4899", opacity=0.5)
        scene = Scene()
        scene.add(square)
        scene.play(Transform(square, circle), run_time=1)
        data = scene.to_dict()

        square_ops = [op for op in data["timeline"] if op.get("id") == "square" and op["op"] == "animate"]
        self.assertIn("geometry.d", [op["path"] for op in square_ops])
        self.assertIn("style.fillOpacity", [op["path"] for op in square_ops])


    def test_math_token_helpers_export_child_nodes(self):
        from fluxion import Math, tokenize_latex

        self.assertEqual(tokenize_latex(r"e^{i\pi}+1=0"), [r"e^{i\pi}", "+", "1", "=", "0"])

        equation = Math(id="eq", latex=r"e^{i\pi}+1=0", expand_tokens=True)
        data = equation.to_dict()

        self.assertEqual(data["type"], "math")
        self.assertEqual(data["latex"], r"e^{i\pi}+1=0")
        self.assertEqual(data["renderer"], "katex")
        self.assertEqual(data["geometry"], {"fontSize": 36})
        self.assertEqual([child["latex"] for child in data["children"]], [r"e^{i\pi}", "+", "1", "=", "0"])
        self.assertTrue(all(child["type"] == "math" for child in data["children"]))

    def test_transform_matching_tex_matches_tokens_and_fades_unmatched(self):
        from fluxion import Math, TransformMatchingTex

        scene = Scene()
        src = Math(id="src", latex="a+b", expand_tokens=True)
        dst = Math(id="dst", latex="bca", expand_tokens=True)
        scene.add(src)

        scene.play(TransformMatchingTex(src, dst), run_time=1.25)
        data = scene.to_dict()

        animate_ops = [op for op in data["timeline"] if op["op"] == "animate"]
        fade_effects = [op for op in data["timeline"] if op["op"] == "effect"]

        self.assertIn("src:tex:0", {op["id"] for op in animate_ops})
        self.assertIn("src:tex:1", {op["id"] for op in animate_ops})
        self.assertIn(("src:tex:1", "fadeOut"), {(op["id"], op["effect"]) for op in fade_effects})
        self.assertIn(("dst:tex:1", "fadeIn"), {(op["id"], op["effect"]) for op in fade_effects})
        self.assertIn({"t": 1.25, "op": "delete", "id": "src:tex:1"}, data["timeline"])
        self.assertEqual(data["duration"], 1.25)


    def test_scene_camera_exports_and_animates(self):
        scene = Scene()
        scene.camera.move_to(10, 20).set_scale(1.5)
        scene.play(scene.camera.animate.move_to(110, 120), scene.camera.animate.set_scale(2), run_time=2)
        data = scene.to_dict()

        self.assertEqual(data["camera"], {"x": 110, "y": 120, "scale": 2, "rotation": 0.0})
        camera_ops = [op for op in data["timeline"] if op.get("id") == "camera"]
        self.assertEqual([op["path"] for op in camera_ops], ["camera.x", "camera.y", "camera.scale"])
        self.assertEqual(camera_ops[0]["from"], 10)
        self.assertEqual(camera_ops[0]["to"], 110)
        self.assertEqual(camera_ops[2]["from"], 1.5)
        self.assertEqual(camera_ops[2]["to"], 2)

    def test_export_json_writes_file(self):
        scene = Demo()
        scene.construct()
        with tempfile.TemporaryDirectory() as tmp:
            path = scene.export_json(Path(tmp) / "demo.fluxion.json")
            self.assertTrue(path.exists())
            self.assertEqual(json.loads(path.read_text())["fps"], 60)


if __name__ == "__main__":
    unittest.main()
