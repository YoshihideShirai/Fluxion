from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


DEFAULT_TRANSFORM = {
    "x": 0.0,
    "y": 0.0,
    "scale": 1.0,
    "rotation": 0.0,
    "opacity": 1.0,
}

DEFAULT_STYLE = {
    "fill": "#ffffff",
    "stroke": "#111827",
    "strokeWidth": 2,
}


@dataclass
class Node:
    """Serializable scene graph node used by the Fluxion IR."""

    id: str
    type: str
    transform: Dict[str, Any] = field(default_factory=lambda: deepcopy(DEFAULT_TRANSFORM))
    style: Dict[str, Any] = field(default_factory=lambda: deepcopy(DEFAULT_STYLE))
    geometry: Dict[str, Any] = field(default_factory=dict)
    children: List["Node"] = field(default_factory=list)
    text: Optional[str] = None
    latex: Optional[str] = None
    renderer: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "id": self.id,
            "type": self.type,
            "transform": deepcopy(self.transform),
            "style": deepcopy(self.style),
            "geometry": deepcopy(self.geometry),
            "children": [child.to_dict() for child in self.children],
        }
        if self.text is not None:
            payload["text"] = self.text
        if self.latex is not None:
            payload["latex"] = self.latex
        if self.renderer is not None:
            payload["renderer"] = self.renderer
        return payload

    def copy_state(self) -> Dict[str, Any]:
        return self.to_dict()
