/**
 * Input Field
 *
 * This can be considered as a free entry field which contains logic about the type of its content.
 *
 * - onChange: Returns the latest part of the expression rendered by this component. Used by its
 * parent (and grand parents) to complete structure, part by part.
 *
 * - value: Value of the field, passed from its parent.
 *
 * - type: Type of the field, will be determined with respect to the `typeof` result of the value.
 */

// Core
import React, { Component, PropTypes } from 'react';
import Select from 'react-select';

// Helpers
import isEqual from 'lodash.isequal';

// UI
import style from './style.scss';

// Constants
const INPUT_TYPES = ['text', 'number']; // @TODO: Add Date!

// Helpers
const isNumeric = value => typeof value === 'number';
const getType = (value, defaultType) => {
  if (isNumeric(value)) {
    return 'number';
  }

  return defaultType;
};

// PropTypes
const { any, string, func } = PropTypes;
const propTypes = {
  name: string,
  onChange: func.isRequired,
  value: any,
  type: string,
};

const defaultProps = {
  name: '',
  type: INPUT_TYPES[0],
  value: '',
};

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      type: getType(props.value, props.type),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { value, type } = this.props;

    if (!isEqual(value, nextProps.value) || !isEqual(type, nextProps.type)) {
      this.setState({
        value: nextProps.value,
        type: getType(nextProps.value, nextProps.type),
      });
    }
  }

  onTypeChange = (e) => {
    const type = e.value;
    let { value } = this.state;

    if (type === 'number') {
      value = parseFloat(value);
    } else {
      value = value.toString();
    }

    this.setState({ type }, () => this.props.onChange(value));
  }

  onValueChange = (e) => {
    const { type } = this.state;
    let value = e.target.value;

    if (type === 'number') {
      value = parseFloat(value);
    }

    this.props.onChange(value);
  }

  render() {
    const { name } = this.props;
    const { type, value } = this.state;

    return (
      <div>
        <div className={style.SelectWrapper}>
          <Select
            clearable={false}
            value={type}
            onChange={this.onTypeChange}
            options={INPUT_TYPES.map(inputType => ({
              label: inputType,
              value: inputType,
            }))}
          />
        </div>

        <div className={style.InputWrapper}>
          <input
            name={name}
            value={value}
            type={type}
            onChange={this.onValueChange}
          />
        </div>
      </div>
    );
  }
}

Input.propTypes = propTypes;
Input.defaultProps = defaultProps;

export default Input;
