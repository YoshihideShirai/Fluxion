from __future__ import annotations

from typing import Any, Dict

from .animation import Animation
from .mobject import Mobject


def create_op(t: float, target: Mobject) -> Dict[str, Any]:
    return {"t": t, "op": "create", "node": target.to_dict()}


def delete_op(t: float, target: Mobject) -> Dict[str, Any]:
    return {"t": t, "op": "delete", "id": target.id}


def animate_op(t: float, animation: Animation, duration: float) -> Dict[str, Any]:
    return {
        "t": t,
        "op": "animate",
        "id": animation.target.id,
        "path": animation.path,
        "from": animation.start_value,
        "to": animation.end_value,
        "duration": duration,
        "easing": animation.easing,
    }
