from fluxion import Create, FadeOut, Path, Scene, Transform


class SquareToCircle(Scene):
    def construct(self) -> None:
        square_path = (
            "M 0 -95.459 C 0 -95.459 95.459 0 95.459 0 "
            "C 95.459 0 0 95.459 0 95.459 "
            "C 0 95.459 -95.459 0 -95.459 0 "
            "C -95.459 0 0 -95.459 0 -95.459 Z"
        )
        circle_path = (
            "M 0 -67.5 C 37.279 -67.5 67.5 -37.279 67.5 0 "
            "C 67.5 37.279 37.279 67.5 0 67.5 "
            "C -37.279 67.5 -67.5 37.279 -67.5 0 "
            "C -67.5 -37.279 -37.279 -67.5 0 -67.5 Z"
        )
        circle = Path(id="circle", d=circle_path).move_to(640, 360).set_fill("#D147BD", opacity=0.5).set_stroke("#ffffff", width=4)
        square = Path(id="square", d=square_path).move_to(640, 360).set_style(fill="#ffffff", fillOpacity=0, stroke="#ffffff", strokeWidth=4)

        self.play(Create(square), run_time=1)
        self.play(Transform(square, circle), run_time=1)
        self.play(FadeOut(square), run_time=1)


if __name__ == "__main__":
    scene = SquareToCircle()
    scene.construct()
    scene.export_json("examples/basic_concepts_square_to_circle.fluxion.json")
