from __future__ import annotations

from ..mobject import Mobject


class Line(Mobject):
    def __init__(self, id: str, x1: float = 0, y1: float = 0, x2: float = 100, y2: float = 0, **kwargs) -> None:
        super().__init__(id=id, type="line", geometry={"x1": x1, "y1": y1, "x2": x2, "y2": y2}, **kwargs)
