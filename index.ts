import { readFileSync } from "fs";
import { compiler } from "./compiler/compiler";
import { debug } from "./utils/debug";

const program = readFileSync(process.argv[2], "utf8");

debug("Input", program);

let output = compiler(program);

debug("Input", program);
debug("Output", output);
