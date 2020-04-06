export enum ASTNodeTypes {
  Program,

  AssignmentExpression,

  BinaryExpression,
  UnaryExpression,

  Identifier,

  Literal,

  Comment,
}

export enum Tokens {
  Operator,
  Number,
  LeftParen,
  RightParen,
  Comment,
  Name,
  Terminator,
  EOL,
}

export enum Associativity {
  Left,
  Right,
}

export enum Operators {
  Equals,

  UnaryPlus,
  UnaryMinus,

  Addition,
  Subtraction,

  Multiplication,
  Division,
}
