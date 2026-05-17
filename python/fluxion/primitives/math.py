from __future__ import annotations

from ..mobject import Mobject


class Math(Mobject):
    def __init__(self, id: str, latex: str, font_size: float = 36, renderer: str = "katex", **kwargs) -> None:
        super().__init__(id=id, type="math", geometry={"fontSize": font_size}, latex=latex, renderer=renderer, **kwargs)
