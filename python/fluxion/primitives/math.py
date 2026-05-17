from __future__ import annotations

import re
from typing import List

from ..mobject import Mobject

_LATEX_TOKEN_RE = re.compile(
    r"""
    (\\[a-zA-Z]+\*?)        # LaTeX commands, e.g. \\frac or \left
    |(\\.)                  # escaped one-character symbols, e.g. \\{ or \\_
    |([_^])                  # script operators
    |([{}])                  # grouping braces
    |(\s+)                  # whitespace runs
    |([^\\\s_^{}])          # ordinary single characters
    """,
    re.VERBOSE,
)


class Math(Mobject):
    def __init__(
        self,
        id: str,
        latex: str,
        font_size: float = 36,
        renderer: str = "katex",
        expand_tokens: bool = False,
        **kwargs,
    ) -> None:
        children = kwargs.pop("children", None)
        if expand_tokens and children is None:
            children = latex_to_token_mobjects(id, latex, font_size=font_size, renderer=renderer)
        super().__init__(
            id=id,
            type="math",
            geometry={"fontSize": font_size},
            latex=latex,
            renderer=renderer,
            children=children,
            **kwargs,
        )


def tokenize_latex(latex: str) -> List[str]:
    """Split LaTeX into stable token strings for future TransformMatchingTex work."""

    return [match.group(0) for match in _LATEX_TOKEN_RE.finditer(latex) if not match.group(0).isspace()]


def latex_to_token_mobjects(
    parent_id: str,
    latex: str,
    font_size: float = 36,
    renderer: str = "katex",
) -> List[Math]:
    """Expand LaTeX into child Math mobjects, one child per token/span.

    The child positions are intentionally approximate. They provide semantic,
    stable token nodes that TransformMatchingTex-style animations can match
    later; browser renderers may still render the parent expression as the
    visual source of truth.
    """

    tokens = tokenize_latex(latex)
    if not tokens:
        return []

    cursor = -sum(_token_width(token, font_size) for token in tokens) / 2
    children: List[Math] = []
    for index, token in enumerate(tokens):
        width = _token_width(token, font_size)
        child = Math(id=f"{parent_id}:tex:{index}", latex=token, font_size=font_size, renderer=renderer)
        child.node.transform["x"] = cursor + width / 2
        child.node.geometry["w"] = width
        children.append(child)
        cursor += width
    return children


def _token_width(token: str, font_size: float) -> float:
    if token.startswith("\\") and len(token) > 2:
        return font_size * 0.9
    if token in {"^", "_", "{", "}"}:
        return font_size * 0.35
    return max(font_size * 0.45, len(token) * font_size * 0.55)
