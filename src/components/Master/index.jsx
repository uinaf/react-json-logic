/**
 * Master Field
 *
 * Renders one `Any` field and expects onChange, value and data props to consturct a logical
 * recursion for rendering the rest of the JSON Logic Expression.
 *
 * - onChange: Returns the latest expression.
 * - value:    Initial value of the json logic expresison.
 * - data:     Data available for accessor fields.
 */

// Core
import React, { PropTypes, Component } from 'react';

// UI
import Any from '../Any';

// PropTypes
const { func, object } = PropTypes;
const propTypes = {
  onChange: func,
  value: object,
  data: object,
};

const defaultProps = {
  value: {},
  data: {},
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
          data={this.props.data}
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
