from __future__ import annotations

from typing import Any, Dict

from .animation import Animation, EffectAnimation
from .mobject import Mobject


def create_op(t: float, target: Mobject | dict[str, Any]) -> Dict[str, Any]:
    node = target if isinstance(target, dict) else target.to_dict()
    return {"t": t, "op": "create", "node": node}


def delete_op(t: float, target: Mobject) -> Dict[str, Any]:
    return {"t": t, "op": "delete", "id": target.id}


def effect_op(t: float, animation: EffectAnimation, duration: float) -> Dict[str, Any]:
    return {
        "t": t,
        "op": "effect",
        "id": animation.target.id,
        "effect": animation.effect,
        "duration": duration,
        "easing": animation.easing,
    }


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
