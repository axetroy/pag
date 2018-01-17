/**
 * traver AST
 * @param ast
 * @param visitor
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach((child, i) =>
      traverseNode(child, parent, array[i - 1], array[i + 1])
    );
  }

  /**
   *
   * @param node
   * @param parent
   * @param prev
   * @param next
   */
  function traverseNode(node, parent, prev, next) {
    const method = visitor[node.type];

    method && method(node, parent, prev, next);

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
    StringLiteral: function(node, parent, prev, next) {
      // 如果父级是表达式
      // 那么这里的字符串应该是变量
      if (parent.type === "Expression") {
        // 变量名必须以a-z开头
        if (!/^[a-z]/i.test(node.value)) {
          throw new Error("Invalid Var: " + node.value);
        }

        if (
          (prev && prev.type === "Symbol") ||
          (next && next.type === "Symbol")
        ) {
          // ignore
        } else {
          parent._context.push({
            type: "Variable",
            value: node.value
          });
        }
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
    Symbol(node, parent, prev, next) {
      // 表达式里面不能包含符号
      // 除了属性操作符 .
      if (parent.type === "Expression") {
        if (node.value === ".") {
          if (!prev || !next) {
            throw new Error(`Expression with property select is invalid`);
          }

          // 前后的属性必须是字符串字面量(会被解析成为变量)
          if (prev.type !== "StringLiteral" || next.type !== "StringLiteral") {
            throw new Error("Invalid Object");
          }

          let expression = {
            type: "MemberExpression",
            object: prev.value,
            paths: []
          };

          let i = parent.params.findIndex(v => v === node);

          while (next && i < parent.params.length) {
            next = parent.params[++i];
            if (!next) break;
            // 奇数，应该是路径
            if (i % 2 === 0) {
              expression.paths.push(next.value);
            } else {
              if (next.type !== "Symbol") {
                throw new Error(`Invalid expression`);
              }
            }
          }

          const last = parent._context[parent._context.length - 1];

          // 如果上一段，是一个表达式的话，那么会被忽略
          if (
            last &&
            last.type === "ExpressionStatement" &&
            last.expression.type === "MemberExpression"
          ) {
            return;
          }

          parent._context.push({
            type: "ExpressionStatement",
            expression: expression
          });

          return;
        } else {
          throw new Error(
            `The Expression can not include Symbol "${node.value}"`
          );
        }
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
