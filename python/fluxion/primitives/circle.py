from __future__ import annotations

from ..mobject import Mobject, VMOBJECT_STYLE, with_default_style


class Circle(Mobject):
    def __init__(self, id: str, r: float = 40, **kwargs) -> None:
        kwargs = with_default_style(VMOBJECT_STYLE, kwargs)
        super().__init__(id=id, type="circle", geometry={"r": r}, **kwargs)
