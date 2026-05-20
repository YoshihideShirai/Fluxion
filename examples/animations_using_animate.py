from fluxion import Scene, Square


class MovingAround(Scene):
    def construct(self) -> None:
        square = Square(id="square", side=120).move_to(640, 360)
        self.add(square)

        self.play(square.animate.shift(160, 0), run_time=1)
        self.play(square.animate.set_fill("#0ea5e9", opacity=0.6), run_time=1)
        self.play(square.animate.scale(0.5), run_time=1)
        self.play(square.animate.rotate(45), run_time=1)


if __name__ == "__main__":
    scene = MovingAround()
    scene.construct()
    scene.export_json("examples/animations_using_animate.fluxion.json")
