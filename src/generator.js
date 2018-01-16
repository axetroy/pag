/**
 * Generate the code
 * @param node
 * @param context
 * @returns {*}
 */
function generator(node, context = {}) {
  // 对于不同 `type` 的结点分开处理。
  switch (node.type) {
    // 如果是 `Program` 结点，那么我们会遍历它的 `body` 属性中的每一个结点，并且递归地
    case "Program":
      return node.body.map(v => generator(v, context)).join("");

    // 对于 `ExpressionStatements`,我们对它的 expression 属性递归调用
    case "ExpressionStatement":
      return generator(node.expression, context); // << (...因为我们喜欢用*正确*的方式写代码)

    case "Expression":
      // 在表达式中，替换变量
      return node.arguments.map(node => generator(node, context)).join(", ");

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
