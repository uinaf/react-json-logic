// Core
import React, { Component, PropTypes } from 'react';

// PropTypes
const { string, object, func } = PropTypes;
const propTypes = {
  onChange: func,
  value: string,
  data: object,
};

const defaultProps = {
  value: '',
};

class Accessor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  onChange = (value, level) => {
    let values = this.state.value.split('.').slice(0, level);

    values[level] = value;
    values = values.join('.');

    this.setState({ value: values }, () => this.props.onChange(values));
  }

  renderSelector = (data, level) => {
    const { value } = this.state;
    const splittedValue = value.split('.');

    if (typeof data === 'object' && Object.keys(data).length > 0) {
      return (
        <span>
          <select
            value={splittedValue[level] || ''}
            onChange={e => this.onChange(e.target.value, level)}
          >
            <option disabled>
              Select
            </option>

            {Object.keys(data).map((item, index) => (
              <option
                key={`${level}.${index}`}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {this.renderSelector(data[splittedValue[level]], level + 1)}
        </span>
      );
    }

    return null;
  }

  render() {
    return (
      <div>
        {this.renderSelector(this.props.data, 0)}
      </div>
    );
  }
}

Accessor.propTypes = propTypes;
Accessor.defaultProps = defaultProps;

export default Accessor;
