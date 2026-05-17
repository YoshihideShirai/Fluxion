from __future__ import annotations

from pathlib import Path
from typing import Type

from .scene import Scene


def export_scene(scene_class: Type[Scene], path: str | Path) -> Path:
    scene = scene_class()
    scene.construct()
    return scene.export_json(path)
