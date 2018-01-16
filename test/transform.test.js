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
          callee: {
            type: "Identifier",
            name: "call"
          },
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
