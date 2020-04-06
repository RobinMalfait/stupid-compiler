import { compiler } from "../compiler/compiler";

it("combined case", async () => {
  expect(compiler("2 + 3 * 4 / (5 + 7) = ?")).toEqual({
    answer_0: 2 + (3 * 4) / (5 + 7),
  });
});

it.each([
  // + and - in various forms
  [" 2 +  3  - 4      = ?", 1],
  [" 2 + (3  - 4)     = ?", 1],
  ["(2 +  3) - 4      = ?", 1],

  // - and + in various forms
  [" 2 -  3  + 4      = ?", 3],
  [" 2 - (3  + 4)     = ?", -5],
  ["(2 -  3) + 4      = ?", 3],
])('should compile "%s" to %s', (program, answer_0) => {
  expect(compiler(program)).toEqual({ answer_0 });
});
