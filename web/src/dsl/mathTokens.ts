import type { SceneNode, Style } from "../types.js";
import { DslCompileError } from "./errors.js";

const LATEX_TOKEN_PATTERN = /\\[a-zA-Z]+\*?|\\.|[_^]|[{}]|\s+|[^\\\s_^{}]/gu;
const TOKEN_PADDING_UNITS = 0.26;
const SCRIPTED_DELIMITED_PADDING_UNITS = 0.5;

export function expandMathTokens(node: SceneNode, lineNumber: number): void {
  if (node.type !== "math")
    throw new DslCompileError(
      "expandTokens is only supported for math nodes.",
      lineNumber,
    );
  if (node.latex === undefined)
    throw new DslCompileError(
      "Expected math LaTeX before expandTokens.",
      lineNumber,
    );
  node.children = latexToTokenNodes(
    node.id,
    node.latex,
    Number(node.geometry.fontSize ?? 36),
    node.renderer ?? "katex",
    node.style,
  );
}

function tokenizeLatex(latex: string): string[] {
  const rawTokens = [...latex.matchAll(LATEX_TOKEN_PATTERN)]
    .map((match) => match[0])
    .filter((token) => !/^\s+$/u.test(token));
  const tokens: string[] = [];

  for (let index = 0; index < rawTokens.length; index += 1) {
    let token = rawTokens[index] ?? "";
    const grouped = maybeReadScriptedDelimitedGroup(rawTokens, index);
    if (grouped) {
      token = grouped.token;
      index = grouped.nextIndex - 1;
    }

    while (rawTokens[index + 1] === "^" || rawTokens[index + 1] === "_") {
      const marker = rawTokens[index + 1];
      const [argument, nextIndex] = readScriptArgument(rawTokens, index + 2);
      if (!marker || argument === undefined) break;
      token += marker + argument;
      index = nextIndex - 1;
    }

    tokens.push(token);
  }

  return tokens;
}

function maybeReadScriptedDelimitedGroup(
  tokens: string[],
  start: number,
): { token: string; nextIndex: number } | undefined {
  const opener = tokens[start];
  const closer = opener === "(" ? ")" : opener === "[" ? "]" : undefined;
  if (!closer) return undefined;

  let depth = 0;
  let token = "";
  for (let index = start; index < tokens.length; index += 1) {
    const current = tokens[index] ?? "";
    if (current === opener) depth += 1;
    if (current === closer) depth -= 1;
    token += current;
    if (depth === 0) {
      const next = tokens[index + 1];
      if (next === "^" || next === "_") return { token, nextIndex: index + 1 };
      return undefined;
    }
  }

  return undefined;
}

function readScriptArgument(
  tokens: string[],
  start: number,
): [argument: string | undefined, nextIndex: number] {
  const first = tokens[start];
  if (first === undefined) return [undefined, start];
  if (first !== "{") return [first, start + 1];

  let depth = 0;
  let argument = "";
  for (let index = start; index < tokens.length; index += 1) {
    const token = tokens[index] ?? "";
    if (token === "{") depth += 1;
    if (token === "}") depth -= 1;
    argument += token;
    if (depth === 0) return [argument, index + 1];
  }

  return [argument, tokens.length];
}

function latexToTokenNodes(
  parentId: string,
  latex: string,
  fontSize: number,
  renderer: string,
  style: Style,
): SceneNode[] {
  const tokens = tokenizeLatex(latex);
  let cursor =
    -tokens.reduce((sum, token) => sum + tokenWidth(token, fontSize), 0) /
    2;
  return tokens.map((token, index) => {
    const width = tokenWidth(token, fontSize);
    const child = createMathTokenNode(`${parentId}:tex:${index}`, style);
    child.latex = token;
    child.renderer = renderer;
    child.geometry.fontSize = fontSize;
    child.geometry.w = width;
    child.transform.x = cursor + width / 2;
    cursor += width;
    return child;
  });
}

function createMathTokenNode(id: string, style: Style): SceneNode {
  return {
    id,
    type: "math",
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    style: { ...style },
    geometry: { fontSize: 36 },
    children: [],
  };
}

function tokenWidth(token: string, fontSize: number): number {
  if (token.startsWith("\\") && token.length > 2)
    return fontSize * (0.9 + TOKEN_PADDING_UNITS);
  if (token === "^" || token === "_" || token === "{" || token === "}")
    return fontSize * (0.35 + TOKEN_PADDING_UNITS);

  const [base, ...scriptParts] = token.split(/(?=[_^])/u);
  const scriptPart = scriptParts.join("");
  const baseText = base ?? token;
  const baseWidthUnits = textWidthUnits(baseText);
  const scriptWidthUnits = scriptPart
    ? textWidthUnits(scriptPart.replace(/[_^{}]/gu, "")) * 0.45
    : 0;

  const estimatedUnits = Math.max(
    0.45,
    baseWidthUnits +
      scriptWidthUnits +
      TOKEN_PADDING_UNITS +
      (isScriptedDelimitedToken(token) ? SCRIPTED_DELIMITED_PADDING_UNITS : 0),
  );
  return fontSize * estimatedUnits;
}

function isScriptedDelimitedToken(token: string): boolean {
  return /^(\(.+\)|\[.+\])[_^]/u.test(token);
}

function textWidthUnits(text: string): number {
  let widthUnits = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? "";
    if (char === "\\") {
      const command = text.slice(index).match(/^\\[a-zA-Z]+\*?/u)?.[0];
      if (command) {
        widthUnits += 0.9;
        index += command.length - 1;
        continue;
      }
      widthUnits += 0.35;
    } else if (/[+=<>-]/u.test(char)) {
      widthUnits += 0.78;
    } else if (/[()[\]]/u.test(char)) {
      widthUnits += 0.42;
    } else if (/[A-Z]/u.test(char)) {
      widthUnits += 0.62;
    } else if (/[a-z]/u.test(char)) {
      widthUnits += 0.56;
    } else if (/[0-9]/u.test(char)) {
      widthUnits += 0.5;
    } else if (/[,.;:]/u.test(char)) {
      widthUnits += 0.28;
    } else {
      widthUnits += 0.55;
    }
  }
  return widthUnits;
}
