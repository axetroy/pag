/**
 * Parse the token
 * @param tokens
 * @returns {{type: string, body: Array}}
 */
function parser(tokens) {
  tokens = tokens.map((t, i) => {
    t.i = i;
    return t;
  });

  let current = 0;

  function walk() {
    let token = tokens[current];

    switch (token.type) {
      case "number":
        current++;
        return {
          type: "NumberLiteral",
          value: token.value
        };
      case "string":
        current++;
        return {
          type: "StringLiteral",
          value: token.value
        };
      case "whitespace":
        current++;
        return {
          type: "Whitespace",
          value: token.value
        };
      case "symbol":
        current++;
        return {
          type: "Symbol",
          value: token.value
        };
      // 处理 {} 符号
      case "paren":
        switch (token.value) {
          case "{":
            let nextToken = tokens[current + 1];

            // 如果这个是最后一个字符
            if (!nextToken) {
              current++;
              return {
                type: "StringLiteral",
                value: token.value
              };
            }

            // 下一个token必须是双{{才是表达式，否则只是字符串
            if (nextToken.type !== "paren" && nextToken.value !== "{") {
              current++;
              return {
                type: "StringLiteral",
                value: token.value
              };
            }

            // 基本确认是一个表达式
            const node = {
              type: "Expression",
              params: []
            };

            ++current; // 跳过第一个括号 {
            ++current; // 跳过第二个括号 {

            // 如果以为 {{ 作为结尾，那么自是普通的字符串
            if (tokens[current + 1] === undefined) {
              --current;
              return {
                type: "StringLiteral",
                value: token.value
              };
            }

            token = tokens[current];
            nextToken = tokens[current + 1];

            // 找到以 } 字符串，作为表达式的中点，中间的内容全部为表达式的参数
            while (token && token.type !== "paren" && token.value !== "}") {
              const s = walk();
              node.params.push(s);
              token = tokens[current];
              nextToken = tokens[current + 1];
            }

            token = tokens[current]; // 如果是表达式, 那么这个的token的值应该为 }
            nextToken = tokens[++current]; // 如果是表达式，那么这个token的值也应该为 }, 以 }} 结尾

            current++; // 指针往前一格

            // 如果表达式不完整 {{name}

            // 此时的token，要么是}, 要么是undefined
            // 那么它只作为普通的字符串
            if (!token) {
              // 虽然前面有{{，但是有吗没有相应的字段了
              // 所以，它依旧只是普通的字符串
              return {
                type: "StringLiteral",
                value: "{{" + node.params.map(n => n.value).join("")
              };
            }

            if (!nextToken) {
              return {
                type: "StringLiteral",
                value: token.value
              };
            }

            // 此时，已经能确定是 {{} 的形式

            // 如果下一个token，不是}
            // 比如 {{name}abc nextToken.value = a
            // 那么它也只是普通的字符串而已
            if (nextToken.type !== "paren" || nextToken.value !== "}") {
              return {
                type: "StringLiteral",
                value:
                  "{{" +
                  node.params.map(n => n.value).join("") +
                  "}" +
                  nextToken.value
              };
            }

            return node;
          case "}":
            // 如果字符串是 }, 那么自是普通的字符串, {{}}的表达式，已经在 {的操作中处理了
            current++;
            return {
              type: "StringLiteral",
              value: token.value
            };
        }
        break;
      default:
        throw new TypeError("Invalid type " + token.type + ":" + token.value);
    }
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
