import { compiler } from "../compiler/compiler";

it.each([
  // Just literals
  ["0           = ?", 0],
  ["1           = ?", 1],
  ["123         = ?", 123],

  // Special notation for readability
  ["1_000_000   = ?", 1000000],

  // Unary minus
  ["-12         = ?", -12],
  ["-0          = ?", -0],
  ["-1_000_000  = ?", -1000000],

  // Unary plus
  ["+12         = ?", +12],
  ["+0          = ?", +0],
  ["+1_000_000  = ?", +1000000],
])('should compile "%s" to %s', (program, answer_0) => {
  expect(compiler(program)).toEqual({ answer_0 });
});
