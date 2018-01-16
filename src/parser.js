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

        if (!nextToken) {
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

          ++current;

          token = tokens[++current];

          while (
            token.type !== "paren" ||
            (token.type === "paren" && token.value !== "}")
          ) {
            node.params.push(walk());
            token = tokens[current];
          }

          token = tokens[++current];

          if (token.type !== "paren" && token.value !== "}") {
            throw new Error("Expression {{ must with }} at the end");
          }

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
