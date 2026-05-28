from fluxion import ImageMobject, Rectangle, Scene


class GradientImageFromArray(Scene):
    def construct(self) -> None:
        n = 32
        image_array = [[i * 255 / (n - 1) for i in range(n)] for _ in range(n)]
        image = ImageMobject(id="image", data=image_array, w=256, h=256)
        frame = Rectangle(id="frame", w=269.5, h=269.5).set_style(fill="none", stroke="#83C167", strokeWidth=4)
        self.add(image, frame)
        self.wait(1)


if __name__ == "__main__":
    scene = GradientImageFromArray()
    scene.construct()
    scene.export_json("examples/gradient_image_from_array.fluxion.json")
