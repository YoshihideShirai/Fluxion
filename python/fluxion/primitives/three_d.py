from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable, Tuple

from ..mobject import Mobject
from .line import Line
from .path import Path

Point2 = Tuple[float, float]
Point3 = Tuple[float, float, float]


def _format_path_number(value: float) -> str:
    if abs(value) < 0.0000005:
        return "0"
    return str(round(value, 6)).rstrip("0").rstrip(".") if "." in str(round(value, 6)) else str(round(value, 6))


def _shade_hex_color_by_delta(hex_color: str, delta: float) -> str:
    value = hex_color[1:] if hex_color.startswith("#") else hex_color
    if len(value) != 6:
        return hex_color
    try:
        rgb = [int(value[offset : offset + 2], 16) for offset in (0, 2, 4)]
    except ValueError:
        return hex_color
    return "#" + "".join(f"{round(max(0, min(255, component + delta * 255))):02x}" for component in rgb)


def _normalize3d(vector: Point3) -> Point3:
    length = math.sqrt(sum(component * component for component in vector)) or 1
    return tuple(component / length for component in vector)  # type: ignore[return-value]


def _face_path(points: Iterable[Point2]) -> str:
    commands = []
    for index, (x, y) in enumerate(points):
        commands.append(f"{'M' if index == 0 else 'L'} {_format_path_number(x)} {_format_path_number(y)}")
    commands.append("Z")
    return " ".join(commands)


def _axis_value_id(value: float) -> str:
    if value == 0:
        return "0"
    return _format_path_number(value).replace("-", "m").replace(".", "p")


def _axis_tick_values(min_value: float, max_value: float, step: float) -> list[float]:
    values = []
    if step > 0:
        value = math.ceil(min_value / step) * step
        while value <= max_value + 1e-9:
            values.append(round(value, 8))
            value += step
    else:
        value = math.floor(max_value / step) * step
        while value >= min_value - 1e-9:
            values.append(round(value, 8))
            value += step
    return values


def _normalize2d(vector: Point2) -> Point2:
    length = math.hypot(vector[0], vector[1]) or 1
    return (vector[0] / length, vector[1] / length)


def _projected_circle_path(radius: float, x_basis: Point2, y_basis: Point2) -> str:
    kappa = 0.5522847498307936

    def point(x: float, y: float) -> str:
        return (
            f"{_format_path_number(radius * (x * x_basis[0] + y * y_basis[0]))} "
            f"{_format_path_number(radius * (x * x_basis[1] + y * y_basis[1]))}"
        )

    return " ".join(
        [
            f"M {point(1, 0)}",
            f"C {point(1, kappa)} {point(kappa, 1)} {point(0, 1)}",
            f"C {point(-kappa, 1)} {point(-1, kappa)} {point(-1, 0)}",
            f"C {point(-1, -kappa)} {point(-kappa, -1)} {point(0, -1)}",
            f"C {point(kappa, -1)} {point(1, -kappa)} {point(1, 0)}",
            "Z",
        ]
    )


def _js_number_string(value: float) -> str:
    if abs(value) < 0.0000000000005:
        return "0"
    if float(value).is_integer():
        return str(int(value))
    return repr(value)


def _smooth_closed_path(points: list[Point2]) -> str:
    if len(points) < 3:
        commands = [f"{'M' if index == 0 else 'L'} {_js_number_string(x)} {_js_number_string(y)}" for index, (x, y) in enumerate(points)]
        commands.append("Z")
        return " ".join(commands)

    commands = [f"M {_js_number_string(points[0][0])} {_js_number_string(points[0][1])}"]
    count = len(points)
    for index, current in enumerate(points):
        previous = points[(index - 1) % count]
        next_point = points[(index + 1) % count]
        after_next = points[(index + 2) % count]
        c1 = (
            current[0] + (next_point[0] - previous[0]) / 6,
            current[1] + (next_point[1] - previous[1]) / 6,
        )
        c2 = (
            next_point[0] - (after_next[0] - current[0]) / 6,
            next_point[1] - (after_next[1] - current[1]) / 6,
        )
        commands.append(
            "C "
            f"{_js_number_string(c1[0])} {_js_number_string(c1[1])} "
            f"{_js_number_string(c2[0])} {_js_number_string(c2[1])} "
            f"{_js_number_string(next_point[0])} {_js_number_string(next_point[1])}"
        )
    commands.append("Z")
    return " ".join(commands)


