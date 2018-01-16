const tokenizer = require("./src/tokenizer");
const parser = require("./src/parser");
const transformer = require("./src/transformer");
const generator = require("./src/generator");

function compiler(input, context = {}) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  return generator(newAst, context);
}

module.exports = {
  tokenizer,
  parser,
  transformer,
  generator,
  compiler
};
