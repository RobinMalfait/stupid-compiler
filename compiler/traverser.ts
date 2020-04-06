import { ASTNodeTypes } from "./constants";

export function traverser<T>(ast: T, visitor: any) {
  function traverseArray<T>(array: T[], parent: T) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode<T>(node: any, parent: T) {
    let methods = visitor[node.type];
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case ASTNodeTypes.Program:
        traverseArray(node.body, node);
        break;

      case ASTNodeTypes.AssignmentExpression:
      case ASTNodeTypes.BinaryExpression:
        traverseNode(node.left, node);
        traverseNode(node.right, node);
        break;

      case ASTNodeTypes.UnaryExpression:
        traverseNode(node.argument, node);
        break;

      case ASTNodeTypes.Identifier:
      case ASTNodeTypes.Literal:
      case ASTNodeTypes.Comment:
        break;
      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}
