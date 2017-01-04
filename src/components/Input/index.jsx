// Core
import React, { PropTypes } from 'react';

// PropTypes
const { string, func } = PropTypes;
const propTypes = {
  name: string,
  onChange: func,
  value: string,
};

const Input = ({ name, onChange, value }) => (
  <div>
    <input
      name={name}
      onChange={e => onChange(e.target.value)}
      defaultValue={value}
    />
  </div>
);

Input.propTypes = propTypes;

export default Input;
