import test from "ava";
import { tokenizer, parser, transformer, codeGenerator } from "../index";

console.log(process.pid);

test("Basic generator", t => {
  const tokens = tokenizer("hello world");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const code = codeGenerator(newAst);

  t.deepEqual(code, "hello world");
});

test("generator with var", t => {
  const tokens = tokenizer("hello {{name}}");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const codeWithoutContext = codeGenerator(newAst);

  t.deepEqual(codeWithoutContext, "hello ");

  const codeWithContext = codeGenerator(newAst, { name: "world" });

  t.deepEqual(codeWithContext, "hello world");
});
