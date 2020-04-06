import { compiler } from "../compiler/compiler";

it.each([
  // Addition
  [" 1 +   2 = ?", 3],
  [" 2 +   1 = ?", 3],

  // Addition with negative numbers (unary minus)
  ["-3 +   7 = ?", 4],
  [" 3 +  -7 = ?", -4],
  [" 3 + --7 = ?", 10],
  ["-3 +  -7 = ?", -10],

  // Addition with explicit positive numbers (unary plus)
  ["+3 +   7 = ?", 10],
  [" 3 +  +7 = ?", 10],
  [" 3 + ++7 = ?", 10],
  ["+3 +  +7 = ?", 10],

  // Subtractions
  [" 1 -   2 = ?", -1],
  [" 2 -   1 = ?", 1],

  // Subtractions with negative numbers (unary minus)
  ["-1 -   2  = ?", -3],
  [" 2 -   -1 = ?", 3],
  [" 1 -   -2 = ?", 3],
  ["-2 -   -1 = ?", -1],
  ["-1 -   -2 = ?", 1],

  // Subtractions with explicit positive numbers (unary plus)
  ["+1 -   2  = ?", -1],
  [" 2 -   +1 = ?", 1],
  [" 1 -   +2 = ?", -1],
  ["+2 -   +1 = ?", 1],
  ["+1 -   +2 = ?", -1],

  // Multiplication
  [" 3 *   4 = ?", 12],
  [" 4 *   3 = ?", 12],

  // Multiplication with negative numbers (unary minus)
  ["-3 *   4 = ?", -12],
  [" 3 *  -4 = ?", -12],
  ["-3 *  -4 = ?", 12],

  // Multiplication with explicit positive numbers (unary plus)
  ["+3 *   4 = ?", 12],
  [" 3 *  +4 = ?", 12],
  ["+3 *  +4 = ?", 12],

  // Division
  [" 2 /  20 = ?", 0.1],
  ["20 /   2 = ?", 10],

  // Division with negative numbers (unary minus)
  ["-2 /  20 = ?", -0.1],
  [" 2 / -20 = ?", -0.1],
  ["-2 / -20 = ?", 0.1],

  // Division with explicit positive numbers (unary plus)
  ["+2 /  20 = ?", 0.1],
  [" 2 / +20 = ?", 0.1],
  ["+2 / +20 = ?", 0.1],
])('should compile "%s" to %s', (program, answer_0) => {
  expect(compiler(program)).toEqual({ answer_0 });
});
