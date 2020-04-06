import { Token } from "./tokenizer";
import { OPERATOR_PRECEDENCE_MAP } from "./operator-precedence";
import { Associativity, Tokens } from "./constants";
import { assertUnreachable } from "../utils/assert-unreachable";

/**
 * Mainly used for infix to postfix notation
 */

export function postProcessTokens(tokens: Token<any>[]): Token<any>[] {
  const operator_stack = [] as Token<any>[];
  const output_queue = [] as Token<any>[];

  for (let token of tokens) {
    switch (token.type) {
      case Tokens.EOL:
      case Tokens.Terminator:
        output_queue.unshift(...operator_stack.splice(0));
        break;

      case Tokens.Comment:
        output_queue.unshift(...operator_stack.splice(0));
        output_queue.unshift(token);
        break;

      case Tokens.Number:
      case Tokens.Name:
        output_queue.unshift(token);
        break;

      case Tokens.LeftParen:
        operator_stack.push(token);
        break;

      case Tokens.RightParen:
        while (
          operator_stack.length > 0 &&
          operator_stack[operator_stack.length - 1].type !== Tokens.LeftParen
        ) {
          output_queue.unshift(operator_stack.pop()!);
        }

        if (operator_stack.length <= 0) {
          token.explode(
            'Found closing ")" but didn\'t find a matching open "("'
          );
          break;
        }

        operator_stack.pop();
        break;

      case Tokens.Operator:
        const current = OPERATOR_PRECEDENCE_MAP[token.payload.value];

        while (operator_stack.length > 0) {
          const op_head = operator_stack[operator_stack.length - 1];

          if (op_head.type !== Tokens.Operator) {
            break;
          }

          const { precedence: precedence_head } = OPERATOR_PRECEDENCE_MAP[
            op_head.payload.value
          ];

          if (
            // There is an operator at the top of the operator stack with greater precedence
            precedence_head > current.precedence ||
            // (or) The operator at the top of the operator stack has equal precedence and the token is left associative
            (precedence_head === current.precedence &&
              current.associativity === Associativity.Left)
          ) {
            output_queue.unshift(operator_stack.pop()!);
            continue;
          }

          break;
        }

        operator_stack.push(token);
        break;

      default:
        return assertUnreachable(token.type);
    }
  }

  // Move the leftovers from the operator_stack to the output_queue
  output_queue.unshift(...operator_stack.splice(0));

  //
  return output_queue;
}
