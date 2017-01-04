// Core
import React, { PropTypes, Component } from 'react';

// UI
import Select from '../Select';

// Constants
import { OPERATORS } from '../../options';

// PropTypes
const { string, func } = PropTypes;
const propTypes = {
  field: string,
  onChange: func,
  parent: string,
};

const defaultProps = {
  field: '',
};

class Any extends Component {
  constructor(props) {
    super(props);

    const { field } = props;
    const value = {};
    value[field] = [];

    this.state = { field, value };
  }

  componentDidMount() {
    this.props.onChange(this.state.value);
  }

  onFieldChange = (field) => {
    let value = {};

    if (field === 'value') {
      value = '';
    } else {
      value[field] = [];
    }

    this.setState({ field, value });
    this.props.onChange(value);
  };

  onChildValueChange = (childValue, index) => {
    const field = this.state.field;
    let value = this.state.value;

    if (field === 'value') {
      value = childValue;
    } else {
      value[field][index] = childValue;
    }

    this.setState({ value });
    this.props.onChange(value);
  }

  getAvailableOperators = () => {
    const { parent } = this.props;
    return OPERATORS.filter(operator => !operator.notAvailableUnder.some(item => item === parent));
  }

  renderChild = (childField, index) => {
    const parent = this.state.field;
    const Child = childField.default;

    return (
      <Child
        key={`${parent}.${index}`}
        parent={parent}
        onChange={value => this.onChildValueChange(value, index)}
      />
    );
  }

  render() {
    const { field } = this.state;
    const selectedOperator = OPERATORS.find(operator => operator.label === field);

    return (
      <div>
        <Select
          value={field}
          options={this.getAvailableOperators()}
          onChange={this.onFieldChange}
        />

        {selectedOperator &&
          <div style={{ marginLeft: 20, marginTop: 5, marginBottom: 5 }}>
            {selectedOperator.fields.map(this.renderChild)}
          </div>
        }
      </div>
    );
  }
}

Any.propTypes = propTypes;
Any.defaultProps = defaultProps;

export default Any;
