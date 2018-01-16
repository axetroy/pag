import test from "ava";
import { tokenizer, parser, transformer } from "../index";

console.log(process.pid);

test("Basic transform", t => {
  const tokens = tokenizer("hello world");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  t.deepEqual(newAst, {
    type: "Program",
    body: [
      { type: "StringLiteral", value: "hello" },
      { type: "Whitespace", value: " " },
      { type: "StringLiteral", value: "world" }
    ]
  });
});

test("transform with var", t => {
  const tokens = tokenizer("hello {{name}}");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  t.deepEqual(newAst, {
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
        type: "ExpressionStatement",
        expression: {
          type: "Expression",
          arguments: [
            {
              type: "Variable",
              value: "name"
            }
          ]
        }
      }
    ]
  });
});

test("transform with double var", t => {
  const tokens = tokenizer("{{name}} is {{age}} years old");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  t.deepEqual(newAst, {
    type: "Program",
    body: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "Expression",
          arguments: [
            {
              type: "Variable",
              value: "name"
            }
          ]
        }
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
        type: "ExpressionStatement",
        expression: {
          type: "Expression",
          arguments: [
            {
              type: "Variable",
              value: "age"
            }
          ]
        }
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

test("transform with special characters", t => {
  const tokens = tokenizer("Hello, world!");

  const ast = parser(tokens);

  const newAst = transformer(ast);

  t.deepEqual(newAst, {
    type: "Program",
    body: [
      { type: "StringLiteral", value: "Hello" },
      { type: "Symbol", value: "," },
      { type: "Whitespace", value: " " },
      { type: "StringLiteral", value: "world" },
      { type: "Symbol", value: "!" }
    ]
  });
});
