import { traverser } from "./traverser";
import { Literal } from "./parser";
import { Operators, ASTNodeTypes } from "./constants";
import { assertUnreachable } from "../utils/assert-unreachable";

const INVERSE_MAP: Record<any, Operators> = {
  [Operators.Addition]: Operators.Subtraction,
  [Operators.Subtraction]: Operators.Addition,
  [Operators.Multiplication]: Operators.Division,
  [Operators.Division]: Operators.Multiplication,
};

export function transformer(ast: any) {
  traverser(ast, {
    [ASTNodeTypes.AssignmentExpression]: {
      enter(node: any, parent: any) {
        // Ensure the question mark identifier is on the right: `x = ?` -> `? = x`
        if (
          node.left.type === ASTNodeTypes.Identifier &&
          node.right.type === ASTNodeTypes.Identifier
        ) {
          if (node.right.name === "?") {
            // Switcherony
            [node.left, node.right] = [node.right, node.left];
            return;
          }
        }

        // Ensure the identifier is on the left: `12 = x` -> `x = 12`
        if (
          node.right.type === ASTNodeTypes.Identifier &&
          node.left.type !== ASTNodeTypes.Identifier
        ) {
          // Switcherony
          [node.left, node.right] = [node.right, node.left];
        }

        // `x + x = 30` -> `x = 30 / 2`
        if (
          node.left.type === ASTNodeTypes.Literal &&
          node.right.type === ASTNodeTypes.BinaryExpression &&
          node.right.left.type === ASTNodeTypes.Identifier &&
          node.right.right.type === ASTNodeTypes.Identifier &&
          node.right.left.name === node.right.right.name &&
          node.right.operator === Operators.Addition
        ) {
          [node.left, node.right.left] = [node.right.left, node.left];
          node.right.operator = Operators.Division;
          node.right.right = Literal("2", 2);
          return;
        }

        // `x + 60 = 30` -> `x = 30 - 60`
        // `x * 60 = 30` -> `x = 30 / 60`
        // `x - 60 = 30` -> `x = 30 + 60`
        // `x / 60 = 30` -> `x = 30 * 60`
        if (
          node.left.type === ASTNodeTypes.Literal &&
          node.right.type === ASTNodeTypes.BinaryExpression &&
          node.right.left.type === ASTNodeTypes.Identifier
        ) {
          // Switcherony
          [node.left, node.right.left] = [node.right.left, node.left];

          // Inverse
          node.right.operator = INVERSE_MAP[node.right.operator as Operators];
          return;
        }

        // `60 + x = 30` -> `x = 30 - 60` // ! Switch arguments & sign
        // `60 - x = 30` -> `x = 60 - 30`
        // `60 * x = 30` -> `x = 30 / 60` // ! Switch arguments & sign
        // `60 / x = 30` -> `x = 60 / 30`
        if (
          node.left.type === ASTNodeTypes.Literal &&
          node.right.type === ASTNodeTypes.BinaryExpression &&
          node.right.right.type === ASTNodeTypes.Identifier
        ) {
          // `60 - x = 30` -> `x = 60 - 30`
          // `60 / x = 30` -> `x = 60 / 30`
          if (
            node.right.operator === Operators.Subtraction ||
            node.right.operator === Operators.Division
          ) {
            // Switcherony
            [node.left, node.right.right] = [node.right.right, node.left];
            return;
          }

          // `60 + x = 30` -> `x = 30 - 60`
          // `60 * x = 30` -> `x = 30 / 60
          if (
            node.right.operator === Operators.Addition ||
            node.right.operator === Operators.Multiplication
          ) {
            // Switcherony
            // Switch the literal of the assignment with the identifier
            [node.left, node.right.right] = [node.right.right, node.left];

            // Inverse the operator
            node.right.operator = INVERSE_MAP[node.right.operator];

            // Switch the binary expression operands
            [node.right.left, node.right.right] = [
              node.right.right,
              node.right.left,
            ];
            return;
          }
        }
      },
    },
    [ASTNodeTypes.BinaryExpression]: {
      exit(
        node: {
          left: { type: ASTNodeTypes; value: number };
          right: { type: ASTNodeTypes; value: number };
          operator: Operators;
        },
        parent: any
      ) {
        if (
          node.left.type === ASTNodeTypes.Literal &&
          node.right.type === ASTNodeTypes.Literal
        ) {
          if (
            parent.type !== ASTNodeTypes.AssignmentExpression &&
            parent.type !== ASTNodeTypes.BinaryExpression
          ) {
            throw new Error(
              "We have a binary expression so we should be able to calculate the result." +
                " However the parent is something we did not take into account. Please cover this case:" +
                parent.type
            );
          }

          let value: number;
          switch (node.operator) {
            case Operators.Addition:
              value = node.left.value + node.right.value;
              break;
            case Operators.Subtraction:
              value = node.left.value - node.right.value;
              break;
            case Operators.Multiplication:
              value = node.left.value * node.right.value;
              break;
            case Operators.Division:
              value = node.left.value / node.right.value;
              break;

            // Not a calculation operation, so we can skip this
            case Operators.Equals:
            // UnaryExpressions
            case Operators.UnaryMinus:
            case Operators.UnaryPlus:
              return;
            default:
              assertUnreachable(node.operator);
          }

          // We now have a calculated form, so we can switch from a
          // BinaryExpression to a Literal
          const new_node = Literal(String(value), value);

          // Override the left node
          if (parent.left === node) {
            parent.left = new_node;
          }

          // Override the right node
          if (parent.right === node) {
            parent.right = new_node;
          }
        }
      },
    },
  });
  return ast;
}
