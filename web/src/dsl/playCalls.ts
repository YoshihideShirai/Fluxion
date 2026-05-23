import { DslCompileError } from "./errors.js";
import { parseNumber } from "./syntax.js";

export type PlayArgument = string | PlayCall;

export interface PlayCall {
  name: string;
  args: PlayArgument[];
  options: Map<string, string>;
}

export function readPlayCall(
  tokens: string[],
  lineNumber: number,
): [PlayCall, string[]] {
  const callTokens: string[] = [];
  let index = 1;
  let depth = 0;
  let sawOpenParen = false;
  while (index < tokens.length) {
    const token = tokens[index]!;
    callTokens.push(token);
    for (const char of token) {
      if (char === "(") {
        depth += 1;
        sawOpenParen = true;
      } else if (char === ")") {
        depth -= 1;
        if (depth < 0)
          throw new DslCompileError("Unexpected ')' in play call.", lineNumber);
      }
    }
    index += 1;
    if (sawOpenParen && depth === 0) break;
  }

  if (!sawOpenParen || depth !== 0)
    throw new DslCompileError("Unclosed play call.", lineNumber);

  return [parsePlayCall(callTokens.join(" "), lineNumber), tokens.slice(index)];
}

export function expectPlayArg(
  call: PlayCall,
  count: number,
  lineNumber: number,
): string {
  return expectPlayIdArgs(call, count, lineNumber)[0]!;
}

export function expectPlayIdArgs(
  call: PlayCall,
  count: number,
  lineNumber: number,
): string[] {
  if (
    call.args.length !== count ||
    call.args.some((arg) => typeof arg !== "string")
  )
    throw new DslCompileError(
      `Expected ${call.name}(${expectedIdList(count)}).`,
      lineNumber,
    );
  return call.args as string[];
}

export function expectPlayCallArgs(call: PlayCall, lineNumber: number): PlayCall[] {
  if (call.args.length === 0)
    throw new DslCompileError(
      `Expected ${call.name}(<animation>, ...).`,
      lineNumber,
    );
  if (call.args.some((arg) => typeof arg === "string"))
    throw new DslCompileError(
      `Expected ${call.name} arguments to be animation calls.`,
      lineNumber,
    );
  return call.args as PlayCall[];
}

export function ensureNoPlayOptions(call: PlayCall, lineNumber: number): void {
  if (call.options.size > 0) {
    const [key] = call.options.keys();
    throw new DslCompileError(
      `Unknown ${call.name} option '${key ?? ""}'.`,
      lineNumber,
    );
  }
}

export function readLagRatio(call: PlayCall, lineNumber: number): number {
  let lagRatio = 0;
  for (const [key, value] of call.options) {
    if (key === "lagRatio") lagRatio = parseNumber(value, lineNumber);
    else
      throw new DslCompileError(
        `Unknown ${call.name} option '${key}'.`,
        lineNumber,
      );
  }
  if (lagRatio < 0)
    throw new DslCompileError(
      "Expected lagRatio to be non-negative.",
      lineNumber,
    );
  return lagRatio;
}

export function normalizeLaggedGroupTiming(
  duration: number,
  childCount: number,
  lagRatio: number,
): { childDuration: number; childOffset: number } {
  if (childCount <= 0) return { childDuration: 0, childOffset: 0 };
  const normalizedChildDuration =
    duration / (1 + Math.max(0, childCount - 1) * lagRatio);
  return {
    childDuration: normalizedChildDuration,
    childOffset: normalizedChildDuration * lagRatio,
  };
}

function parsePlayCall(raw: string | undefined, lineNumber: number): PlayCall {
  if (!raw)
    throw new DslCompileError(
      "Expected animation primitive after play.",
      lineNumber,
    );
  const openParen = raw.indexOf("(");
  if (openParen <= 0 || !raw.endsWith(")"))
    throw new DslCompileError(
      "Expected play syntax like FadeIn(id).",
      lineNumber,
    );
  const name = raw.slice(0, openParen).trim();
  if (!/^\w+$/u.test(name))
    throw new DslCompileError(
      "Expected play syntax like FadeIn(id).",
      lineNumber,
    );

  const args: PlayArgument[] = [];
  const options = new Map<string, string>();
  const inner = raw.slice(openParen + 1, -1).trim();
  if (inner !== "") {
    for (const part of splitTopLevelArgs(inner, lineNumber)) {
      const assignment = splitTopLevelAssignment(part);
      if (assignment) {
        const [key, value] = assignment;
        if (options.has(key))
          throw new DslCompileError(
            `Duplicate play option '${key}'.`,
            lineNumber,
          );
        options.set(key, value);
      } else if (isPlayCallText(part)) {
        args.push(parsePlayCall(part, lineNumber));
      } else {
        args.push(part);
      }
    }
  }

  return { name, args, options };
}

function splitTopLevelArgs(raw: string, lineNumber: number): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of raw) {
    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;
      if (depth < 0)
        throw new DslCompileError("Unexpected ')' in play call.", lineNumber);
    }

    if (char === "," && depth === 0) {
      const arg = current.trim();
      if (!arg)
        throw new DslCompileError(
          "Expected non-empty play argument.",
          lineNumber,
        );
      args.push(arg);
      current = "";
    } else {
      current += char;
    }
  }
  if (depth !== 0) throw new DslCompileError("Unclosed play call.", lineNumber);
  const finalArg = current.trim();
  if (!finalArg)
    throw new DslCompileError("Expected non-empty play argument.", lineNumber);
  args.push(finalArg);
  return args;
}

function splitTopLevelAssignment(raw: string): [string, string] | null {
  let depth = 0;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "=" && depth === 0) {
      const key = raw.slice(0, index).trim();
      const value = raw.slice(index + 1).trim();
      if (key && value) return [key, value];
    }
  }
  return null;
}

function isPlayCallText(raw: string): boolean {
  return /^\w+\s*\(/u.test(raw) && raw.endsWith(")");
}

function expectedIdList(count: number): string {
  if (count === 1) return "id";
  return Array.from({ length: count }, (_, index) =>
    index === 0 ? "from" : index === 1 ? "to" : `id${index + 1}`,
  ).join(", ");
}
