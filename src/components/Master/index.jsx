// Core
import React, { PropTypes, Component } from 'react';

// UI
import Any from '../Any';

// PropTypes
const propTypes = {
  onChange: PropTypes.func,
};

class JsonLogicBuilder extends Component {
  constructor() {
    super();
    this.state = {
      value: {},
    };
  }

  onChange = value => this.setState({ value }, () => this.props.onChange(value))

  render() {
    return (
      <div>
        <Any
          onChange={this.onChange}
          parent="master"
        />
      </div>
    );
  }
}

JsonLogicBuilder.propTypes = propTypes;

export default JsonLogicBuilder;
