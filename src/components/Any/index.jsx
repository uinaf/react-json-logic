/**
 * Any Field
 *
 * This field is like a blueprint for whole structure. It's used for recursive rendering of
 * nested JSON Logic expression. Has a dropbox for selecting the type of children fields and
 * contains its children fields as child components.
 *
 * - onChange: Returns the latest part of the expression rendered by this component. Used by its
 * parent (and grand parents) to complete structure, part by part.
 *
 * - parent: Parent field, used for the selection of available operators (see src/options.js for
 * more detailed explanation) and extracting its children's value recursively.
 *
 * - value: Value of the field, passed from its parent.
 *
 * - data: Data available for accessor fields, gained from the parrent and will be passed to the
 * children fields.
 */

// Core
import React, { PropTypes, Component } from 'react';

// UI
import Select from '../Select';

// Constants
import { OPERATORS } from '../../options';

// PropTypes
const { string, any, object, func } = PropTypes;
const propTypes = {
  onChange: func,
  parent: string,
  value: any,
  data: object,
};

const defaultProps = {
  value: {},
};

class Any extends Component {
  constructor(props) {
    super(props);

    const value = props.value;
    let field = 'value';

    if (typeof value === 'object' && Object.keys(value).length > 0) {
      const firstElem = Object.keys(value)[0];
      field = OPERATORS.some(operator => operator.signature === firstElem) ? firstElem : 'value';
    } else if (typeof value === 'object') {
      field = '';
    }

    this.state = { field, value };
  }

  /**
   * Resets the content and type of its children.
   */
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

  /**
   * Updates its own state and emits changes to the parrent.
   */
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

  /**
   * Used for selection of available child components.
   * Return value of this method will be the entry point of Select component.
   */
  getAvailableOperators = () => {
    const { parent } = this.props;
    return OPERATORS.filter(operator => !operator.notAvailableUnder.some(item => item === parent));
  }

  /**
   * Renders child component by checking its type, initial value.
   * Also passes onChange action and data (which will be consumed by Accessor field) to the child.
   */
  renderChild = (childField, index) => {
    const parent = this.state.field;
    const parentValue = this.state.value;

    const Child = childField.default;
    let childValue = '';

    if (parent !== 'value') {
      childValue = parentValue[parent][index];
    } else {
      childValue = parentValue;
    }

    return (
      <Child
        key={`${parent}.${index}`}
        parent={parent}
        value={childValue}
        onChange={value => this.onChildValueChange(value, index)}
        data={this.props.data}
      />
    );
  }

  render() {
    const { field } = this.state;
    const selectedOperator = OPERATORS.find(operator => operator.signature === field);

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
