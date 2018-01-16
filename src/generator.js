/**
 * Generate the code
 * @param node
 * @param context
 * @returns {*}
 */
function generator(node, context = {}) {
  // 对于不同 `type` 的结点分开处理。
  switch (node.type) {
    case "Program":
      return node.body.map(v => generator(v, context)).join("");

    case "ExpressionStatement":
      return generator(node.expression, context); // << (...因为我们喜欢用*正确*的方式写代码)

    case "Expression":
      return node.arguments.map(node => generator(node, context)).join("");

    case "Identifier":
      return "";

    case "NumberLiteral":
      return node.value;

    case "StringLiteral":
      return node.value;

    case "Whitespace":
      return node.value;

    case "Symbol":
      return node.value;

    case "Variable":
      return context[node.value];

    // 如果我们不能识别这个结点，那么抛出一个错误。
    default:
      throw new TypeError(`Invalid Type ${node.type}`);
  }
}

module.exports = generator;
