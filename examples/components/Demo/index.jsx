import React, { PropTypes, Component } from 'react';
import ReactJsonLogic, { applyLogic } from '../../../dist';
import style from './style.scss';

const propTypes = {
  title: PropTypes.string,
  value: PropTypes.any,
};

const defaultProps = {
  value: {},
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      result: 'Not Evaluated',
    };
  }

  onChange = value => this.setState({ value })

  onEvaluate = () => this.setState({ result: applyLogic(this.state.value) })

  render() {
    const { title } = this.props;
    const { value, result } = this.state;

    return (
      <div className={style.Wrapper}>
        <h3>
          {title}
        </h3>

        <ReactJsonLogic
          value={value}
          onChange={this.onChange}
        />

        <hr />

        <h4>Built Logic</h4>

        <code>
          {JSON.stringify(value)}
        </code>

        <button onClick={() => this.onEvaluate()}>
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
