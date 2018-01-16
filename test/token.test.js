import test from "ava";
import { tokenizer } from "../index";

console.log(process.pid);

test("Basic tokenizer", t => {
  const tokens = tokenizer("hello world");

  t.deepEqual(tokens, [
    {
      type: "string",
      value: "hello"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "string",
      value: "world"
    }
  ]);
});

test("Basic tokenizer with number", t => {
  const tokens = tokenizer("In 1992");

  t.deepEqual(tokens, [
    {
      type: "string",
      value: "In"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "number",
      value: "1992"
    }
  ]);
});

test("Basic tokenizer with numberic", t => {
  const tokens = tokenizer("In 19th");

  t.deepEqual(tokens, [
    {
      type: "string",
      value: "In"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "number",
      value: "19"
    },
    {
      type: "string",
      value: "th"
    }
  ]);
});

test("Basic tokenizer with var", t => {
  const tokens = tokenizer("Hello {{name}}");

  t.deepEqual(tokens, [
    {
      type: "string",
      value: "Hello"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "paren",
      value: "{"
    },
    {
      type: "paren",
      value: "{"
    },
    {
      type: "string",
      value: "name"
    },
    {
      type: "paren",
      value: "}"
    },
    {
      type: "paren",
      value: "}"
    }
  ]);
});

test("Basic tokenizer with double var", t => {
  const tokens = tokenizer("{{name}} is {{age}} years old");

  t.deepEqual(tokens, [
    {
      type: "paren",
      value: "{"
    },
    {
      type: "paren",
      value: "{"
    },
    {
      type: "string",
      value: "name"
    },
    {
      type: "paren",
      value: "}"
    },
    {
      type: "paren",
      value: "}"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "string",
      value: "is"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "paren",
      value: "{"
    },
    {
      type: "paren",
      value: "{"
    },
    {
      type: "string",
      value: "age"
    },
    {
      type: "paren",
      value: "}"
    },
    {
      type: "paren",
      value: "}"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "string",
      value: "years"
    },
    {
      type: "whitespace",
      value: " "
    },
    {
      type: "string",
      value: "old"
    }
  ]);
});
