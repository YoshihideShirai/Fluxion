import math

from fluxion import Create, FadeIn, Line, Path, Scene, Text


def function_path(id: str, fn, x_start: float, x_end: float, step: float, scale_x: float, scale_y: float, origin_x: float, origin_y: float, color: str) -> Path:
    points = []
    x = x_start
    while x <= x_end + 1e-9:
        px = origin_x + x * scale_x
        py = origin_y - fn(x) * scale_y
        points.append((px, py))
        x += step
    d = "M " + " L ".join(f"{px:.2f} {py:.2f}" for px, py in points)
    return Path(id=id, d=d, style={"fill": "none", "stroke": color, "strokeWidth": 3})


class SinAndCosFunctionPlot(Scene):
    def construct(self) -> None:
        origin_x, origin_y = 260, 520
        scale_x, scale_y = 130, 90

        x_axis = Line(id="x_axis", x1=0, y1=0, x2=6.5 * scale_x, y2=0).move_to(origin_x, origin_y)
        y_axis = Line(id="y_axis", x1=0, y1=-2.2 * scale_y, x2=0, y2=2.2 * scale_y).move_to(origin_x, origin_y)
        x_label = Text(id="x_label", text="x").move_to(origin_x + 6.7 * scale_x, origin_y + 20)
        y_label = Text(id="y_label", text="y").move_to(origin_x - 20, origin_y - 2.35 * scale_y)

        sin_plot = function_path(
            "sin_plot", math.sin, 0.0, 2 * math.pi, 0.1, scale_x, scale_y, origin_x, origin_y, "#22d3ee"
        )
        cos_plot = function_path(
            "cos_plot", math.cos, 0.0, 2 * math.pi, 0.1, scale_x, scale_y, origin_x, origin_y, "#f97316"
        )

        sin_label = Text(id="sin_label", text="sin(x)").move_to(origin_x + 5.7 * scale_x, origin_y - 1.1 * scale_y)
        cos_label = Text(id="cos_label", text="cos(x)").move_to(origin_x + 5.7 * scale_x, origin_y - 2.0 * scale_y)

        self.add(x_axis, y_axis, x_label, y_label)
        self.play(Create(sin_plot), run_time=1.2)
        self.play(Create(cos_plot), run_time=1.2)
        self.play(FadeIn(sin_label), FadeIn(cos_label), run_time=0.8)


if __name__ == "__main__":
    scene = SinAndCosFunctionPlot()
    scene.construct()
    scene.export_json("examples/plotting_with_manim.fluxion.json")