def _manim_camera_projected_circle_path(
    radius: float,
    *,
    phi: float = 75,
    theta: float = 30,
    gamma: float = 0,
    unit_scale: float = 108.75,
    focal_distance: float = 20,
    zoom: float = 1,
    samples: int = 64,
) -> str:
    sample_count = max(8, round(samples))
    points = []
    for index in range(sample_count):
        alpha = math.tau * index / sample_count
        x, y = _project_manim_camera_point(
            (math.cos(alpha) * radius, math.sin(alpha) * radius, 0),
            phi=phi,
            theta=theta,
            gamma=gamma,
            unit_scale=unit_scale,
            focal_distance=focal_distance,
            zoom=zoom,
        )
        points.append((float(_format_path_number(x)), float(_format_path_number(y))))
    return _smooth_closed_path(points)


def _project_manim_camera_point(
    point: Point3,
    *,
    phi: float,
    theta: float,
    gamma: float,
    unit_scale: float,
    focal_distance: float,
    zoom: float,
) -> Point2:
    phi_rad = math.radians(phi)
    theta_rad = math.radians(theta)
    gamma_rad = math.radians(gamma)

    def multiply(left: list[list[float]], right: list[list[float]]) -> list[list[float]]:
        return [[sum(left[row][index] * right[index][col] for index in range(3)) for col in range(3)] for row in range(3)]

    def rot_z(angle: float) -> list[list[float]]:
        c = math.cos(angle)
        s = math.sin(angle)
        return [[c, -s, 0], [s, c, 0], [0, 0, 1]]

    def rot_x(angle: float) -> list[list[float]]:
        c = math.cos(angle)
        s = math.sin(angle)
        return [[1, 0, 0], [0, c, -s], [0, s, c]]

    matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    for rotation in [rot_z(-theta_rad - math.pi / 2), rot_x(-phi_rad), rot_z(gamma_rad)]:
        matrix = multiply(rotation, matrix)
    rotated_x = sum(matrix[0][index] * point[index] for index in range(3))
    rotated_y = sum(matrix[1][index] * point[index] for index in range(3))
    rotated_z = sum(matrix[2][index] * point[index] for index in range(3))
    factor = focal_distance / (focal_distance - rotated_z) * zoom * unit_scale
    return (rotated_x * factor, -rotated_y * factor)


def _project_manim_camera_point_with_depth(
    point: Point3,
    *,
    phi: float,
    theta: float,
    gamma: float,
    unit_scale: float,
    focal_distance: float,
    zoom: float,
) -> tuple[float, float, float]:
    x, y = _project_manim_camera_point(
        point,
        phi=phi,
        theta=theta,
        gamma=gamma,
        unit_scale=unit_scale,
        focal_distance=focal_distance,
        zoom=zoom,
    )

    phi_rad = math.radians(phi)
    theta_rad = math.radians(theta)
    gamma_rad = math.radians(gamma)

    def multiply(left: list[list[float]], right: list[list[float]]) -> list[list[float]]:
        return [[sum(left[row][index] * right[index][col] for index in range(3)) for col in range(3)] for row in range(3)]

    def rot_z(angle: float) -> list[list[float]]:
        c = math.cos(angle)
        s = math.sin(angle)
        return [[c, -s, 0], [s, c, 0], [0, 0, 1]]

    def rot_x(angle: float) -> list[list[float]]:
        c = math.cos(angle)
        s = math.sin(angle)
        return [[1, 0, 0], [0, c, -s], [0, s, c]]

    matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    for rotation in [rot_z(-theta_rad - math.pi / 2), rot_x(-phi_rad), rot_z(gamma_rad)]:
        matrix = multiply(rotation, matrix)
    rotated_z = sum(matrix[2][index] * point[index] for index in range(3))
    return (x, y, rotated_z)


@dataclass(frozen=True)
class _Face:
    row: int
    col: int
    shade: float
    depth: float
    points: tuple[Point2, Point2, Point2, Point2]


