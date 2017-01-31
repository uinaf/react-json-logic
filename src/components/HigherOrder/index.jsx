// Core
import React, { PropTypes, Component } from 'react';

// Helpers
import isEqual from 'lodash.isequal';

// UI
import Any from '../Any';
import style from './style.scss';

// PropTypes
const { any, func, object, string } = PropTypes;
const propTypes = {
  data: object,
  parent: string.isRequired,
  value: any,
  onChange: func.isRequired,
};

const defaultProps = {
  data: {},
  value: '',
};

class HigherOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.value, nextProps.value)) {
      this.setState({
        value: nextProps.value,
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
    const firstElemOfValue = value['=>'] ? value['=>'][0] : {};

    return (
      <div className={style.Wrapper}>
        <div className={style.FatArrow}>
          {'=>'}
        </div>

        <div className={style.Child}>
          <Any
            onChange={this.onChange}
            parent={parent}
            data={data}
            value={firstElemOfValue}
          />
        </div>
      </div>
    );
  }
}

HigherOrder.propTypes = propTypes;
HigherOrder.defaultProps = defaultProps;

export default HigherOrder;
