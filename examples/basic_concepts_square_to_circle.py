from fluxion import Circle, Create, FadeOut, Scene, Square, Transform


class SquareToCircle(Scene):
    def construct(self) -> None:
        circle = Circle(id="circle", r=56).move_to(640, 360).set_style(fill="#ec4899", stroke="#f9a8d4", opacity=0.5)
        square = Square(id="square", side=120).move_to(640, 360).rotate(45)

        self.play(Create(square), run_time=1)
        self.play(Transform(square, circle), run_time=1)
        self.play(FadeOut(square), run_time=1)


if __name__ == "__main__":
    scene = SquareToCircle()
    scene.construct()
    scene.export_json("examples/basic_concepts_square_to_circle.fluxion.json")
