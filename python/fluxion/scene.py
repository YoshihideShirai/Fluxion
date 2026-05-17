from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable, List

from .animation import Animation
from .mobject import Mobject
from .timeline import animate_op, create_op, delete_op


class Scene:
    """Collects scene graph nodes and timeline operations for .vanim.json export."""

    def __init__(self, width: int = 1280, height: int = 720, fps: int = 60) -> None:
        self.width = width
        self.height = height
        self.fps = fps
        self.time = 0.0
        self.nodes: List[Mobject] = []
        self.timeline: List[dict[str, Any]] = []

    def construct(self) -> None:
        """Override in user scenes."""

    def add(self, *mobjects: Mobject) -> None:
        for mobject in mobjects:
            if mobject not in self.nodes:
                self.nodes.append(mobject)
                self.timeline.append(create_op(self.time, mobject))

    def remove(self, *mobjects: Mobject) -> None:
        for mobject in mobjects:
            if mobject in self.nodes:
                self.nodes.remove(mobject)
                self.timeline.append(delete_op(self.time, mobject))

    def play(self, *animations: Animation | Iterable[Animation], run_time: float = 1.0) -> None:
        for animation in self._flatten(animations):
            self.timeline.append(animate_op(self.time, animation, run_time))
        self.time += run_time

    def to_dict(self) -> dict[str, Any]:
        return {
            "version": "0.1",
            "width": self.width,
            "height": self.height,
            "fps": self.fps,
            "duration": self.time,
            "nodes": [node.to_dict() for node in self.nodes],
            "timeline": self.timeline,
        }

    def export_json(self, path: str | Path) -> Path:
        destination = Path(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(self.to_dict(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return destination

    def _flatten(self, animations: Iterable[Animation | Iterable[Animation]]) -> Iterable[Animation]:
        for item in animations:
            if isinstance(item, Animation):
                yield item
            else:
                yield from item
