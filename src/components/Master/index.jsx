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

// Helpers
import isEqual from 'lodash.isequal';

// UI
import Any from '../Any';

// PropTypes
const { func, object, string, oneOfType } = PropTypes;
const propTypes = {
  onChange: func,
  value: object,
  data: oneOfType([object, string]),
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

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.value, nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }

  onChange = value => this.setState({ value }, () => this.props.onChange(value))

  parseData = (data) => {
    if (typeof data !== 'object') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }

    return data;
  }

  render() {
    return (
      <div>
        <Any
          parent="master"
          data={this.parseData(this.props.data)}
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
