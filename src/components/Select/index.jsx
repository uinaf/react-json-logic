// Core
import React, { PropTypes } from 'react';

// PropTypes
const propTypes = {
  value: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
};

const Select = ({ value, options, onChange }) => (
  <div>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value={''} disabled>
        Select an Operator
      </option>

      {options.map((option, index) => (
        <option
          key={index}
          value={option.label}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

Select.propTypes = propTypes;

export default Select;
