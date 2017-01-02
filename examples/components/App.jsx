import React, { Component } from 'react';
import ReactJsonLogic, { applyLogic } from '../../dist';

class App extends Component {
  constructor() {
    super();
    this.state = {
      value: {},
      result: undefined,
    };
  }

  onEvaluate = () => {
    this.setState({ result: applyLogic(this.state.value) });
  }

  render() {
    const { value, result } = this.state;

    return (
      <div>
        <h4>
         ReactJsonLogic
        </h4>

        <ReactJsonLogic
          onChange={e => this.setState({ value: e })}
        />

        <hr />

        <b>
          Built Logic:
        </b>

        <br />

        <code>
          {JSON.stringify(value)}
        </code>

        <br />
        <br />

        <button onClick={() => this.onEvaluate()}>
          Evaluate
        </button>

        <br />
        <br />

        Result: <b>{JSON.stringify(result)}</b>
      </div>
    );
  }
}

export default App;
