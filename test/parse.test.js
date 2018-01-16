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

test("parse with double var", t => {
  const tokens = tokenizer("{{name}} is {{age}} years old");
  const ast = parser(tokens);

  t.deepEqual(ast, {
    type: "Program",
    body: [
      {
        type: "Expression",
        params: [
          {
            type: "StringLiteral",
            value: "name"
          }
        ]
      },
      {
        type: "Whitespace",
        value: " "
      },
      {
        type: "StringLiteral",
        value: "is"
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
            value: "age"
          }
        ]
      },
      {
        type: "Whitespace",
        value: " "
      },
      {
        type: "StringLiteral",
        value: "years"
      },
      {
        type: "Whitespace",
        value: " "
      },
      {
        type: "StringLiteral",
        value: "old"
      }
    ]
  });
});