class ThreeDAxes(Mobject):
    """Projected ThreeDAxes helper matching the Text DSL `threeDAxes` node."""

    def __init__(
        self,
        id: str,
        *,
        x_range: tuple[float, float, float] = (-6, 6, 1),
        y_range: tuple[float, float, float] = (-5, 5, 1),
        z_range: tuple[float, float, float] = (-4, 4, 1),
        x_basis: Point2 = (43.333333, 21.333333),
        y_basis: Point2 = (-47.6, 23.6),
        z_basis: Point2 = (0, -60),
        stroke: str = "#FFFFFF",
        stroke_width: float = 2,
        tick_size: float = 10,
        tick_stroke_width: float = 2,
        include_ticks: bool = True,
        include_tips: bool = True,
        tip_length: float = 18,
        tip_width: float = 14,
        x_length: float | None = 10.5,
        y_length: float | None = 10.5,
        z_length: float | None = 6.5,
        phi: float | None = None,
        theta: float | None = None,
        gamma: float = 0,
        unit_scale: float = 108.75,
        focal_distance: float = 20,
        zoom: float = 1,
        **kwargs,
    ) -> None:
        children = []
        has_camera_projection = phi is not None or theta is not None
        x_length = 10.5 if x_length is None else x_length
        y_length = 10.5 if y_length is None else y_length
        z_length = 6.5 if z_length is None else z_length
        if has_camera_projection:
            camera_kwargs = {
                "phi": 75 if phi is None else phi,
                "theta": 30 if theta is None else theta,
                "gamma": gamma,
                "unit_scale": unit_scale,
                "focal_distance": focal_distance,
                "zoom": zoom,
            }
            for axis, axis_range, axis_length in (("x", x_range, x_length), ("y", y_range, y_length), ("z", z_range, z_length)):
                children.extend(
                    _manim_camera_projected_axis_children(
                        id,
                        axis,
                        axis_range,
                        axis_length,
                        stroke,
                        stroke_width,
                        tick_size,
                        tick_stroke_width,
                        include_ticks,
                        include_tips,
                        tip_length,
                        tip_width,
                        **camera_kwargs,
                    )
                )
        else:
            children.extend(
                _projected_axis_children(
                    id,
                    "x",
                    x_range,
                    x_basis,
                    (-x_basis[1], x_basis[0]),
                    stroke,
                    stroke_width,
                    tick_size,
                    tick_stroke_width,
                    include_ticks,
                    include_tips,
                    tip_length,
                    tip_width,
                )
            )
            children.extend(
                _projected_axis_children(
                    id,
                    "y",
                    y_range,
                    y_basis,
                    (-y_basis[1], y_basis[0]),
                    stroke,
                    stroke_width,
                    tick_size,
                    tick_stroke_width,
                    include_ticks,
                    include_tips,
                    tip_length,
                    tip_width,
                )
            )
            children.extend(
                _projected_axis_children(
                    id,
                    "z",
                    z_range,
                    z_basis,
                    (1, 0),
                    stroke,
                    stroke_width,
                    tick_size,
                    tick_stroke_width,
                    include_ticks,
                    include_tips,
                    tip_length,
                    tip_width,
                )
            )
        super().__init__(id=id, type="group", children=children, **kwargs)
        self.node.geometry.update({
            "threeDAxes": True,
            "xRange": list(x_range),
            "yRange": list(y_range),
            "zRange": list(z_range),
            "xLength": x_length,
            "yLength": y_length,
            "zLength": z_length,
        })
        if has_camera_projection:
            self.node.geometry.update({"cameraProjection": "manim", "phi": 75 if phi is None else phi, "theta": 30 if theta is None else theta})


