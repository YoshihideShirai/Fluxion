from __future__ import annotations

from dataclasses import dataclass
from typing import Any, List


@dataclass
class Animation:
    target: "Mobject"
    path: str
    start_value: Any
    end_value: Any
    easing: str = "easeInOut"


class AnimationBuilder:
    def __init__(self, target: "Mobject") -> None:
        from .mobject import resolve_path

        self.target = target
        self._resolve_path = resolve_path
        self._start = target._snapshot_paths()

    def _animation(self, path: str) -> Animation:
        return Animation(
            target=self.target,
            path=path,
            start_value=self._start[path],
            end_value=self._resolve_path(self.target, path),
        )

    def move_to(self, x: float, y: float) -> List[Animation]:
        self.target.move_to(x, y)
        return [self._animation("transform.x"), self._animation("transform.y")]

    def shift(self, dx: float, dy: float) -> List[Animation]:
        self.target.shift(dx, dy)
        return [self._animation("transform.x"), self._animation("transform.y")]

    def scale(self, factor: float) -> Animation:
        self.target.scale(factor)
        return self._animation("transform.scale")

    def rotate(self, degrees: float) -> Animation:
        self.target.rotate(degrees)
        return self._animation("transform.rotation")

    def set_opacity(self, opacity: float) -> Animation:
        self.target.set_opacity(opacity)
        return self._animation("transform.opacity")

    def set_style(self, **style: Any) -> List[Animation]:
        self.target.set_style(**style)
        return [self._animation(f"style.{key}") for key in style]


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .mobject import Mobject
