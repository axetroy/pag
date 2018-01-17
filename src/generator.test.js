import test from "ava";
import { tokenizer, parser, transformer, generator } from "../index";

console.log(process.pid);

test("Basic generator", t => {
  const tokens = tokenizer("hello world");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const code = generator(newAst);

  t.deepEqual(code, "hello world");
});

test("generator with var", t => {
  const tokens = tokenizer("hello {{name}}");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const codeWithoutContext = generator(newAst);

  t.deepEqual(codeWithoutContext, "hello ");

  const codeWithContext = generator(newAst, { name: "world" });

  t.deepEqual(codeWithContext, "hello world");
});

test("generator with double var", t => {
  const tokens = tokenizer("{{name}} is {{age}} years old");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const codeWithoutContext = generator(newAst);

  t.deepEqual(codeWithoutContext, " is  years old"); // name 和 age都没有， 会被替换为''字符串

  const codeWithContext = generator(newAst, { name: "Mary", age: 21 });

  t.deepEqual(codeWithContext, "Mary is 21 years old");
});

test("generator with special characters", t => {
  const tokens = tokenizer("Hello, world!");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const codeWithoutContext = generator(newAst);

  t.deepEqual(codeWithoutContext, "Hello, world!");

  const codeWithContext = generator(newAst, { name: "Mary", age: 21 });

  t.deepEqual(codeWithContext, "Hello, world!");
});

test("generator with . property operator", t => {
  const tokens = tokenizer(
    "Hello, {{name}}!, I am from {{address.city}}, Here is the code: {{address.code}}"
  );

  const ast = parser(tokens);

  const newAst = transformer(ast);

  const codeWithoutContext = generator(newAst);

  t.deepEqual(codeWithoutContext, "Hello, !, I am from , Here is the code: ");

  const codeWithContext = generator(newAst, {
    name: "Mary",
    address: {
      city: "NewYork",
      code: 1000
    }
  });

  t.deepEqual(codeWithContext, "Hello, Mary!, I am from NewYork, Here is the code: 1000");
});