def _projected_axis_children(
    group_id: str,
    axis: str,
    axis_range: tuple[float, float, float],
    basis: Point2,
    tick_basis: Point2,
    stroke: str,
    stroke_width: float,
    tick_size: float,
    tick_stroke_width: float,
    include_ticks: bool,
    include_tips: bool,
    tip_length: float,
    tip_width: float,
) -> list[Mobject]:
    min_value, max_value, step = axis_range
    children: list[Mobject] = [
        Line(
            id=f"{group_id}:{axis}:axis",
            x1=min_value * basis[0],
            y1=min_value * basis[1],
            x2=max_value * basis[0],
            y2=max_value * basis[1],
            style={"fill": "#ffffff", "stroke": stroke, "strokeWidth": stroke_width},
        )
    ]
    if include_ticks:
        tick_normal = _normalize2d(tick_basis)
        for value in _axis_tick_values(min_value, max_value, step):
            if abs(value) < 1e-9:
                continue
            x = value * basis[0]
            y = value * basis[1]
            children.append(
                Line(
                    id=f"{group_id}:{axis}:tick:{_axis_value_id(value)}",
                    x1=x - tick_normal[0] * tick_size,
                    y1=y - tick_normal[1] * tick_size,
                    x2=x + tick_normal[0] * tick_size,
                    y2=y + tick_normal[1] * tick_size,
                    style={"fill": "#ffffff", "stroke": stroke, "strokeWidth": tick_stroke_width},
                )
            )
    if include_tips:
        direction = _normalize2d(basis)
        tip_point = (max_value * basis[0], max_value * basis[1])
        base = (tip_point[0] - direction[0] * tip_length, tip_point[1] - direction[1] * tip_length)
        normal = (-direction[1], direction[0])
        path = " ".join(
            [
                f"M {_format_path_number(tip_point[0])} {_format_path_number(tip_point[1])}",
                f"L {_format_path_number(base[0] + normal[0] * tip_width / 2)} {_format_path_number(base[1] + normal[1] * tip_width / 2)}",
                f"L {_format_path_number(base[0] - normal[0] * tip_width / 2)} {_format_path_number(base[1] - normal[1] * tip_width / 2)}",
                "Z",
            ]
        )
        children.append(
            Path(id=f"{group_id}:{axis}:tip", d=path, style={"fill": stroke, "fillOpacity": 1, "stroke": stroke, "strokeWidth": 0})
        )
    return children


def _manim_camera_projected_axis_children(
    group_id: str,
    axis: str,
    axis_range: tuple[float, float, float],
    axis_length: float,
    stroke: str,
    stroke_width: float,
    tick_size: float,
    tick_stroke_width: float,
    include_ticks: bool,
    include_tips: bool,
    tip_length: float,
    tip_width: float,
    *,
    phi: float,
    theta: float,
    gamma: float,
    unit_scale: float,
    focal_distance: float,
    zoom: float,
) -> list[Mobject]:
    min_value, max_value, step = axis_range

    def axis_point(value: float) -> float:
        if abs(max_value - min_value) < 1e-9:
            return 0
        return ((value - min_value) / (max_value - min_value) - 0.5) * axis_length

    def point_at(value: float) -> Point2:
        coordinate = axis_point(value)
        if axis == "x":
            point = (coordinate, 0, 0)
        elif axis == "y":
            point = (0, coordinate, 0)
        else:
            point = (0, 0, coordinate)
        return _project_manim_camera_point(
            point,
            phi=phi,
            theta=theta,
            gamma=gamma,
            unit_scale=unit_scale,
            focal_distance=focal_distance,
            zoom=zoom,
        )

    def tangent_at(value: float) -> Point2:
        delta = max(abs(step or 1) * 0.001, 0.001)
        before = point_at(value - delta)
        after = point_at(value + delta)
        return _normalize2d((after[0] - before[0], after[1] - before[1]))

    start = point_at(min_value)
    end = point_at(max_value)
    children: list[Mobject] = [
        Line(
            id=f"{group_id}:{axis}:axis",
            x1=start[0],
            y1=start[1],
            x2=end[0],
            y2=end[1],
            style={"fill": "#ffffff", "stroke": stroke, "strokeWidth": stroke_width},
        )
    ]
    if include_ticks:
        for value in _axis_tick_values(min_value, max_value, step):
            if abs(value) < 1e-9:
                continue
            point = point_at(value)
            tangent = tangent_at(value)
            normal = (1, 0) if axis == "z" else (-tangent[1], tangent[0])
            children.append(
                Line(
                    id=f"{group_id}:{axis}:tick:{_axis_value_id(value)}",
                    x1=point[0] - normal[0] * tick_size,
                    y1=point[1] - normal[1] * tick_size,
                    x2=point[0] + normal[0] * tick_size,
                    y2=point[1] + normal[1] * tick_size,
                    style={"fill": "#ffffff", "stroke": stroke, "strokeWidth": tick_stroke_width},
                )
            )
    if include_tips:
        direction = tangent_at(max_value)
        tip_point = point_at(max_value)
        base = (tip_point[0] - direction[0] * tip_length, tip_point[1] - direction[1] * tip_length)
        normal = (-direction[1], direction[0])
        path = " ".join(
            [
                f"M {_format_path_number(tip_point[0])} {_format_path_number(tip_point[1])}",
                f"L {_format_path_number(base[0] + normal[0] * tip_width / 2)} {_format_path_number(base[1] + normal[1] * tip_width / 2)}",
                f"L {_format_path_number(base[0] - normal[0] * tip_width / 2)} {_format_path_number(base[1] - normal[1] * tip_width / 2)}",
                "Z",
            ]
        )
        children.append(
            Path(id=f"{group_id}:{axis}:tip", d=path, style={"fill": stroke, "fillOpacity": 1, "stroke": stroke, "strokeWidth": 0})
        )
    return children


