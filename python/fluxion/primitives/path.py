from __future__ import annotations

from ..mobject import Mobject


class Path(Mobject):
    def __init__(self, id: str, d: str, **kwargs) -> None:
        super().__init__(id=id, type="path", geometry={"d": d}, **kwargs)
