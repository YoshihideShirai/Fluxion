from fluxion import Circle, Scene, Text


class ZoomedScene(Scene):
    def construct(self) -> None:
        title = Text(id="title", text="Special Camera Settings").move_to(640, 90)
        dot = (
            Circle(id="dot", r=28)
            .move_to(260, 360)
            .set_style(fill="#22d3ee", fillOpacity=1, stroke="#0891b2", strokeWidth=3)
        )

        self.add(title, dot)
        self.play(self.camera.animate.move_to(640, 360), run_time=1.0)
        self.play(self.camera.animate.set_scale(0.65), run_time=1.0)
        self.play(dot.animate.move_to(980, 360), run_time=1.0)
        self.play(self.camera.animate.move_to(980, 360), run_time=1.0)
        self.play(self.camera.animate.set_scale(1.0), run_time=1.0)


if __name__ == "__main__":
    scene = ZoomedScene()
    scene.construct()
    scene.export_json("examples/special_camera_settings.fluxion.json")
