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

    def test_export_json_writes_file(self):
        scene = Demo()
        scene.construct()
        with tempfile.TemporaryDirectory() as tmp:
            path = scene.export_json(Path(tmp) / "demo.fluxion.json")
            self.assertTrue(path.exists())
            self.assertEqual(json.loads(path.read_text())["fps"], 60)


if __name__ == "__main__":
    unittest.main()
