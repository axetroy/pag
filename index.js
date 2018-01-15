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
          continue;
        }

        const NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
          let value = "";

          while (NUMBERS.test(char)) {
            value += char;
            char = input[++current];
          }

          tokens.push({
            type: "number",
            value: value
          });

          continue;
        }

        let LETTERS = /[\w'"-_]/i;
        if (LETTERS.test(char)) {
          let value = "";

          // 同样，我们用一个循环遍历所有的字母，把它们存入 value 中。
          while (LETTERS.test(char)) {
            value += char;
            char = input[++current];
          }

          tokens.push({
            type: "string",
            value: value
          });

          continue;
        }

        throw new Error("Invalid grammar :" + char);
    }
  }

  return tokens.map((t, i) => {
    t.i = i;
  return t;
});
}

/**
 * parse the token
 * @param tokens
 * @returns {{type: string, body: Array}}
 */
function parser(tokens) {
  let current = 0;

  function walk() {
    // walk函数里，我们从当前token开始
    var token = tokens[current];

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

      const node = {
        type: "StringLiteral",
        value: token.value
      };

      return node;
    }

    // 同样，如果我们遇到了一个类型未知的结点，就抛出一个错误。
    throw new TypeError(token.type + ":" + token.value);
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

/**
 * traver AST
 * @param ast
 * @param visitor
 */
function traverser(ast, visitor) {
  // `traverseArray` 函数允许我们对数组中的每一个元素调用 `traverseNode` 函数。
  function traverseArray(array, parent) {
    array.forEach(function(child) {
      traverseNode(child, parent);
    });
  }

  // `traverseNode` 函数接受一个 `node` 和它的父结点 `parent` 作为参数，这个结点会被
  // 传入到 visitor 中相应的处理函数那里。
  function traverseNode(node, parent) {
    // 首先我们看看 visitor 中有没有对应 `type` 的处理函数。
    var method = visitor[node.type];

    // 如果有，那么我们把 `node` 和 `parent` 都传入其中。
    if (method) {
      method(node, parent);
    }

    // 下面我们对每一个不同类型的结点分开处理。
    switch (node.type) {
      // 我们从顶层的 `Program` 开始，Program 结点中有一个 body 属性，它是一个由若干
      // 个结点组成的数组，所以我们对这个数组调用 `traverseArray`。
      //
      // （记住 `traverseArray` 会调用 `traverseNode`，所以我们会递归地遍历这棵树。）
      case "Program":
        traverseArray(node.body, node);
        break;

      // 下面我们对 `CallExpressions` 做同样的事情，遍历它的 `params`。
      case "Expression":
        traverseArray(node.params, node);
        break;

      // 如果是 `NumberLiterals`，那么就没有任何子结点了，所以我们直接 break
      case "NumberLiteral":
        break;

      // 如果是 `NumberLiterals`，那么就没有任何子结点了，所以我们直接 break
      case "StringLiteral":
        break;

      // 如果是 `NumberLiterals`，那么就没有任何子结点了，所以我们直接 break
      case "Variable":
        break;

      // 同样，如果我们不能识别当前的结点，那么就抛出一个错误。
      default:
        throw new TypeError(node.type);
    }
  }

  // 最后我们对 AST 调用 `traverseNode`，开始遍历。注意 AST 并没有父结点。
  traverseNode(ast, null);
}

/**
 * Transform AST
 * @param ast
 * @returns {{type: string, body: Array}}
 */
function transformer(ast) {
  // 创建 `newAST`，它与我们之前的 AST 类似，有一个类型为 Program 的根节点。
  var newAst = {
    type: "Program",
    body: []
  };

  // 下面的代码会有些奇技淫巧，我们在父结点上使用一个属性 `context`（上下文），这样我们就
  // 可以把结点放入他们父结点的 context 中。当然可能会有更好的做法，但是为了简单我们姑且
  // 这么做吧。
  //
  // 注意 context 是一个*引用*，从旧的 AST 到新的 AST。
  ast._context = newAst.body;

  // 我们把 AST 和 visitor 函数传入遍历器
  traverser(ast, {
    // 第一个 visitor 方法接收 `NumberLiterals`。
    NumberLiteral: function(node, parent) {
      // 我们创建一个新结点，名字叫 `NumberLiteral`，并把它放入父结点的 context 中。
      parent._context.push({
        type: "NumberLiteral",
        value: node.value
      });
    },
    // 第一个 visitor 方法接收 `NumberLiterals`。
    StringLiteral: function(node, parent) {
      // 我们创建一个新结点，名字叫 `StringLiteral`，并把它放入父结点的 context 中。
      // console.log(node);
      // console.log(parent);

      // 如果父级是表达式
      if (parent.type === "Expression") {
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
    Variable: function(node, parent) {
      parent._context.push({
        type: "Variable",
        value: node.value
      });
    },
    // 下一个，`CallExpressions`。
    Expression: function(node, parent) {
      // 我们创建一个 `CallExpression` 结点，里面有一个嵌套的 `Identifier`。
      let expression = {
        type: "Expression",
        callee: {
          type: "Identifier",
          name: "call"
        },
        arguments: []
      };

      // 下面我们在原来的 `CallExpression` 结点上定义一个新的 context，它是 expression
      // 中 arguments 这个数组的引用，我们可以向其中放入参数。
      node._context = expression.arguments;

      // 然后来看看父结点是不是一个 `CallExpression`，如果不是...
      if (parent.type !== "Expression") {
        // 我们把 `CallExpression` 结点包在一个 `ExpressionStatement` 中，这么做是因为
        // 单独存在（原文为top level）的 `CallExpressions` 在 JavaScript 中也可以被当做
        // 是声明语句。
        //
        // 译者注：比如 `var a = foo()` 与 `foo()`，后者既可以当作表达式给某个变量赋值，也
        // 可以作为一个独立的语句存在。
        expression = {
          type: "ExpressionStatement",
          expression: expression
        };
      }

      // 最后我们把 `CallExpression`（可能是被包起来的） 放入父结点的 context 中。
      parent._context.push(expression);
    }
  });

  // 最后返回创建好的新 AST。
  return newAst;
}

/**
 * Generate the code
 * @param node
 * @param context
 * @returns {*}
 */
function codeGenerator(node, context = {}) {
  // 对于不同 `type` 的结点分开处理。
  switch (node.type) {
    // 如果是 `Program` 结点，那么我们会遍历它的 `body` 属性中的每一个结点，并且递归地
    // 对这些结点再次调用 codeGenerator，再把结果打印进入新的一行中。
    case "Program":
      return node.body.map(v => codeGenerator(v, context)).join(" ");

    // 对于 `ExpressionStatements`,我们对它的 expression 属性递归调用，同时加入一个
    // 分号。
    case "ExpressionStatement":
      return codeGenerator(node.expression, context); // << (...因为我们喜欢用*正确*的方式写代码)

    // 对于 `CallExpressions`，我们会打印出 `callee`，接着是一个左圆括号，然后对
    // arguments 递归调用 codeGenerator，并且在它们之间加一个逗号，最后加上右圆括号。
    case "Expression":
      // 在表达式中，替换变量
      return node.arguments
        .map(node => codeGenerator(node, context))
    .join(", ");

    // 对于 `Identifiers` 我们只是返回 `node` 的 name。
    case "Identifier":
      return "";

    // 对于 `NumberLiterals` 我们只是返回 `node` 的 value
    case "NumberLiteral":
      return node.value;

    // 对于 `NumberLiterals` 我们只是返回 `node` 的 value
    case "StringLiteral":
      return node.value;

    case "Variable":
      console.log(node.value, context);
      return context[node.value];

    // 如果我们不能识别这个结点，那么抛出一个错误。
    default:
      throw new TypeError(node.type);
  }
}

function compiler(input, context = {}) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst, context);
  return output;
}

module.exports = {
  tokenizer,
  parser,
  transformer,
  codeGenerator,
  compiler
};
