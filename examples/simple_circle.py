from fluxion import Circle, Create, Scene


class SimpleCircle(Scene):
    def construct(self) -> None:
        circle = Circle(id="circle", r=96).move_to(640, 360).set_fill("#0d6efd", opacity=0.5).set_stroke("#0d6efd", width=4)
        self.play(Create(circle), run_time=1)


if __name__ == "__main__":
    scene = SimpleCircle()
    scene.construct()
    scene.export_json("examples/simple_circle.fluxion.json")
