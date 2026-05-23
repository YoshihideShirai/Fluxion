export class DslCompileError extends Error {
  readonly line: number;
  readonly column: number;

  constructor(message: string, line: number, column = 1) {
    super(`Line ${line}, column ${column}: ${message}`);
    this.name = "DslCompileError";
    this.line = line;
    this.column = column;
  }
}
