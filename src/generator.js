/**
 * Generate the code
 * @param node
 * @param context
 * @returns {*}
 */
function generator(node, context = {}) {
  switch (node.type) {
    case "Program":
      return node.body.map(v => generator(v, context)).join("");
    case "ExpressionStatement":
      return generator(node.expression, context);
    case "Expression":
      return node.arguments.map(node => generator(node, context)).join("");
    case "MemberExpression":
      let obj = context[node.object] || {};
      for (let i = 0; i < node.paths.length; i++) {
        const p = node.paths[i];
        obj = obj[p];
        if (obj === undefined) {
          return "";
        } else if (!obj) {
          return obj;
        }
      }
      return obj;
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
    default:
      throw new TypeError(`Invalid Type ${node.type}`);
  }
}

module.exports = generator;
