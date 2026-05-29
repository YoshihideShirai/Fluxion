from __future__ import annotations

from ..mobject import Mobject, VMOBJECT_STYLE, with_default_style


class Rectangle(Mobject):
    def __init__(self, id: str, w: float = 80, h: float = 60, **kwargs) -> None:
        kwargs = with_default_style(VMOBJECT_STYLE, kwargs)
        super().__init__(id=id, type="rect", geometry={"w": w, "h": h}, **kwargs)
