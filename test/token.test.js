import test from "ava";
import {tokenizer} from "../index";

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
