import { Associativity, Operators } from "./constants";

export type OperatorPrecedence = {
  precedence: number;
  associativity: Associativity;
  arity: number;
};

export const OPERATOR_PRECEDENCE_MAP: Record<string, OperatorPrecedence> = {
  [Operators.Equals]: {
    precedence: 1 << 0,
    associativity: Associativity.Right,
    arity: 2,
  },

  [Operators.Addition]: {
    precedence: 1 << 1,
    associativity: Associativity.Left,
    arity: 2,
  },
  [Operators.Subtraction]: {
    precedence: 1 << 1,
    associativity: Associativity.Left,
    arity: 2,
  },

  [Operators.Multiplication]: {
    precedence: 1 << 2,
    associativity: Associativity.Left,
    arity: 2,
  },
  [Operators.Division]: {
    precedence: 1 << 2,
    associativity: Associativity.Left,
    arity: 2,
  },

  [Operators.UnaryPlus]: {
    precedence: 1 << 3,
    associativity: Associativity.Right,
    arity: 1,
  },
  [Operators.UnaryMinus]: {
    precedence: 1 << 3,
    associativity: Associativity.Right,
    arity: 1,
  },
};
