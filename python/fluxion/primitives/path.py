from __future__ import annotations

from ..mobject import Mobject, VMOBJECT_STYLE, with_default_style


class Path(Mobject):
    def __init__(self, id: str, d: str, **kwargs) -> None:
        kwargs = with_default_style(VMOBJECT_STYLE, kwargs)
        super().__init__(id=id, type="path", geometry={"d": d}, **kwargs)
