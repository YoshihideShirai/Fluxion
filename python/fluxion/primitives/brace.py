from __future__ import annotations

from ..mobject import FILL_ONLY_STYLE, Mobject, with_default_style


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
        label_renderer: str = "text",
        label_w: float | None = None,
        label_h: float | None = None,
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
            "labelRenderer": label_renderer,
        }
        if label_w is not None:
            geometry["labelW"] = label_w
        if label_h is not None:
            geometry["labelH"] = label_h
        kwargs = with_default_style(FILL_ONLY_STYLE, kwargs)
        super().__init__(id=id, type="brace", geometry=geometry, **kwargs)
