from fluxion import Circle, Rectangle, Scene, Text


class SimpleCircle(Scene):
    def construct(self) -> None:
        title = Text(id="title", text="Fluxion MVP").move_to(640, 110).set_style(fill="#e2e8f0", stroke="none")
        circle = Circle(id="c1", r=48).move_to(220, 360).set_style(fill="#38bdf8", stroke="#0f172a", strokeWidth=4)
        box = Rectangle(id="box", w=120, h=80).move_to(640, 360).set_style(fill="#f97316", stroke="#111827")

        self.add(title, circle, box)
        self.play(circle.animate.move_to(640, 360), box.animate.set_opacity(0.35), run_time=1.5)
        self.play(circle.animate.move_to(980, 360), circle.animate.scale(1.4), run_time=1.5)


if __name__ == "__main__":
    scene = SimpleCircle()
    scene.construct()
    scene.export_json("examples/simple_circle.fluxion.json")
