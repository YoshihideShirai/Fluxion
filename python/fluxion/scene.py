from __future__ import annotations

import json
from collections.abc import Iterable as IterableABC
from pathlib import Path
from typing import Any, Iterable, List

from .animation import Animation, AnimationGroup, AnimationInput, EffectAnimation, Succession
from .camera import CameraFrame
from .mobject import Mobject
from .timeline import animate_op, create_op, delete_op, effect_op


class Scene:
    """Collects scene graph nodes and timeline operations for .fluxion.json export."""

    def __init__(self, width: int = 1280, height: int = 720, fps: int = 60) -> None:
        self.width = width
        self.height = height
        self.fps = fps
        self.time = 0.0
        self.camera = CameraFrame()
        self.nodes: List[Mobject] = []
        self.timeline: List[dict[str, Any]] = []

    def construct(self) -> None:
        """Override in user scenes."""

    def add(self, *mobjects: Mobject) -> None:
        for mobject in mobjects:
            if mobject.node.type == "brace":
                target = str(mobject.node.geometry.get("target", ""))
                if target and all(existing.id != target for existing in self.nodes):
                    raise ValueError(f"Brace target '{target}' is not in the scene. Add the target mobject before the brace.")
            if mobject not in self.nodes:
                self.nodes.append(mobject)
                self.timeline.append(create_op(self.time, mobject))

    def remove(self, *mobjects: Mobject) -> None:
        for mobject in mobjects:
            if mobject in self.nodes:
                self.nodes.remove(mobject)
                self.timeline.append(delete_op(self.time, mobject))

    def play(self, *animations: AnimationInput, run_time: float = 1.0) -> None:
        elapsed = 0.0
        for animation in animations:
            elapsed = max(elapsed, self._schedule(animation, self.time, run_time))
        self.time += elapsed if animations else run_time

    def wait(self, duration: float = 1.0) -> None:
        self.time += duration

    def to_dict(self) -> dict[str, Any]:
        return {
            "version": "0.1",
            "width": self.width,
            "height": self.height,
            "fps": self.fps,
            "duration": self.time,
            "camera": self.camera.to_dict(),
            "nodes": [node.to_dict() for node in self.nodes],
            "timeline": self.timeline,
        }

    def export_json(self, path: str | Path) -> Path:
        destination = Path(path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(self.to_dict(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        return destination

    def _flatten(self, animations: Iterable[AnimationInput]) -> Iterable[Animation | EffectAnimation]:
        for item in animations:
            if isinstance(item, Animation | EffectAnimation):
                yield item
            elif isinstance(item, AnimationGroup | Succession):
                yield from self._flatten(item.animations)
            else:
                yield from self._flatten(item)

    def _schedule(self, animation: AnimationInput, start: float, duration: float) -> float:
        if isinstance(animation, Animation):
            self.timeline.append(animate_op(start, animation, duration))
            return duration

        if isinstance(animation, EffectAnimation):
            self._schedule_effect(animation, start, duration)
            return duration

        if isinstance(animation, AnimationGroup):
            return self._schedule_group(animation, start, duration)

        if isinstance(animation, Succession):
            return self._schedule_succession(animation, start, duration)

        if isinstance(animation, IterableABC):
            elapsed = 0.0
            for child in animation:
                elapsed = max(elapsed, self._schedule(child, start, duration))
            return elapsed

        raise TypeError(f"Unsupported animation: {animation!r}")

    def _schedule_effect(self, animation: EffectAnimation, start: float, duration: float) -> None:
        if animation.create_on_start and animation.target not in self.nodes:
            self.nodes.append(animation.target)
            self.timeline.append(create_op(start, animation.create_state or animation.target))

        self.timeline.append(effect_op(start, animation, duration))
        for child in animation.animations:
            self.timeline.append(animate_op(start, child, duration))

        if animation.delete_on_complete:
            self.timeline.append(delete_op(start + duration, animation.target))
            if animation.target in self.nodes:
                self.nodes.remove(animation.target)

    def _schedule_group(self, group: AnimationGroup, start: float, duration: float) -> float:
        children = list(group.animations)
        if not children:
            return 0.0

        total_duration = group.run_time if group.run_time is not None else duration
        lag_ratio = max(0.0, group.lag_ratio)
        child_duration = total_duration / (1 + lag_ratio * (len(children) - 1))
        elapsed = 0.0
        for index, child in enumerate(children):
            offset = index * lag_ratio * child_duration
            elapsed = max(elapsed, offset + self._schedule(child, start + offset, child_duration))
        return elapsed

    def _schedule_succession(self, succession: Succession, start: float, duration: float) -> float:
        children = list(succession.animations)
        if not children:
            return 0.0

        total_duration = succession.run_time if succession.run_time is not None else duration
        child_duration = total_duration / len(children)
        elapsed = 0.0
        for child in children:
            elapsed += self._schedule(child, start + elapsed, child_duration)
        return elapsed