class ProjectedCircle(Path):
    """Projected XY-plane circle helper matching Text DSL `projectedCircle`."""

    def __init__(
        self,
        id: str,
        *,
        radius: float = 1,
        x_basis: Point2 = (-56.75, 25.5),
        y_basis: Point2 = (87.75, 13.25),
        phi: float | None = None,
        theta: float | None = None,
        gamma: float = 0,
        unit_scale: float = 108.75,
        focal_distance: float = 20,
        zoom: float = 1,
        samples: int = 64,
        fill: str = "none",
        stroke: str = "#FFFFFF",
        stroke_width: float = 4,
        **kwargs,
    ) -> None:
        style = {"fill": fill, "stroke": stroke, "strokeWidth": stroke_width}
        style.update(kwargs.pop("style", {}) or {})
        has_camera_projection = phi is not None or theta is not None
        super().__init__(
            id=id,
            d=_manim_camera_projected_circle_path(
                radius,
                phi=75 if phi is None else phi,
                theta=30 if theta is None else theta,
                gamma=gamma,
                unit_scale=unit_scale,
                focal_distance=focal_distance,
                zoom=zoom,
                samples=samples,
            )
            if has_camera_projection
            else _projected_circle_path(radius, x_basis, y_basis),
            style=style,
            **kwargs,
        )
        self.node.geometry.update({"projectedCircle": True, "radius": radius})
        if has_camera_projection:
            self.node.geometry.update({"cameraProjection": "manim", "phi": 75 if phi is None else phi, "theta": 30 if theta is None else theta})


