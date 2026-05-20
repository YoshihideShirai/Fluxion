from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, Iterable, List, Tuple

from .node import Node


class Mobject:
    """Manim-like base object backed by a serializable Node."""

    def __init__(
        self,
        id: str,
        type: str,
        geometry: Dict[str, Any] | None = None,
        style: Dict[str, Any] | None = None,
        transform: Dict[str, Any] | None = None,
        children: Iterable["Mobject"] | None = None,
        text: str | None = None,
        latex: str | None = None,
        renderer: str | None = None,
    ) -> None:
        self.node = Node(id=id, type=type, geometry=geometry or {}, text=text, latex=latex, renderer=renderer)
        if style:
            self.node.style.update(style)
        if transform:
            self.node.transform.update(transform)
        if children:
            self.node.children = [child.node for child in children]

    @property
    def id(self) -> str:
        return self.node.id

    @property
    def animate(self) -> "AnimationBuilder":
        from .animation import AnimationBuilder

        return AnimationBuilder(self)

    def move_to(self, x: float, y: float) -> "Mobject":
        self.node.transform["x"] = x
        self.node.transform["y"] = y
        return self

    def shift(self, dx: float, dy: float) -> "Mobject":
        self.node.transform["x"] += dx
        self.node.transform["y"] += dy
        return self

    def scale(self, factor: float) -> "Mobject":
        self.node.transform["scale"] = factor
        return self

    def rotate(self, degrees: float) -> "Mobject":
        self.node.transform["rotation"] = degrees
        return self

    def set_opacity(self, opacity: float) -> "Mobject":
        self.node.transform["opacity"] = opacity
        return self

    def set_style(self, **style: Any) -> "Mobject":
        self.node.style.update(style)
        return self

    def set_fill(self, color: str, opacity: float | None = None) -> "Mobject":
        self.node.style["fill"] = color
        if opacity is not None:
            self.node.transform["opacity"] = opacity
        return self

    def set_stroke(self, color: str, width: float | None = None) -> "Mobject":
        self.node.style["stroke"] = color
        if width is not None:
            self.node.style["strokeWidth"] = width
        return self

    def to_dict(self) -> Dict[str, Any]:
        return self.node.to_dict()

    def _snapshot_paths(self) -> Dict[str, Any]:
        return {
            "transform.x": self.node.transform["x"],
            "transform.y": self.node.transform["y"],
            "transform.scale": self.node.transform["scale"],
            "transform.rotation": self.node.transform["rotation"],
            "transform.opacity": self.node.transform["opacity"],
            "style.fill": self.node.style.get("fill"),
            "style.stroke": self.node.style.get("stroke"),
            "style.strokeWidth": self.node.style.get("strokeWidth"),
            **{f"geometry.{key}": value for key, value in self.node.geometry.items()},
        }


def resolve_path(target: Mobject, path: str) -> Any:
    current: Any = target.node
    for part in path.split("."):
        if isinstance(current, dict):
            current = current[part]
        else:
            current = getattr(current, part)
    return deepcopy(current)


def set_path(target: Mobject, path: str, value: Any) -> None:
    parts = path.split(".")
    current: Any = target.node
    for part in parts[:-1]:
        if isinstance(current, dict):
            current = current[part]
        else:
            current = getattr(current, part)
    if isinstance(current, dict):
        current[parts[-1]] = value
    else:
        setattr(current, parts[-1], value)
