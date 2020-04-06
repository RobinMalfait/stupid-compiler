import { tokenizer } from "./tokenizer";
import { postProcessTokens } from "./post-process-tokens";
import { parser } from "./parser";
import { transformer } from "./transformer";
import { codeGenerator } from "./code-generator";
import { debug, formatTokens, formatASTNodes } from "../utils/debug";

function formatNanoSeconds(input: bigint) {
  // Hours
  if (input > 1_000_000_000n * 60n * 60n) {
    return `${input / 1_000_000_000n / 60n / 60n}h`;
  }

  // Minuts
  if (input > 1_000_000_000n * 60n) {
    return `${input / 1_000_000_000n / 60n}min`;
  }

  // Seconds
  if (input > 1_000_000_000n) {
    return `${input / 1_000_000_000n}s`;
  }

  // Milliseconds
  if (input > 1_000_000n) {
    return `${input / 1_000_000n}ms`;
  }

  // Microseconds
  if (input > 1_000n) {
    return `${input / 1_000n}μs`;
  }

  // Nanoseconds
  return `${input}ns`;
}

function profile<T>(cb: () => T): [T, bigint] {
  const _start = process.hrtime.bigint();
  const result = cb();
  const _end = process.hrtime.bigint();
  return [result, _end - _start];
}

const formatter = new Intl.NumberFormat("nl", {
  maximumFractionDigits: 20,
  maximumSignificantDigits: 21,
});
function formatNumber(input: number) {
  return formatter.format(input).replace(/\./g, " ");
}

export function compiler(input: string) {
  const _start_compiler = process.hrtime.bigint();

  const [tokens, token_profile_info] = profile(() => tokenizer(input));
  debug("Tokens", formatTokens(tokens));

  const [reordered_tokens, reorder_token_profile_info] = profile(() =>
    postProcessTokens(tokens)
  );
  debug("(Re-ordered) Tokens", formatTokens(reordered_tokens));

  const [ast, ast_profile_info] = profile(() => parser(reordered_tokens));
  debug("AST", formatASTNodes(ast));

  const [new_ast, transformer_profile_info] = profile(() => transformer(ast));
  debug("Transformed AST", formatASTNodes(new_ast));

  const [code, code_generator_profile_info] = profile(() =>
    codeGenerator(new_ast)
  );
  debug("Code", code);

  const [replaced, evaluation_profile_info] = profile(() => {
    const result = eval(code);
    let counter = -1;
    return input.replace(/(?<!\/\/(.*))\?/g, () =>
      formatNumber(result[`answer_${++counter}`])
    );
  });

  const _end_compiler = process.hrtime.bigint();

  debug("Timings", {
    lexer: formatNanoSeconds(token_profile_info),
    tokens_post_processor: formatNanoSeconds(reorder_token_profile_info),
    parser: formatNanoSeconds(ast_profile_info),
    transformer: formatNanoSeconds(transformer_profile_info),
    code_generator: formatNanoSeconds(code_generator_profile_info),
    evaluation: formatNanoSeconds(evaluation_profile_info),
    total_compiler_time: formatNanoSeconds(_end_compiler - _start_compiler),
  });

  // Actually execute the code in JS land
  if (process.env.NODE_ENV === "test") {
    return eval(code);
  }

  return replaced;
}
