// Core
import React, { PropTypes, Component } from 'react';

// Helpers
import isEqual from 'lodash.isequal';

// UI
import Any from '../Any';

// PropTypes
const { any, func, object, string } = PropTypes;
const propTypes = {
  data: object,
  parent: string,
  value: any,
  onChange: func,
};

class HigherOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: { '=>': [props.value] },
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);

    if (!isEqual(this.props.value, nextProps.value)) {
      this.setState({
        value: { '=>': [nextProps.value] },
      });
    }
  }

  onChange = (value) => {
    const newValue = {
      '=>': [value],
    };

    this.setState({ value: newValue }, () => this.props.onChange(newValue));
  }

  render() {
    const { parent, data } = this.props;
    const { value } = this.state;
    const firstElemOfValue = value['=>'][0];

    return (
      <div>
        {`=>`}

        <Any
          onChange={this.onChange}
          parent={parent}
          data={data}
          value={firstElemOfValue}
        />
      </div>
    );
  }
}

HigherOrder.propTypes = propTypes;

export default HigherOrder;
