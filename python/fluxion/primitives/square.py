from __future__ import annotations

from .rectangle import Rectangle


class Square(Rectangle):
    def __init__(self, id: str, side: float = 80, **kwargs) -> None:
        super().__init__(id=id, w=side, h=side, **kwargs)
