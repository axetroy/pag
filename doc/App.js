import React, { Component } from "react";
import "./App.css";
import { tokenizer, parser, transformer, generator } from "../index";
import Split from "split.js/split";

class SplitComponent extends Component {
  constructor() {
    super();
    this.state = {
      defaultText:
        `
Q: Hello {{name}}, How old are you?

    A: I am {{age}} years old.

Q: Where You live in?

    A: I live in {{address.city}} {{address.street}}

Q: Is this Cool?

    A: May be.
    
Q: What is this?
    
    A: Just a template engine. It can help you to learn how to write a compiler.
`,
      output: "",
      variables: JSON.stringify(
        {
          name: "Mary",
          age: 21,
          address: {
            city: "NewYork",
            street: "Chinatown"
          }
        },
        null,
        2
      ),
      ast: ""
    };
  }

  componentDidMount() {
    const { a, b, c, d, e } = this.refs;
    Split([a, b], { sizes: [40, 60] });
    Split([c, d, e], {
      direction: "vertical",
      sizes: [33, 33, 33],
      minSize: 200
    });

    this.update(this.state.defaultText, this.state.variables);
  }

  update(code, contextString) {
    const update = {};

    try {
      const token = tokenizer(code);
      const initialAST = parser(token);
      const AST = transformer(initialAST);
      update.output = generator(AST, JSON.parse(contextString));
      update.ast = JSON.stringify(AST, null, 2);
    } catch (err) {
      update.output = err.message;
      update.ast = "";
    }

    this.setState({
      output: update.output,
      ast: update.ast
    });
  }

  render() {
    return (
      <div>
        <div className="split split-horizontal" ref={"a"}>
          <div ref="c">
            <div className="box">
              <h3>Input</h3>
              <textarea
                ref={"c"}
                className="split split-vertical"
                value={this.state.defaultText}
                onChange={e => {
                  this.setState({
                    defaultText: e.target.value
                  });
                  this.update(e.target.value, this.state.variables);
                }}
                style={{ border: 0, width: "100%", height: "100%" }}
              />
            </div>
          </div>
          <div ref={"d"} className="split split-vertical">
            <div className="box">
              <h3>Variables</h3>
              <textarea
                value={this.state.variables}
                onChange={e => {
                  this.setState({
                    variables: e.target.value
                  });
                  this.update(this.state.defaultText, e.target.value);
                }}
                style={{
                  border: 0,
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          </div>

          <div className="split split-vertical" ref={"e"}>
            <div className="box">
              <h3>Output</h3>
              <pre>{this.state.output}</pre>
            </div>
          </div>
        </div>
        <div className="split split-horizontal" ref={"b"}>
          <div className="box">
            <h3>AST Tree</h3>
            <pre>{this.state.ast}</pre>
          </div>
        </div>
      </div>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <div>
        <SplitComponent />
      </div>
    );
  }
}