class GaussianSurface(Mobject):
    """Projected checkerboard Gaussian surface matching the Text DSL helper.

    This is intentionally a projected 2D mesh, not a native 3D runtime object.
    It mirrors the Manim gallery `Surface(param_gauss)` port by emitting path
    faces directly into the exported scene graph.
    """

    def __init__(
        self,
        id: str,
        *,
        u_range: tuple[float, float] = (-2, 2),
        v_range: tuple[float, float] = (-2, 2),
        resolution: int = 24,
        scale: float = 2,
        sigma: float = 0.4,
        mu: tuple[float, float] = (0, 0),
        x_basis: Point2 = (63, 31),
        y_basis: Point2 = (-60, 30),
        z_basis: Point2 = (0, -130),
        fill_a: str = "#FF862F",
        fill_b: str = "#58C4DD",
        stroke: str = "#83C167",
        stroke_width: float = 0.5,
        fill_opacity: float = 0.5,
        shade: bool = False,
        shade_strength: float = 1,
        light: Point3 = (-7, -9, 10),
        phi: float | None = None,
        theta: float | None = None,
        gamma: float = 0,
        unit_scale: float = 108.75,
        focal_distance: float = 20,
        zoom: float = 1,
        **kwargs,
    ) -> None:
        resolution = max(1, round(resolution))
        u0, u1 = u_range
        v0, v1 = v_range
        mu_x, mu_y = mu
        has_camera_projection = phi is not None or theta is not None
        camera_kwargs = {
            "phi": 75 if phi is None else phi,
            "theta": 30 if theta is None else theta,
            "gamma": gamma,
            "unit_scale": unit_scale,
            "focal_distance": focal_distance,
            "zoom": zoom,
        }

        def gaussian_height_and_normal(u: float, v: float) -> tuple[float, Point3]:
            dx = u - mu_x
            dy = v - mu_y
            height = math.exp(-((dx**2 + dy**2) / (2 * sigma**2)))
            sigma_squared = sigma**2 or 1
            dzdu = height * (-dx / sigma_squared)
            dzdv = height * (-dy / sigma_squared)
            normal = _normalize3d((-dzdu, -dzdv, 1))
            return (height, normal)

        def project(u: float, v: float) -> tuple[float, float, float, float]:
            z, _ = gaussian_height_and_normal(u, v)
            x = u * scale
            y = v * scale
            projected_z = z * scale
            if has_camera_projection:
                projected = _project_manim_camera_point_with_depth((x, y, projected_z), **camera_kwargs)
                return (projected[0], projected[1], z, projected[2])
            return (
                x * x_basis[0] + y * y_basis[0] + projected_z * z_basis[0],
                x * x_basis[1] + y * y_basis[1] + projected_z * z_basis[1],
                z,
                x + y - projected_z,
            )

        faces: list[_Face] = []
        for row in range(resolution):
            va = v0 + (v1 - v0) * (row / resolution)
            vb = v0 + (v1 - v0) * ((row + 1) / resolution)
            for col in range(resolution):
                ua = u0 + (u1 - u0) * (col / resolution)
                ub = u0 + (u1 - u0) * ((col + 1) / resolution)
                points3d = [project(ua, va), project(ub, va), project(ub, vb), project(ua, vb)]
                mid_u = (ua + ub) / 2
                mid_v = (va + vb) / 2
                height, normal = gaussian_height_and_normal(mid_u, mid_v)
                point = (mid_u * scale, mid_v * scale, height * scale)
                to_light = _normalize3d(tuple(light[index] - point[index] for index in range(3)))  # type: ignore[arg-type]
                light_dot = sum(normal[index] * to_light[index] for index in range(3))
                light_amount = 0.5 * light_dot**3
                if light_amount < 0:
                    light_amount *= 0.5
                faces.append(
                    _Face(
                        row=row,
                        col=col,
                        shade=light_amount * shade_strength,
                        depth=sum(point[3] for point in points3d) / len(points3d),
                        points=tuple((point[0], point[1]) for point in points3d),  # type: ignore[arg-type]
                    )
                )
        faces.sort(key=lambda face: face.depth)

        children = []
        for index, face in enumerate(faces):
            base_fill = fill_a if (face.row + face.col) % 2 == 0 else fill_b
            fill = _shade_hex_color_by_delta(base_fill, face.shade) if shade else base_fill
            children.append(
                Path(
                    id=f"{id}:face:{index}",
                    d=_face_path(face.points),
                    style={"fill": fill, "fillOpacity": fill_opacity, "stroke": stroke, "strokeWidth": stroke_width},
                )
            )

        super().__init__(id=id, type="group", children=children, **kwargs)
        self.node.geometry.update(
            {
                "gaussianSurface": True,
                "uMin": u0,
                "uMax": u1,
                "vMin": v0,
                "vMax": v1,
                "resolution": resolution,
                "sigma": sigma,
                "mu": [mu_x, mu_y],
                "scale": scale,
                "xBasis": list(x_basis),
                "yBasis": list(y_basis),
                "zBasis": list(z_basis),
                "shade": shade,
                "light": list(light),
            }
        )
        if has_camera_projection:
            self.node.geometry.update({"cameraProjection": "manim", "phi": camera_kwargs["phi"], "theta": camera_kwargs["theta"]})


