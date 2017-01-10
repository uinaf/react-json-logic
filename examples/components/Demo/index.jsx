import React, { PropTypes, Component } from 'react';
import ReactJsonLogic, { applyLogic } from '../../../dist';
import style from './style.scss';

// PropTypes
const { string, object, oneOfType } = PropTypes;
const propTypes = {
  title: string,
  value: oneOfType([object, string]),
  data: object,
};

const defaultProps = {
  value: {},
  data: {},
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      data: JSON.stringify(props.data),
      result: 'Not Evaluated',
    };
  }

  onFieldValueChange = value => this.setState({ value })

  onAccessorDataChange = data => this.setState({ data })

  onEvaluate = () => this.setState({
    result: applyLogic(this.state.value, JSON.parse(this.state.data)),
  })

  render() {
    const { title } = this.props;
    const { value, data, result } = this.state;

    return (
      <div className={style.Wrapper}>
        <h3>
          {title}
        </h3>

        <ReactJsonLogic
          data={data}
          value={value}
          onChange={this.onFieldValueChange}
        />

        <hr />

        <h4>Built Logic</h4>

        <code>
          {JSON.stringify(value)}
        </code>

        <hr />

        <h4>Data for Accessor Fields <small>(Must be JSON)</small></h4>

        <textarea
          value={data}
          onChange={e => this.onAccessorDataChange(e.target.value)}
        />

        <hr />

        <button
          disabled={Object.keys(value).length === 0}
          onClick={() => this.onEvaluate()}
        >
          Evaluate
        </button>

        <hr />

        <b>Result:</b> {JSON.stringify(result)}

      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
