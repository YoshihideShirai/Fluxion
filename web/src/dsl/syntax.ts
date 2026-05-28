import type { NodeType } from "../types.js";
import { DslCompileError } from "./errors.js";

export function readCameraArguments(
  tokens: string[],
  lineNumber: number,
): Array<[string, string]> {
  const args: Array<[string, string]> = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "at") {
      const value = tokens[index + 1];
      if (!value) throw new DslCompileError("Expected coordinates after camera at.", lineNumber);
      args.push(["at", value]);
      index += 1;
      continue;
    }
    if (!token) throw new DslCompileError("Expected camera option.", lineNumber);
    args.push(readAssignment(token, lineNumber));
  }
  return args;
}

export function readNodeArguments(
  tokens: string[],
  lineNumber: number,
): Array<[string, string]> {
  const args: Array<[string, string]> = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "at") {
      const value = tokens[index + 1];
      if (!value)
        throw new DslCompileError("Expected coordinates after at.", lineNumber);
      args.push(["at", value]);
      index += 1;
      continue;
    }
    if (!token) throw new DslCompileError("Expected node option.", lineNumber);
    args.push(readAssignment(token, lineNumber));
  }
  return args;
}

export function readAssignments(
  tokens: string[],
  lineNumber: number,
): Array<[string, string]> {
  return tokens.map((token) => readAssignment(token, lineNumber));
}

export function readAssignment(token: string, lineNumber: number): [string, string] {
  const equals = token.indexOf("=");
  if (equals <= 0)
    throw new DslCompileError(
      `Expected key=value, got '${token}'.`,
      lineNumber,
    );
  return [token.slice(0, equals), token.slice(equals + 1)];
}

export function parseValue(raw: string, lineNumber: number): number | string {
  const number = Number(raw);
  if (!Number.isNaN(number) && raw.trim() !== "") return number;
  if (raw.endsWith("s")) return parseSeconds(raw, lineNumber);
  return raw;
}

export function parseSeconds(raw: string | undefined, lineNumber: number): number {
  if (!raw) throw new DslCompileError("Expected time value.", lineNumber);
  const normalized = raw.endsWith(":") ? raw.slice(0, -1) : raw;
  const value = normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
  return parseNumber(value, lineNumber);
}

export function parseEasing(raw: string, lineNumber: number): string {
  if (
    raw === "linear" ||
    raw === "smooth" ||
    raw === "easeInOut" ||
    raw === "easeIn" ||
    raw === "easeOut"
  ) {
    return raw;
  }
  throw new DslCompileError(`Unknown easing '${raw}'.`, lineNumber);
}

export function parseBoolean(raw: string, lineNumber: number): boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new DslCompileError(`Expected boolean, got '${raw}'.`, lineNumber);
}

export function parseNumber(raw: string | undefined, lineNumber: number): number {
  const value = Number(raw);
  if (raw === undefined || raw === "" || Number.isNaN(value)) {
    throw new DslCompileError(
      `Expected number, got '${raw ?? ""}'.`,
      lineNumber,
    );
  }
  return value;
}

export function stripComment(line: string): string {
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === undefined) continue;
    if (char === '"' && line[index - 1] !== "\\") quoted = !quoted;
    if (!quoted && char === "#") return line.slice(0, index);
  }
  return line;
}

export function tokenize(line: string, lineNumber: number): string[] {
  const tokens: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === undefined) continue;
    if (char === '"' && line[index - 1] !== "\\") {
      quoted = !quoted;
      continue;
    }
    if (!quoted && /\s/.test(char)) {
      if (current) tokens.push(unescapeToken(current));
      current = "";
      continue;
    }
    current += char;
  }

  if (quoted)
    throw new DslCompileError(
      "Unclosed quoted string.",
      lineNumber,
      line.length,
    );
  if (current) tokens.push(unescapeToken(current));
  return tokens;
}

export function isNodeType(value: string | undefined): value is NodeType {
  return (
    value === "group" ||
    value === "circle" ||
    value === "rect" ||
    value === "triangle" ||
    value === "line" ||
    value === "path" ||
    value === "text" ||
    value === "math" ||
    value === "brace" ||
    value === "image"
  );
}

export function columnOf(line: string, token: string): number {
  const index = line.indexOf(token);
  return index === -1 ? 1 : index + 1;
}

function unescapeToken(token: string): string {
  return token.replace(/\\"/g, '"');
}
