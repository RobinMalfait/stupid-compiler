import { Token } from "../compiler/tokenizer";
import { Operators, Tokens, ASTNodeTypes } from "../compiler/constants";
import { assertUnreachable } from "./assert-unreachable";

export function debug(title: string, context: any) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  // Print a title
  console.log(`${title}:`);
  console.log("-".repeat(title.length + 1));

  // Print the context
  if (typeof context === "string") {
    console.log(context);
  } else {
    console.dir(context, { depth: Infinity });
  }

  // End with a newline
  console.log("\n");
}

export function formatTokens(tokens: Token<any>[]) {
  return tokens.map((token) => ({
    ...token,
    type: Tokens[token.type],
    ...(token.type === Tokens.Operator
      ? { payload: { value: Operators[(token.payload as any).value!] } }
      : {}),
  }));
}

export function formatASTNodes(node: any): any {
  const type: ASTNodeTypes = node.type;
  switch (type) {
    case ASTNodeTypes.Program:
      return { type: ASTNodeTypes[node.type], body: node.body.map(formatASTNodes) };

    case ASTNodeTypes.AssignmentExpression:
    case ASTNodeTypes.BinaryExpression:
      return {
        type: ASTNodeTypes[node.type],
        operator: Operators[node.operator],
        left: formatASTNodes(node.left),
        right: formatASTNodes(node.right),
      };

    case ASTNodeTypes.UnaryExpression:
      return {
        type: ASTNodeTypes[node.type],
        operator: node.operator,
        argument: formatASTNodes(node.argument),
      };

    case ASTNodeTypes.Identifier:
    case ASTNodeTypes.Comment:
    case ASTNodeTypes.Literal:
      return { ...node, type: ASTNodeTypes[node.type] };

    default:
      assertUnreachable(type);
  }
}
