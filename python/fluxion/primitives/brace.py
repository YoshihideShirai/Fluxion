from __future__ import annotations

from ..mobject import Mobject


class Brace(Mobject):
    def __init__(self, id: str, target: str, direction: str = "down", buff: float = 8, label: str | None = None, label_size: float = 24, label_color: str = "#ffffff", **kwargs) -> None:
        geometry = {
            "target": target,
            "direction": direction,
            "buff": buff,
            "label": label or "",
            "labelSize": label_size,
            "labelColor": label_color,
        }
        super().__init__(id=id, type="brace", geometry=geometry, **kwargs)
