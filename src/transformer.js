/**
 * traver AST
 * @param ast
 * @param visitor
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => traverseNode(child, parent));
  }

  /**
   * 遍历节点
   * @param node
   * @param parent
   */
  function traverseNode(node, parent) {
    const method = visitor[node.type];

    if (method) {
      method(node, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;
      case "Expression":
        traverseArray(node.params, node);
        break;
      case "NumberLiteral":
        break;
      case "StringLiteral":
        break;
      case "Whitespace":
        break;
      case "Symbol":
        break;
      default:
        throw new TypeError(node.type);
    }
  }
  traverseNode(ast, null);
}

/**
 * Transform AST
 * @param ast
 * @returns {{type: string, body: Array}}
 */
function transformer(ast) {
  const newAst = {
    type: "Program",
    body: []
  };
  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: function(node, parent) {
      parent._context.push({
        type: "NumberLiteral",
        value: node.value
      });
    },
    StringLiteral: function(node, parent) {
      // 如果父级是表达式
      // 那么这里的字符串应该是变量
      if (parent.type === "Expression") {
        // 变量名必须以a-z开头
        if (!/^[a-z]/i.test(node.value)) {
          throw new Error("Invalid Var: " + node.value);
        }
        parent._context.push({
          type: "Variable",
          value: node.value
        });
      } else {
        parent._context.push({
          type: "StringLiteral",
          value: node.value
        });
      }
    },
    Whitespace(node, parent) {
      // 如果空格是在表达式中的，那么这个空格会被忽略
      if (parent && parent.type === "Expression") {
        return;
      }
      parent._context.push({
        type: "Whitespace",
        value: node.value
      });
    },
    Symbol(node, parent) {
      // 表达式里面不能包含符号
      if (parent.type === "Expression") {
        throw new Error(
          `The Expression can not include Symbol "${node.value}"`
        );
      }

      parent._context.push({
        type: "Symbol",
        value: node.value
      });
    },
    Expression: function(node, parent) {
      let expression = {
        type: "Expression",
        arguments: []
      };

      node._context = expression.arguments;

      if (parent.type !== "Expression") {
        expression = {
          type: "ExpressionStatement",
          expression: expression
        };
      }

      parent._context.push(expression);
    }
  });
  return newAst;
}

module.exports = transformer;
