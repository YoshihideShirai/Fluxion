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


    def test_path_primitive_exports_svg_path_geometry(self):
        from fluxion import Path

        scene = Scene()
        path = Path(id="curve", d="M 0 0 C 20 40 40 40 60 0", style={"stroke": "#38bdf8", "fill": "none"})
        scene.add(path)
        data = scene.to_dict()

        self.assertEqual(data["nodes"][0]["type"], "path")
        self.assertEqual(data["nodes"][0]["geometry"], {"d": "M 0 0 C 20 40 40 40 60 0"})
        self.assertEqual(data["nodes"][0]["style"]["stroke"], "#38bdf8")


    def test_math_token_helpers_export_child_nodes(self):
        from fluxion import Math, tokenize_latex

        self.assertEqual(tokenize_latex(r"e^{i\pi}+1=0"), ["e", "^", "{", "i", r"\pi", "}", "+", "1", "=", "0"])

        equation = Math(id="eq", latex=r"e^{i\pi}+1=0", expand_tokens=True)
        data = equation.to_dict()

        self.assertEqual(data["type"], "math")
        self.assertEqual(data["latex"], r"e^{i\pi}+1=0")
        self.assertEqual(data["renderer"], "katex")
        self.assertEqual(data["geometry"], {"fontSize": 36})
        self.assertEqual([child["latex"] for child in data["children"]], ["e", "^", "{", "i", r"\pi", "}", "+", "1", "=", "0"])
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