class SphereSurface(Mobject):
    """Projected shaded checkerboard sphere matching the Text DSL helper."""

    def __init__(
        self,
        id: str,
        *,
        radius: float = 104,
        world_radius: float = 1,
        u_range: tuple[float, float] = (-1.57079632679, 1.57079632679),
        v_range: tuple[float, float] = (0, 6.28318530718),
        resolution: tuple[int, int] = (15, 32),
        x_basis: Point2 | None = None,
        y_basis: Point2 | None = None,
        z_basis: Point2 | None = None,
        fill_a: str = "#E65A4C",
        fill_b: str = "#CF5044",
        stroke: str = "#BBBBBB",
        stroke_width: float = 0.5,
        fill_opacity: float = 1,
        shade: bool = True,
        light: Point3 = (0, 0, -3),
        phi: float | None = None,
        theta: float | None = None,
        gamma: float = 0,
        unit_scale: float = 108.75,
        focal_distance: float = 20,
        zoom: float = 1,
        **kwargs,
    ) -> None:
        u_resolution = max(1, round(resolution[0]))
        v_resolution = max(1, round(resolution[1]))
        u0, u1 = u_range
        v0, v1 = v_range
        has_projection_basis = x_basis is not None or y_basis is not None or z_basis is not None
        has_camera_projection = phi is not None or theta is not None
        camera_kwargs = {
            "phi": 75 if phi is None else phi,
            "theta": 30 if theta is None else theta,
            "gamma": gamma,
            "unit_scale": unit_scale,
            "focal_distance": focal_distance,
            "zoom": zoom,
        }
        x_basis = x_basis or (radius, 0)
        y_basis = y_basis or (0, radius * 0.18)
        z_basis = z_basis or (0, -radius)

        def project(u: float, v: float) -> tuple[float, float, float, float]:
            cu = math.cos(u)
            x = cu * math.cos(v)
            y = cu * math.sin(v)
            z = math.sin(u)
            if has_camera_projection:
                scaled_x = x * world_radius
                scaled_y = y * world_radius
                scaled_z = z * world_radius
                projected = _project_manim_camera_point_with_depth((scaled_x, scaled_y, scaled_z), **camera_kwargs)
                return (projected[0], projected[1], z, projected[2])
            if has_projection_basis:
                scaled_x = x * world_radius
                scaled_y = y * world_radius
                scaled_z = z * world_radius
                return (
                    scaled_x * x_basis[0] + scaled_y * y_basis[0] + scaled_z * z_basis[0],
                    scaled_x * x_basis[1] + scaled_y * y_basis[1] + scaled_z * z_basis[1],
                    z,
                    0.25 * scaled_x + 0.35 * scaled_y + scaled_z,
                )
            return (radius * x, radius * (-z + 0.18 * y), z, 0.25 * x + 0.35 * y + z)

        faces: list[_Face] = []
        for row in range(u_resolution):
            ua = u0 + (u1 - u0) * (row / u_resolution)
            ub = u0 + (u1 - u0) * ((row + 1) / u_resolution)
            for col in range(v_resolution):
                va = v0 + (v1 - v0) * (col / v_resolution)
                vb = v0 + (v1 - v0) * ((col + 1) / v_resolution)
                points3d = [project(ua, va), project(ub, va), project(ub, vb), project(ua, vb)]
                mid_u = (ua + ub) / 2
                mid_v = (va + vb) / 2
                cm = math.cos(mid_u)
                normal = (cm * math.cos(mid_v), cm * math.sin(mid_v), math.sin(mid_u))
                point = tuple(component * world_radius for component in normal)
                to_light = _normalize3d(tuple(light[index] - point[index] for index in range(3)))  # type: ignore[arg-type]
                light_dot = sum(normal[index] * to_light[index] for index in range(3))
                light_amount = 0.5 * light_dot**3
                if light_amount < 0:
                    light_amount *= 0.5
                faces.append(
                    _Face(
                        row=row,
                        col=col,
                        shade=light_amount if shade else 0,
                        depth=sum(point[3] for point in points3d) / len(points3d),
                        points=tuple((point[0], point[1]) for point in points3d),  # type: ignore[arg-type]
                    )
                )
        faces.sort(key=lambda face: face.depth)

        children = []
        for index, face in enumerate(faces):
            base_fill = fill_a if (face.row + face.col) % 2 == 0 else fill_b
            fill = _shade_hex_color_by_delta(base_fill, face.shade) if shade else base_fill
            children.append(
                Path(
                    id=f"{id}:face:{index}",
                    d=_face_path(face.points),
                    style={"fill": fill, "fillOpacity": fill_opacity, "stroke": stroke, "strokeWidth": stroke_width},
                )
            )

        super().__init__(id=id, type="group", children=children, **kwargs)
        self.node.geometry.update(
            {
                "sphereSurface": True,
                "uMin": u0,
                "uMax": u1,
                "vMin": v0,
                "vMax": v1,
                "uResolution": u_resolution,
                "vResolution": v_resolution,
                "radius": radius,
                "worldRadius": world_radius,
                "light": list(light),
            }
        )
        if has_projection_basis:
            self.node.geometry.update({"xBasis": list(x_basis), "yBasis": list(y_basis), "zBasis": list(z_basis)})
        if has_camera_projection:
            self.node.geometry.update({"cameraProjection": "manim", "phi": camera_kwargs["phi"], "theta": camera_kwargs["theta"]})
