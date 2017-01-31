// Core
import React, { PropTypes } from 'react';
import Select from 'react-select';

// PropTypes
const { string, array, func } = PropTypes;
const propTypes = {
  value: string,
  options: array.isRequired,
  onChange: func.isRequired,
};

const defaultProps = {
  value: '',
};

const SelectOperator = ({ value, options, onChange }) => (
  <div style={{ display: 'inline', fontWeight: 'bold' }}>
    <Select
      clearable={false}
      value={value}
      onChange={e => onChange(e.value)}
      options={options.map(option => ({
        label: option.label,
        value: option.signature,
      }))}
    />
  </div>
);

SelectOperator.propTypes = propTypes;
SelectOperator.defaultProps = defaultProps;

export default SelectOperator;
