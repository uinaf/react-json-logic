// Core
import React, { Component, PropTypes } from 'react';
import Select from 'react-select';

// Helpers
import isEqual from 'lodash.isequal';
import style from './style.scss';

// PropTypes
const { string, object, func } = PropTypes;
const propTypes = {
  onChange: func.isRequired,
  value: string,
  data: object, // @TODO: make this required and check presence on mount, throw error if empty
};

const defaultProps = {
  value: '',
  data: {},
};

class Accessor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.state;

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

    this.props.onChange(values);
  }

  renderSelector = (data, level) => {
    const { value } = this.state;
    const splittedValue = value.split('.');
    const levelValue = splittedValue[level] || '';

    let iterator = null;

    if (Array.isArray(data)) {
      iterator = Object.keys(data[0]);
    } else if (data !== null && typeof data === 'object') {
      iterator = Object.keys(data);
    }

    if (levelValue !== '' && !iterator.some(item => item === levelValue)) {
      iterator = [levelValue, ...iterator];
    }

    if (iterator) {
      return (
        <div className={style.IteratorWrapper}>
          <div className={style.SelectWrapper}>
            <Select.Creatable
              clearable={false}
              value={levelValue}
              onChange={e => this.onChange(e.value, level)}
              options={iterator.map(item => ({
                label: item,
                value: item,
              }))}
              promptTextCreator={label => `Create option: ${label}`}
            />
          </div>

          {this.renderSelector(data[levelValue], level + 1)}
        </div>
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
