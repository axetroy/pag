/**
 * Parse the token
 * @param tokens
 * @returns {{type: string, body: Array}}
 */
function parser(tokens) {
  let current = 0;

  function walk() {
    // walk函数里，我们从当前token开始
    let token = tokens[current];

    // 对于不同类型的结点，对应的处理方法也不同，我们从 `number` 类型的 token 开始。
    // 检查是不是 `number` 类型
    if (token.type === "number") {
      // 如果是，`current` 自增。
      current++;

      // 然后我们会返回一个新的 AST 结点 `NumberLiteral`，并且把它的值设为 token 的值。
      return {
        type: "NumberLiteral",
        value: token.value
      };
    }

    // 接下来我们检查是不是 CallExpressions 类型，我们从左圆括号开始。
    if (token.type === "paren") {
      if (token.value === "{") {
        const nextToken = tokens[current + 1];

        if (!nextToken) {
          return {
            type: "StringLiteral",
            value: token.value
          };
        }

        // 如果上一个节点也是{，那么是一个表达式
        if (nextToken.type === "paren" && nextToken.value === "{") {
          // 我们创建一个类型为 `CallExpression` 的根节点，然后把它的 name 属性设置为当前
          // token 的值，因为紧跟在左圆括号后面的 token 一定是调用的函数的名字。
          const node = {
            type: "Expression",
            params: []
          };

          ++current;

          // 我们再次自增 `current` 变量，跳过当前的 token
          token = tokens[++current];

          // 所以我们创建一个 `while` 循环，直到遇到类型为 `'paren'`，值为右圆括号的 token。
          while (
            token.type !== "paren" ||
            (token.type === "paren" && token.value !== "}")
          ) {
            // 我们调用 `walk` 函数，它将会返回一个结点，然后我们把这个节点
            // 放入 `node.params` 中。
            node.params.push(walk());
            token = tokens[current];
          }

          token = tokens[++current];

          if (token.type !== "paren" && token.value !== "}") {
            throw new Error("Expression {{ must with }} at the end");
          }

          // 我们最后一次增加 `current`，跳过右圆括号。
          current++;

          return node;
        } else {
          current++;

          return {
            type: "StringLiteral",
            value: token.value
          };
        }
      } else {
        const node = {
          type: "StringLiteral",
          value: token.value
        };
        while (current < tokens.length) {
          const next = tokens[++current];
          if (next) {
            if (next.type !== "string") {
              node.value += next.value;
            } else if (next.type === "paren") {
              if (next.value === "{") {
                break;
              } else {
                node.value += next.value;
              }
            } else {
              break;
            }
          } else {
            break;
          }
        }
        current++;
        return node;
      }
    }

    if (token.type === "string") {
      current++;
      return {
        type: "StringLiteral",
        value: token.value
      };
    }

    // 空白字符串
    if (token.type === "whitespace") {
      current++;
      return {
        type: "Whitespace",
        value: token.value
      };
    }

    if (token.type === "symbol") {
      current++;
      return {
        type: "Symbol",
        value: token.value
      };
    }

    // 同样，如果我们遇到了一个类型未知的结点，就抛出一个错误。
    throw new TypeError("Invalid type " + token.type + ":" + token.value);
  }

  // 现在，我们创建 AST，根结点是一个类型为 `Program` 的结点。
  const ast = {
    type: "Program",
    body: []
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // 最后我们的语法分析器返回 AST
  return ast;
}

module.exports = parser;
