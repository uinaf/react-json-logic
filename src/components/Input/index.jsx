// Core
import React, { PropTypes } from 'react';

// PropTypes
const propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
};

const Input = ({ name, onChange }) => (
  <div>
    <input
      name={name}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

Input.propTypes = propTypes;

export default Input;
