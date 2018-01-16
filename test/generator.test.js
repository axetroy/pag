import test from "ava";
import { tokenizer, parser, transformer, codeGenerator } from "../index";

console.log(process.pid);

test("Basic tokenizer", t => {
  const tokens = tokenizer("hello world");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const code = codeGenerator(newAst);

  t.deepEqual(code, "hello world");
});
