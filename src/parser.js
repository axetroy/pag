/**
 * Parse the token
 * @param tokens
 * @returns {{type: string, body: Array}}
 */
function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value
      };
    }

    // 如果是{}
    if (token.type === "paren") {
      if (token.value === "{") {
        const nextToken = tokens[current + 1];

        if (
          !nextToken ||
          (nextToken.type !== "paren" && nextToken.value !== "{")
        ) {
          current++;
          return {
            type: "StringLiteral",
            value: token.value
          };
        }

        // 如果上一个节点也是{，那么是一个表达式
        if (nextToken.type === "paren" && nextToken.value === "{") {
          const node = {
            type: "Expression",
            params: []
          };

          ++current; // 跳过 {
          ++current; // 跳过下一个 {

          token = tokens[current];

          // 不断循环，遇见 } 则停止
          while (
            token.type !== "paren" ||
            (token.type === "paren" && token.value !== "}")
          ) {
            node.params.push(walk());
            token = tokens[current];
          }

          // 解析表达式完成
          // 接下来看看下面两个token，是否是 }} 结尾
          token = tokens[current];
          const nextToken = tokens[++current];

          if (
            token.type === "paren" &&
            token.value === "}" &&
            nextToken &&
            nextToken.type === token.type &&
            nextToken.value === token.value
          ) {
            current++; // 跳过 }
            return node;
          } else {
            throw new Error("Expression {{ must with }} at the end");
          }
        } else {
          current++;
          return {
            type: "StringLiteral",
            value: token.value
          };
        }
      } else {
        // 如果字符串是 {}, 但是它不是表达式
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
      }
    }

    // 如果是字符串
    if (token.type === "string") {
      current++;
      return {
        type: "StringLiteral",
        value: token.value
      };
    }

    // 如果是空白符
    if (token.type === "whitespace") {
      current++;
      return {
        type: "Whitespace",
        value: token.value
      };
    }

    // 如果是其他的字符
    if (token.type === "symbol") {
      current++;
      return {
        type: "Symbol",
        value: token.value
      };
    }

    throw new TypeError("Invalid type " + token.type + ":" + token.value);
  }

  const ast = {
    type: "Program",
    body: []
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

module.exports = parser;
