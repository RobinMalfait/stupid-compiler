import { Operators, ASTNodeTypes } from "./constants";

function comment(text: string = "") {
  return ["", `// ${text}`];
}

function iife(data: string[]) {
  return ["(() => {", ...data.map((row) => `  ${row}`), "})();"];
}

function constantVariable(name: string, value: any) {
  return [`const ${name} = ${JSON.stringify(value)};`];
}

function returnValue(expression: string) {
  return [`return ${expression};`];
}

const OPERATOR_MAP: Record<Operators, string> = {
  [Operators.Equals]: "=",

  [Operators.UnaryPlus]: "+",
  [Operators.UnaryMinus]: "-",

  [Operators.Addition]: "+",
  [Operators.Subtraction]: "-",

  [Operators.Multiplication]: "*",
  [Operators.Division]: "/",
};

export function codeGenerator(
  node: any,
  context: any = { question_mark_variables: -1 }
): any {
  switch (node.type) {
    case ASTNodeTypes.Program:
      return [
        ...iife([
          ...comment("Setup the context"),
          ...constantVariable("context", {}),
          ...comment("Setup the equations"),
          ...node.body.map((n: any) => codeGenerator(n, context)),
          ...comment("Return the context object"),
          ...returnValue("context"),
        ]),
      ].join("\n");

    case ASTNodeTypes.AssignmentExpression:
      return `${codeGenerator(node.left, context)} ${
        OPERATOR_MAP[node.operator as Operators]
      } ${codeGenerator(node.right, context)};`;

    case ASTNodeTypes.UnaryExpression: {
      return `(${OPERATOR_MAP[node.operator as Operators]}${codeGenerator(
        node.argument,
        context
      )})`;
    }

    case ASTNodeTypes.BinaryExpression: {
      return `(${codeGenerator(node.left, context)} ${
        OPERATOR_MAP[node.operator as Operators]
      } ${codeGenerator(node.right, context)})`;
    }

    case ASTNodeTypes.Identifier:
      if (node.name === "?") {
        return `context.answer_${++context.question_mark_variables}`;
      }

      return `context.${node.name}`;

    case ASTNodeTypes.Literal:
    case ASTNodeTypes.Comment:
      return node.value;

    default:
      throw new TypeError(node.type);
  }
}
