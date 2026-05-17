from __future__ import annotations

from typing import Iterable

from ..mobject import Mobject


class Group(Mobject):
    def __init__(self, id: str, *children: Mobject, **kwargs) -> None:
        super().__init__(id=id, type="group", children=children, **kwargs)
