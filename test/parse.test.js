import test from "ava";
import { tokenizer, parser } from "../index";

console.log(process.pid);

test("Basic parse", t => {
  const tokens = tokenizer("hello world");

  const ast = parser(tokens);

  t.deepEqual(ast, {
    type: "Program",
    body: [
      { type: "StringLiteral", value: "hello" },
      { type: "Whitespace", value: " " },
      { type: "StringLiteral", value: "world" }
    ]
  });
});

test("parse with var", t => {
  const tokens = tokenizer("hello {{name}}");

  const ast = parser(tokens);

  t.deepEqual(ast, {
    type: "Program",
    body: [
      {
        type: "StringLiteral",
        value: "hello"
      },
      {
        type: "Whitespace",
        value: " "
      },
      {
        type: "Expression",
        params: [
          {
            type: "StringLiteral",
            value: "name"
          }
        ]
      }
    ]
  });
});
