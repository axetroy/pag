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

  t.throws(function() {
    compiler("Hello {{_name}}", {
      name: "Mary"
    });
  });
});

test("empty string in expression", t => {
  let r = compiler("Hello {{ name}}", {
    name: "Mary"
  });
  // ignore the whiteSpace
  t.deepEqual(r, "Hello Mary");
});

test("Invalid expression", t => {
  const r = compiler("Hello {{name}} {", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary {");
});

test("Invalid expression", t => {
  const r = compiler("Hello {{name}} {{", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary {{");
});

test("Invalid expression", t => {
  const r = compiler("Hello {{name}} {{ \n hello", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary {{ \n hello");
});

test("Compile with number", t => {
  const r = compiler("Hello {{name}}, now is 21th.", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary, now is 21th.");
});

test("Invalid expression", t => {
  const r = compiler("Hello {{name}} {{}", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary {{}");
});

test("Invalid expression", t => {
  const r = compiler("Hello {{name}} {{} abc", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary {{} abc");
});

test("Invalid expression", t => {
  const r = compiler("Hello {{name}} {{}\n}abc", {
    name: "Mary"
  });
  t.deepEqual(r, "Hello Mary {{}\n}abc");
});

test("Invalid expression", t => {
  const r = compiler("{{{{", {
    name: "Mary"
  });
  t.deepEqual(r, "{{{{");
});

test("Invalid expression", t => {
  const r = compiler("}}}}", {
    name: "Mary"
  });
  t.deepEqual(r, "}}}}");
});

test("Invalid expression", t => {
  t.throws(function() {
    compiler("{{{}}}");
  });
});
