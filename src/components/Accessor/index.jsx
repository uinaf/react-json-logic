// Core
import React, { PropTypes } from 'react';

// PropTypes
const { string, object, func } = PropTypes;
const propTypes = {
  name: string,
  onChange: func,
  value: string,
  data: object,
};

const Input = ({ name, onChange, value, data }) => (
  <div>
    {JSON.stringify(data)}
    <input
      name={name}
      onChange={e => onChange(e.target.value)}
      defaultValue={value}
      placeholder="Accessor"
    />
  </div>
);

Input.propTypes = propTypes;

export default Input;
