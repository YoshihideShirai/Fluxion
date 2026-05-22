from __future__ import annotations

from ..mobject import Mobject


class Brace(Mobject):
    def __init__(
        self,
        id: str,
        target: str,
        direction: str = "down",
        buff: float = 8,
        curvature: float = 0.22,
        tip: float = 0.35,
        label: str | None = None,
        label_size: float = 24,
        label_color: str = "#ffffff",
        label_offset: float = 0.0,
        label_alignment: str = "center",
        **kwargs,
    ) -> None:
        geometry = {
            "target": target,
            "direction": direction,
            "buff": buff,
            "curvature": curvature,
            "tip": tip,
            "label": label or "",
            "labelSize": label_size,
            "labelColor": label_color,
            "labelOffset": label_offset,
            "labelAlignment": label_alignment,
        }
        super().__init__(id=id, type="brace", geometry=geometry, **kwargs)
