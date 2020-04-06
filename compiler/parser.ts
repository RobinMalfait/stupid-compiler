import { Token } from "./tokenizer";
import { OPERATOR_PRECEDENCE_MAP } from "./operator-precedence";
import { ASTNodeTypes, Operators, Associativity, Tokens } from "./constants";
import { assertUnreachable } from "../utils/assert-unreachable";

export function Literal<T>(raw: string, value: T) {
  return { type: ASTNodeTypes.Literal, value, raw };
}

function BinaryExpression<Left, Right>(
  operator: string,
  left: Left,
  right: Right
) {
  return { type: ASTNodeTypes.BinaryExpression, operator, left, right };
}

function UnaryExpression<T>(operator: string, argument: T) {
  return { type: ASTNodeTypes.UnaryExpression, operator, argument };
}

function Identifier(name: string) {
  return { type: ASTNodeTypes.Identifier, name };
}

function Comment(value: string) {
  return { type: ASTNodeTypes.Comment, value };
}

function AssignmentExpression<Left, Right>(
  operator: Operators,
  left: Left,
  right: Right
) {
  return { type: ASTNodeTypes.AssignmentExpression, operator, left, right };
}

function Program<Body>(body: Body[]) {
  return { type: ASTNodeTypes.Program, body };
}

export function parser(tokens: Token<any>[]): any {
  let current = 0;

  function walk(parent: Token<any>[]): any {
    let token = tokens[current++];

    switch (token.type) {
      case Tokens.Number:
        return Literal(
          token.payload.raw,
          // Remove `_` for numbers that are represented as `1_000_000` purely for readability
          Number(token.payload.raw.replace(/_/g, ""))
        );

      case Tokens.Operator:
        if (token.payload.value === Operators.Equals) {
          return AssignmentExpression(
            Operators.Equals,
            walk(parent),
            walk(parent)
          );
        }

        const { arity, associativity } = OPERATOR_PRECEDENCE_MAP[
          token.payload.value
        ];

        if (arity === 2) {
          const a = walk(parent);
          const b = walk(parent);

          if (associativity === Associativity.Left) {
            return BinaryExpression(token.payload.value, b, a);
          }

          if (associativity === Associativity.Right) {
            return BinaryExpression(token.payload.value, a, b);
          }

          throw new TypeError(`Unsupported associativty: ${associativity}`);
        }

        if (arity === 1) {
          return UnaryExpression(token.payload.value, walk(parent));
        }

        throw new TypeError(`Unsupported arity: ${arity}`);

      case Tokens.Name:
        return Identifier(token.payload.value);

      case Tokens.Comment:
        return Comment(token.payload.value);

      case Tokens.EOL:
      case Tokens.Terminator:
      case Tokens.RightParen:
        throw new TypeError("This is a compiler error");

      case Tokens.LeftParen:
        token.explode('Found open "(" but didn\'t find a matching closing ")"');
        break;

      default:
        assertUnreachable(token.type);
    }
  }

  const ast = Program<any>([]);

  while (current < tokens.length) {
    ast.body.unshift(walk(ast.body));
  }

  return ast;
}
