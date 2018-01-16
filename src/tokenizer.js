/**
 * Generate the token
 * @param input
 * @returns {Array}
 */
function tokenizer(input) {
  let current = 0;
  const tokens = [];

  while (current < input.length) {
    let char = input[current];

    switch (char) {
      case "{":
        tokens.push({
          type: "paren",
          value: char
        });
        current++;
        continue;
      case "}":
        tokens.push({
          type: "paren",
          value: char
        });
        current++;
        continue;
      default:
        // 跳过空白字符
        const WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
          current++;
          tokens.push({
            type: "whitespace",
            value: char
          });
          continue;
        }

        const NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
          let value = "";

          while (NUMBERS.test(char)) {
            value += char;
            char = input[++current];
          }
          // 如果后面的字符不为空字符串或为字符串的借宿
          tokens.push({ type: "number", value: value });

          continue;
        }

        let LETTERS = /[\w]/i;
        if (LETTERS.test(char)) {
          let value = "";

          // 同样，我们用一个循环遍历所有的字母，把它们存入 value 中。
          while (char !== void 0 && LETTERS.test(char)) {
            value += char;
            char = input[++current];
          }

          tokens.push({
            type: "string",
            value: value
          });

          continue;
        }

        ++current;

        tokens.push({
          type: 'symbol',
          value: char
        });

        // continue;

        // throw new Error("Invalid grammar :" + char);
    }
  }

  return tokens;
}

module.exports = tokenizer;
