// Core
import React, { Component, PropTypes } from 'react';

// PropTypes
const { string, object, func } = PropTypes;
const propTypes = {
  name: string,
  onChange: func,
  value: string,
  data: object,
};

class Accessor extends Component {
  constructor(props) {
    super(props);
    console.log(props.data);
  }

  render() {
    const { name, onChange, value, data } = this.props;

    return (
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
  }
}

Accessor.propTypes = propTypes;

export default Accessor;
