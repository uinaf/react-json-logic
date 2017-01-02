// Core
import React, { Component } from 'react';

// UI
import Any from './components/Any';

// PropTypes
const propTypes = {};

class JsonLogicBuilder extends Component {
  constructor() {
    super();
    this.state = {
      value: {},
    };
  }

  render() {
    return (
      <div>
        <Any onChange={value => this.setState({ value })} />

        <br />
        <br />

        {JSON.stringify(this.state.value)}
      </div>
    );
  }
}

JsonLogicBuilder.propTypes = propTypes;

export default JsonLogicBuilder;
