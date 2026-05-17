from __future__ import annotations

from typing import Iterable

from ..mobject import Mobject


class Group(Mobject):
    """Container mobject whose child ids must be unique document-wide.

    Timeline operations resolve node ids globally, so every child passed to a
    group must use an id that is unique across the whole Fluxion document, not
    just within this group.
    """

    def __init__(self, id: str, *children: Mobject, **kwargs) -> None:
        super().__init__(id=id, type="group", children=children, **kwargs)
