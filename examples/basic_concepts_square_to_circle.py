from fluxion import Create, FadeOut, Path, Scene, Transform


class SquareToCircle(Scene):
    def construct(self) -> None:
        square_path = (
            "M 0 -84.853 C 0 -84.853 84.853 0 84.853 0 "
            "C 84.853 0 0 84.853 0 84.853 "
            "C 0 84.853 -84.853 0 -84.853 0 "
            "C -84.853 0 0 -84.853 0 -84.853 Z"
        )
        circle_path = (
            "M 0 -56 C 30.928 -56 56 -30.928 56 0 "
            "C 56 30.928 30.928 56 0 56 "
            "C -30.928 56 -56 30.928 -56 0 "
            "C -56 -30.928 -30.928 -56 0 -56 Z"
        )
        circle = Path(id="circle", d=circle_path).move_to(640, 360).set_fill("#ec4899", opacity=0.5).set_stroke("#ffffff", width=4)
        square = Path(id="square", d=square_path).move_to(640, 360).set_style(fill="#ec4899", fillOpacity=0, stroke="#ffffff", strokeWidth=4)

        self.play(Create(square), run_time=1)
        self.play(Transform(square, circle), run_time=1)
        self.play(FadeOut(square), run_time=1)


if __name__ == "__main__":
    scene = SquareToCircle()
    scene.construct()
    scene.export_json("examples/basic_concepts_square_to_circle.fluxion.json")
