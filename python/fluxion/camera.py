from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, List

from .animation import Animation


DEFAULT_CAMERA = {
    "x": 0.0,
    "y": 0.0,
    "scale": 1.0,
    "rotation": 0.0,
}


class CameraFrame:
    """Scene-level camera frame exported as ``FluxionDocument.camera``."""

    id = "camera"

    def __init__(self, x: float = 0.0, y: float = 0.0, scale: float = 1.0, rotation: float = 0.0) -> None:
        self.state: Dict[str, float] = {"x": x, "y": y, "scale": scale, "rotation": rotation}

    @property
    def animate(self) -> "CameraAnimationBuilder":
        return CameraAnimationBuilder(self)

    def move_to(self, x: float, y: float) -> "CameraFrame":
        self.state["x"] = x
        self.state["y"] = y
        return self

    def shift(self, dx: float, dy: float) -> "CameraFrame":
        self.state["x"] += dx
        self.state["y"] += dy
        return self

    def set_scale(self, scale: float) -> "CameraFrame":
        self.state["scale"] = scale
        return self

    def rotate(self, degrees: float) -> "CameraFrame":
        self.state["rotation"] = degrees
        return self

    def to_dict(self) -> Dict[str, float]:
        return deepcopy(self.state)

    def _snapshot_paths(self) -> Dict[str, Any]:
        return {f"camera.{key}": value for key, value in self.state.items()}


class CameraAnimationBuilder:
    def __init__(self, target: CameraFrame) -> None:
        self.target = target
        self._start = target._snapshot_paths()

    def _animation(self, path: str) -> Animation:
        return Animation(
            target=self.target,  # type: ignore[arg-type]
            path=path,
            start_value=self._start[path],
            end_value=deepcopy(self.target.state[path.split(".")[-1]]),
        )

    def move_to(self, x: float, y: float) -> List[Animation]:
        self.target.move_to(x, y)
        return [self._animation("camera.x"), self._animation("camera.y")]

    def shift(self, dx: float, dy: float) -> List[Animation]:
        self.target.shift(dx, dy)
        return [self._animation("camera.x"), self._animation("camera.y")]

    def set_scale(self, scale: float) -> Animation:
        self.target.set_scale(scale)
        return self._animation("camera.scale")

    def rotate(self, degrees: float) -> Animation:
        self.target.rotate(degrees)
        return self._animation("camera.rotation")
