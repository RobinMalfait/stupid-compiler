import { compiler } from "../compiler/compiler";

it.each([
  // Unknown
  [" 5 + 2 = ?", { answer_0: 7 }],

  // Direct assignment
  ["x = 42", { x: 42 }],

  // Direct assignment, using equation
  ["x = 21 * 2", { x: 42 }],

  // Multiple variables with direct assignment
  ["x = 42; y = 20", { x: 42, y: 20 }],

  // Multiple variables with direct assignment, using equations
  ["x = 42 / 2; y = 20 + 7", { x: 21, y: 27 }],

  // Dependant on previous (known) variables
  ["x = 42; y = x / 2", { x: 42, y: 21 }],

  // Dependant on previous multiple variables
  ["x = 42; y = x / 2; z = x + y", { x: 42, y: 21, z: 63 }],

  // Right hand assignment
  ["42 = x", { x: 42 }],

  // Right hand assignment with simple arithmetics
  ["42 + 3 = x", { x: 45 }],

  // Right hand assignment with another variable inside
  ["x = 2; 40 + x = y", { x: 2, y: 42 }],

  ["x / 2 = 30", { x: 60 }],

  // literal operator identifier = literal
  ["60 + x = 30", { x: -30 }],
  ["60 - x = 30", { x: 30 }],
  ["60 * x = 30", { x: 0.5 }],
  ["60 / x = 30", { x: 2 }],

  // identifier operator literal = literal
  ["x + 60 = 30", { x: -30 }],
  ["x - 60 = 30", { x: 90 }],
  ["x * 60 = 30", { x: 0.5 }],
  ["x / 60 = 30", { x: 1800 }],

  ["x + x = 30", { x: 15 }],
  // x - x = 0 -> Impossible to know what X is
  // x * x = 25 -> Sort of impossible, X is either 5 or -5
  // x / x = 1 -> Impossible to know what X is

  // TODO
  // ["x + x + x = 30", { x: 10 }],

  // TODO
  // ["2 * x + 2 * x + 2 * x = 30", { x: 5 }],
])('should compile "%s" to %s', (program, expected) => {
  expect(compiler(program)).toEqual(expected);
});
