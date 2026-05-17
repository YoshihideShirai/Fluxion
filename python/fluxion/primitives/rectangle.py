from __future__ import annotations

from ..mobject import Mobject


class Rectangle(Mobject):
    def __init__(self, id: str, w: float = 80, h: float = 60, **kwargs) -> None:
        super().__init__(id=id, type="rect", geometry={"w": w, "h": h}, **kwargs)
