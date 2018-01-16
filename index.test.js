import test from "ava";
import { compiler } from "./index";

console.log(process.pid);

test("Basic compile", t => {
  t.deepEqual(compiler("hello {{name}}", { name: "world" }), "hello world");
});

test("compile without context", t => {
  t.deepEqual(compiler("hello {{name}}"), "hello ");
});

test("compile with double var", t => {
  t.deepEqual(
    compiler("This is {{name}}, and he is {{age}} years old", {
      name: "Mary",
      age: 21
    }),
    "This is Mary, and he is 21 years old"
  );
});

test("compile with Multi-line", t => {
  t.deepEqual(
    compiler("This is {{name}}, \n and he is {{age}} years old", {
      name: "Mary",
      age: 21
    }),
    "This is Mary, \n and he is 21 years old"
  );
});

test("compile with Multi-var with same value", t => {
  t.deepEqual(
    compiler("Hello {{name}}, Why did they call you {{name}}?", {
      name: "Mary",
      age: 21
    }),
    "Hello Mary, Why did they call you Mary?"
  );
});

test("compile with invalid var", t => {
  t.throws(function() {
    compiler("Hello {{.name}}", {
      name: "Mary"
    });
  });
});
