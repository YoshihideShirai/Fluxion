export type ExpressionScope = Record<string, number>;

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  abs: Math.abs,
  acos: Math.acos,
  asin: Math.asin,
  atan: Math.atan,
  atan2: Math.atan2,
  ceil: Math.ceil,
  cos: Math.cos,
  exp: Math.exp,
  floor: Math.floor,
  log: Math.log,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  round: Math.round,
  sin: Math.sin,
  sqrt: Math.sqrt,
  tan: Math.tan,
};

const CONSTANTS: ExpressionScope = {
  e: Math.E,
  pi: Math.PI,
};

export class ExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpressionError";
  }
}

export function evaluateExpression(source: string, scope: ExpressionScope): number {
  const value = parseExpressionValue(source, scope);
  if (!Number.isFinite(value)) throw new ExpressionError("Expression result must be finite.");
  return value;
}

export function validateExpression(source: string, knownNames: Iterable<string>): void {
  parseExpressionValue(source, Object.fromEntries([...knownNames].map((name) => [name, 1])));
}

function parseExpressionValue(source: string, scope: ExpressionScope): number {
  const parser = new Parser(source, scope);
  const value = parser.parseExpression();
  parser.expectEnd();
  return value;
}

type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma" };

class Parser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(source: string, private readonly scope: ExpressionScope) {
    this.tokens = tokenizeExpression(source);
  }

  parseExpression(): number {
    return this.parseAdditive();
  }

  expectEnd(): void {
    if (this.peek()) throw new ExpressionError("Unexpected token at end of expression.");
  }

  private parseAdditive(): number {
    let left = this.parseMultiplicative();
    while (this.matchOperator("+") || this.matchOperator("-")) {
      const operator = this.previousOperator();
      const right = this.parseMultiplicative();
      left = operator === "+" ? left + right : left - right;
    }
    return left;
  }

  private parseMultiplicative(): number {
    let left = this.parseUnary();
    while (this.matchOperator("*") || this.matchOperator("/") || this.matchOperator("%")) {
      const operator = this.previousOperator();
      const right = this.parseUnary();
      if (operator === "*") left *= right;
      else if (operator === "/") left /= right;
      else left %= right;
    }
    return left;
  }

  private parseUnary(): number {
    if (this.matchOperator("+")) return this.parseUnary();
    if (this.matchOperator("-")) return -this.parseUnary();
    return this.parsePower();
  }

  private parsePower(): number {
    const left = this.parsePrimary();
    if (this.matchOperator("**")) return left ** this.parseUnary();
    return left;
  }

  private parsePrimary(): number {
    const token = this.advance();
    if (!token) throw new ExpressionError("Expected expression.");

    if (token.type === "number") return token.value;

    if (token.type === "identifier") {
      if (this.matchParen("(")) {
        const fn = FUNCTIONS[token.value];
        if (!fn) throw new ExpressionError(`Unknown function '${token.value}'.`);
        const args: number[] = [];
        if (!this.matchParen(")")) {
          do {
            args.push(this.parseExpression());
          } while (this.matchComma());
          this.consumeParen(")");
        }
        return fn(...args);
      }

      const value = this.scope[token.value] ?? CONSTANTS[token.value];
      if (value === undefined) throw new ExpressionError(`Unknown identifier '${token.value}'.`);
      return value;
    }

    if (token.type === "paren" && token.value === "(") {
      const value = this.parseExpression();
      this.consumeParen(")");
      return value;
    }

    throw new ExpressionError("Expected expression.");
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private advance(): Token | undefined {
    return this.tokens[this.index++];
  }

  private matchOperator(operator: string): boolean {
    const token = this.peek();
    if (token?.type !== "operator" || token.value !== operator) return false;
    this.index += 1;
    return true;
  }

  private previousOperator(): string {
    const token = this.tokens[this.index - 1];
    if (token?.type !== "operator") throw new ExpressionError("Expected operator.");
    return token.value;
  }

  private matchParen(paren: "(" | ")"): boolean {
    const token = this.peek();
    if (token?.type !== "paren" || token.value !== paren) return false;
    this.index += 1;
    return true;
  }

  private consumeParen(paren: "(" | ")"): void {
    if (!this.matchParen(paren)) throw new ExpressionError(`Expected '${paren}'.`);
  }

  private matchComma(): boolean {
    if (this.peek()?.type !== "comma") return false;
    this.index += 1;
    return true;
  }
}



export function collectExpressionDependencies(source: string): string[] {
  const dependencies = new Set<string>();
  for (const token of tokenizeExpression(source)) {
    if (token.type === "identifier" && !(token.value in FUNCTIONS) && !(token.value in CONSTANTS)) dependencies.add(token.value);
  }
  return [...dependencies];
}

function tokenizeExpression(source: string): Token[] {
  const tokens: Token[] = [];
  for (let index = 0; index < source.length;) {
    const char = source[index]!;
    if (/\s/u.test(char)) {
      index += 1;
      continue;
    }
    if (/[0-9.]/u.test(char)) {
      const match = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/iu.exec(source.slice(index));
      if (!match) throw new ExpressionError("Invalid number literal.");
      tokens.push({ type: "number", value: Number(match[0]) });
      index += match[0].length;
      continue;
    }
    if (/[A-Za-z_]/u.test(char)) {
      const match = /^[A-Za-z_]\w*/u.exec(source.slice(index));
      if (!match) throw new ExpressionError("Invalid identifier.");
      tokens.push({ type: "identifier", value: match[0] });
      index += match[0].length;
      continue;
    }
    if (source.startsWith("**", index)) {
      tokens.push({ type: "operator", value: "**" });
      index += 2;
      continue;
    }
    if (["+", "-", "*", "/", "%"].includes(char)) {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "comma" });
      index += 1;
      continue;
    }
    throw new ExpressionError(`Unexpected character '${char}'.`);
  }
  return tokens;
}
