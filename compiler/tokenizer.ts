import { Operators, Tokens } from "./constants";

export type Token<T> = {
  type: Tokens;
  payload?: T;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  explode: (message?: string) => void;
};

function createLexer(file: string) {
  const state = { current: 0, line: 0, column: 0 };
  const file_length = file.length;

  return {
    hasMoreTokens() {
      return state.current < file_length;
    },
    readUntilRegexMismatch(regex: RegExp) {
      let value = "";
      while (this.hasMoreTokens() && this.test(regex)) {
        value += this.peek();
        this.advance();
      }
      return value;
    },
    readUntilEOL() {
      let value = "";
      while (this.hasMoreTokens() && !this.is("\n")) {
        value += this.peek();
        this.advance();
      }
      return value;
    },
    advance(amount = 1) {
      state.column += amount;
      state.current += amount;
    },
    peek() {
      return file[state.current];
    },
    explodeNext() {
      this.explode(1);
    },
    explode(offset = 0) {
      this.explodeAt(state.line, state.column + offset);
    },
    explodeAt(
      line: number,
      column: number,
      character?: string,
      message?: string
    ) {
      const lines_to_show = 6;
      const lines = file.split("\n");
      function range(center = 1, total = 6) {
        return [Math.max(0, center - total / 2 + 1), center + total / 2 + 1];
      }

      const [s, e] = range(line, lines_to_show);
      const visible_lines = lines.slice(s, e - 1);
      const prefix = "  ";

      console.error(
        `Uh oh!\n\n${visible_lines
          .flatMap((row, idx) => {
            const line_number_prefix = `${s + idx + 1} | `;
            const line_number_prefix_length = line_number_prefix.length;
            if (idx + s === line) {
              return [
                `   > ${line_number_prefix}${prefix}${row}`,
                `   ${" ".repeat(line_number_prefix_length)}| ${" ".repeat(
                  line_number_prefix_length + prefix.length + column + 5 - 9
                )}^ ${
                  message
                    ? message
                    : `Unexpected token: ${
                        character !== undefined ? character : this.peek()
                      }`
                }`,
              ];
            }
            return `     ${line_number_prefix}${prefix}${row}`;
          })
          .join("\n")}`
      );
      process.exit(1);
    },
    next() {
      return file[state.current + 1];
    },
    is(value: string | undefined | number) {
      if (
        value === undefined ||
        typeof value === "number" ||
        value.length === 1
      ) {
        return file[state.current] === value;
      }

      for (let i = 0; i < value.length; i++) {
        if (file[state.current + i] !== value[i]) {
          return false;
        }
      }

      return true;
    },
    test(regex: RegExp) {
      return regex.test(file[state.current]);
    },
    newline() {
      state.line++;
      state.column = 0;
      state.current++;
    },
    location() {
      return { line: state.line, column: state.column };
    },
    createToken<T>(
      type: Tokens,
      payload?: T,
      start_location?: { line: number; column: number },
      end_location?: { line: number; column: number }
    ): Token<T> {
      const start = start_location || {
        line: state.line,
        column: state.column,
      };
      const character = this.peek();
      return {
        type,
        payload,
        location: {
          start,
          end: end_location || { line: state.line, column: state.column + 1 },
        },
        explode: (message?: string) => {
          this.explodeAt(start.line, start.column, character, message);
        },
      };
    },
  };
}

export function tokenizer(input: string) {
  const lexer = createLexer(input);
  const tokens: Token<any>[] = [];

  while (lexer.hasMoreTokens()) {
    // Newlines
    if (lexer.is("\n")) {
      tokens.push(lexer.createToken(Tokens.EOL));
      lexer.newline();
      continue;
    }

    // Whitespace
    if (lexer.is(" ") || lexer.is("\t")) {
      // No need to store this token, just continue
      lexer.advance();
      continue;
    }

    // Semi colon
    if (lexer.is(";")) {
      tokens.push(lexer.createToken(Tokens.Terminator));
      lexer.advance();
      continue;
    }

    // Comments
    if (lexer.is("//")) {
      const start_location = lexer.location();
      const value = lexer.readUntilEOL();
      const end_location = lexer.location();

      tokens.push(
        lexer.createToken(
          Tokens.Comment,
          { value },
          start_location,
          end_location
        )
      );
      continue;
    }

    // Operators
    if (lexer.is("*")) {
      tokens.push(
        lexer.createToken(Tokens.Operator, { value: Operators.Multiplication })
      );
      lexer.advance();
      continue;
    }

    if (lexer.is("/")) {
      tokens.push(
        lexer.createToken(Tokens.Operator, { value: Operators.Division })
      );
      lexer.advance();
      continue;
    }

    if (lexer.is("=")) {
      tokens.push(
        lexer.createToken(Tokens.Operator, { value: Operators.Equals })
      );
      lexer.advance();
      continue;
    }

    if (lexer.is("+")) {
      if (
        // First item, so guaranteed to be unary
        tokens.length === 0 ||
        // Previous token is an operator: `3 + -` for example, so also an unary
        tokens[tokens.length - 1].type === Tokens.Operator
      ) {
        tokens.push(
          lexer.createToken(Tokens.Operator, { value: Operators.UnaryPlus })
        );
      } else {
        tokens.push(
          lexer.createToken(Tokens.Operator, { value: Operators.Addition })
        );
      }
      lexer.advance();
      continue;
    }

    if (lexer.is("-")) {
      if (
        // First item, so guaranteed to be unary
        tokens.length === 0 ||
        // Previous token is an operator: `3 - +` for example, so also an unary
        tokens[tokens.length - 1].type === Tokens.Operator
      ) {
        tokens.push(
          lexer.createToken(Tokens.Operator, { value: Operators.UnaryMinus })
        );
      } else {
        tokens.push(
          lexer.createToken(Tokens.Operator, { value: Operators.Subtraction })
        );
      }
      lexer.advance();
      continue;
    }

    // Numbers
    if (lexer.test(/[0-9]/)) {
      const start_location = lexer.location();
      const raw = lexer.readUntilRegexMismatch(/[0-9_]/);
      const end_location = lexer.location();
      tokens.push(
        lexer.createToken(Tokens.Number, { raw }, start_location, end_location)
      );
      continue;
    }

    // Parens
    if (lexer.is("(")) {
      tokens.push(lexer.createToken(Tokens.LeftParen));
      lexer.advance();
      continue;
    }

    if (lexer.is(")")) {
      tokens.push(lexer.createToken(Tokens.RightParen));
      lexer.advance();
      continue;
    }

    // Question mark - unknown value
    if (lexer.is("?")) {
      // TODO: What about: ? ?
      if (lexer.next() === "?") {
        lexer.explodeNext();
      }

      tokens.push(lexer.createToken(Tokens.Name, { value: lexer.peek() }));
      lexer.advance();
      continue;
    }

    // Variables
    if (lexer.test(/[a-z]/i)) {
      const start_location = lexer.location();
      const value = lexer.readUntilRegexMismatch(/[a-z_]/i);
      const end_location = lexer.location();
      tokens.push(
        lexer.createToken(Tokens.Name, { value }, start_location, end_location)
      );
      continue;
    }

    lexer.explode();
  }

  tokens.push(lexer.createToken(Tokens.EOL));

  return tokens;
}
