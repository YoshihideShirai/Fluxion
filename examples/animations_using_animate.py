from fluxion import Scene, Square


class AnimationsUsingAnimate(Scene):
    def construct(self) -> None:
        square = Square(id="square", side=120).move_to(640, 360)
        self.add(square)

        self.play(square.animate.shift(-120, 0), run_time=1)
        self.play(square.animate.set_fill("#f97316"), run_time=1)
        self.play(square.animate.scale(0.3), run_time=1)
        self.play(square.animate.rotate(22.918), run_time=1)


if __name__ == "__main__":
    scene = AnimationsUsingAnimate()
    scene.construct()
    scene.export_json("examples/animations_using_animate.fluxion.json")
