// Core
import React, { Component, PropTypes } from 'react';

// Helpers
import isEqual from 'lodash.isequal';

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

  componentWillReceiveProps(nextProps) {
    const { value } = this.props;

    if (!isEqual(value, nextProps.value)) {
      this.setState({
        value: nextProps.value,
      });
    }
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

    let iterator = null;

    // @TODO: Parsing array fields discussion.
    if (Array.isArray(data)) {
      iterator = Object.keys(data[0]);
    } else if (data !== null && typeof data === 'object') {
      iterator = Object.keys(data);
    }

    if (iterator) {
      return (
        <span>
          <select
            value={splittedValue[level] || ''}
            onChange={e => this.onChange(e.target.value, level)}
          >
            <option disabled>
              Select
            </option>

            {iterator.map((item, index) => (
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
