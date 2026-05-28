from __future__ import annotations

from collections.abc import Iterable
from typing import Union

from ..mobject import Mobject

Pixel = Union[int, float]
PixelRows = Iterable[Iterable[Pixel]]


class ImageMobject(Mobject):
    def __init__(
        self,
        id: str,
        data: PixelRows | str,
        w: float = 100,
        h: float = 100,
        data_rows: int | None = None,
        sampling: str = "nearest",
        **kwargs,
    ) -> None:
        geometry = {"w": w, "h": h, "data": _serialize_pixels(data), "sampling": sampling}
        if data_rows is not None:
            geometry["dataRows"] = max(0, int(data_rows))
        super().__init__(id=id, type="image", geometry=geometry, **kwargs)


Image = ImageMobject


def _serialize_pixels(data: PixelRows | str) -> str:
    if isinstance(data, str):
        return data
    rows: list[str] = []
    for row in data:
        values = []
        for value in row:
            gray = max(0, min(255, round(float(value))))
            values.append(str(gray))
        if values:
            rows.append(",".join(values))
    return ";".join(rows)
