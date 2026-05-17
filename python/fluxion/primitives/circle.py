from __future__ import annotations

from ..mobject import Mobject


class Circle(Mobject):
    def __init__(self, id: str, r: float = 40, **kwargs) -> None:
        super().__init__(id=id, type="circle", geometry={"r": r}, **kwargs)
