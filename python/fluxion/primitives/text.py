from __future__ import annotations

from ..mobject import Mobject


class Text(Mobject):
    def __init__(self, id: str, text: str, font_size: float = 32, **kwargs) -> None:
        super().__init__(id=id, type="text", geometry={"fontSize": font_size}, text=text, **kwargs)
