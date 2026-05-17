from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Iterable, List, Sequence


@dataclass
class Animation:
    target: "Mobject"
    path: str
    start_value: Any
    end_value: Any
    easing: str = "easeInOut"


@dataclass
class EffectAnimation:
    """Semantic animation backed by ordinary timeline operations.

    The ``effect`` name is emitted into the IR so renderers can later implement
    richer reveals, while ``animations`` provides a visible fallback today.
    """

    target: "Mobject"
    effect: str
    animations: Sequence[Animation]
    easing: str = "easeInOut"
    create_on_start: bool = False
    delete_on_complete: bool = False
    create_state: dict[str, Any] | None = None


@dataclass
class AnimationGroup:
    """Play multiple animations together, optionally offset by ``lag_ratio``."""

    animations: Sequence[AnimationInput]
    lag_ratio: float = 0.0
    run_time: float | None = None

    def __init__(self, *animations: AnimationInput, lag_ratio: float = 0.0, run_time: float | None = None) -> None:
        self.animations = animations
        self.lag_ratio = lag_ratio
        self.run_time = run_time


@dataclass
class Succession:
    """Play multiple animations one after another within a single ``Scene.play``."""

    animations: Sequence[AnimationInput]
    run_time: float | None = None

    def __init__(self, *animations: AnimationInput, run_time: float | None = None) -> None:
        self.animations = animations
        self.run_time = run_time


AnimationInput = Animation | EffectAnimation | AnimationGroup | Succession | Iterable["AnimationInput"]


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


def FadeIn(mobject: "Mobject", *, easing: str = "easeInOut") -> EffectAnimation:
    create_state = mobject.to_dict()
    create_state["transform"]["opacity"] = 0
    mobject.set_opacity(1)
    animation = Animation(mobject, "transform.opacity", 0, 1, easing=easing)
    return EffectAnimation(
        target=mobject,
        effect="fadeIn",
        animations=[animation],
        easing=easing,
        create_on_start=True,
        create_state=create_state,
    )


def FadeOut(mobject: "Mobject", *, remove: bool = True, easing: str = "easeInOut") -> EffectAnimation:
    start_opacity = mobject.node.transform["opacity"]
    mobject.set_opacity(0)
    animation = Animation(mobject, "transform.opacity", start_opacity, 0, easing=easing)
    return EffectAnimation(
        target=mobject,
        effect="fadeOut",
        animations=[animation],
        easing=easing,
        delete_on_complete=remove,
    )


def Create(mobject: "Mobject", *, easing: str = "easeInOut") -> EffectAnimation:
    return _reveal_effect(mobject, "create", easing=easing)


def Write(mobject: "Mobject", *, easing: str = "easeInOut") -> EffectAnimation:
    return _reveal_effect(mobject, "write", easing=easing)


def Transform(src: "Mobject", dst: "Mobject", *, easing: str = "easeInOut") -> List[Animation]:
    """Animate geometry/style/transform differences from ``src`` to ``dst``.

    The emitted animations target ``src.id`` so the existing scene node morphs in
    place. ``src`` is updated to the destination state for subsequent operations.
    """

    before = src.to_dict()
    after = dst.to_dict()
    animations = _diff_sections(src, before, after, easing=easing)
    src.node.geometry = deepcopy(dst.node.geometry)
    src.node.style = deepcopy(dst.node.style)
    src.node.transform = deepcopy(dst.node.transform)
    return animations


def ReplacementTransform(src: "Mobject", dst: "Mobject", *, easing: str = "easeInOut") -> AnimationGroup:
    """Fade out ``src`` while fading in ``dst`` as a replacement."""

    return AnimationGroup(FadeOut(src, remove=True, easing=easing), FadeIn(dst, easing=easing))


def TransformMatchingTex(src: "Mobject", dst: "Mobject", *, easing: str = "easeInOut") -> AnimationGroup:
    """Match expanded TeX token children by identical token strings.

    ``src`` and ``dst`` must be ``Math(..., expand_tokens=True)`` objects (or
    compatible mobjects with math children). Source children are matched to the
    first unused destination child with the same ``latex`` token. Matched tokens
    use ``Transform``; unmatched source tokens fade out; unmatched destination
    tokens fade in.
    """

    src_tokens = _tex_token_children(src)
    dst_tokens = _tex_token_children(dst)
    if not src_tokens or not dst_tokens:
        raise ValueError("TransformMatchingTex requires Math(expand_tokens=True) token children.")

    available: dict[str, List[Mobject]] = {}
    for child in dst_tokens:
        token = child.node.latex
        if token is None:
            continue
        available.setdefault(token, []).append(child)

    animations: List[AnimationInput] = []
    matched_dst_ids: set[str] = set()
    for child in src_tokens:
        token = child.node.latex
        match = available.get(token or "")
        if match:
            dst_child = match.pop(0)
            matched_dst_ids.add(dst_child.id)
            animations.append(Transform(child, dst_child, easing=easing))
        else:
            animations.append(FadeOut(child, remove=True, easing=easing))

    for child in dst_tokens:
        if child.id not in matched_dst_ids:
            animations.append(FadeIn(child, easing=easing))

    return AnimationGroup(*animations)


def _tex_token_children(mobject: "Mobject") -> List["Mobject"]:
    return [_mobject_from_node(child) for child in mobject.node.children if child.type == "math" and child.latex is not None]


def _mobject_from_node(node: Any) -> "Mobject":
    from .mobject import Mobject

    mobject = object.__new__(Mobject)
    mobject.node = node
    return mobject


def _reveal_effect(mobject: "Mobject", effect: str, *, easing: str) -> EffectAnimation:
    create_state = mobject.to_dict()
    create_state["transform"]["opacity"] = 0
    mobject.set_opacity(1)
    animation = Animation(mobject, "transform.opacity", 0, 1, easing=easing)
    return EffectAnimation(
        target=mobject,
        effect=effect,
        animations=[animation],
        easing=easing,
        create_on_start=True,
        create_state=create_state,
    )


def _diff_sections(src: "Mobject", before: dict[str, Any], after: dict[str, Any], *, easing: str) -> List[Animation]:
    animations: List[Animation] = []
    for section in ("geometry", "style", "transform"):
        before_section = before.get(section, {})
        after_section = after.get(section, {})
        for key in sorted(before_section.keys() | after_section.keys()):
            start_value = before_section.get(key)
            end_value = after_section.get(key)
            if start_value != end_value:
                animations.append(Animation(src, f"{section}.{key}", start_value, end_value, easing=easing))
    return animations


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .mobject import Mobject
