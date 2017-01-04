// Core
import React, { PropTypes, Component } from 'react';

// UI
import Any from '../Any';

// PropTypes
const { func, object } = PropTypes;
const propTypes = {
  onChange: func,
  value: object,
};

const defaultProps = {
  value: {},
};

class JsonLogicBuilder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  onChange = value => this.setState({ value }, () => this.props.onChange(value))

  render() {
    return (
      <div>
        <Any
          parent="master"
          onChange={this.onChange}
          value={this.state.value}
        />
      </div>
    );
  }
}

JsonLogicBuilder.propTypes = propTypes;
JsonLogicBuilder.defaultProps = defaultProps;

export default JsonLogicBuilder;
