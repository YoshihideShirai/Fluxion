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

    def test_export_json_writes_file(self):
        scene = Demo()
        scene.construct()
        with tempfile.TemporaryDirectory() as tmp:
            path = scene.export_json(Path(tmp) / "demo.vanim.json")
            self.assertTrue(path.exists())
            self.assertEqual(json.loads(path.read_text())["fps"], 60)


if __name__ == "__main__":
    unittest.main()
