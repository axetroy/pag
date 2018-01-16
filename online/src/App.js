import React, { Component } from "react";
import "./App.css";
import { tokenizer, parser, transformer, generator } from "@axetroy/pag";
import Split from "split.js";

class SplitComponent extends Component {
  constructor() {
    super();
    this.state = {
      defaultText: "Hello {{name}}",
      output: "",
      variables: JSON.stringify({ name: "world" }, null, 2),
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
            style={{ border: 0, width: "100%" }}
          />
          <textarea
            ref={"d"}
            className="split split-vertical"
            value={this.state.variables}
            onChange={e => {
              this.setState({
                variables: e.target.value
              });
              this.update(this.state.defaultText, e.target.value);
            }}
            style={{ border: 0, width: "100%" }}
          />
          <pre className="split split-vertical" ref={"e"}>
            {this.state.output}
          </pre>
        </div>
        <pre className="split split-horizontal" ref={"b"}>
          {this.state.ast}
        </pre>
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
