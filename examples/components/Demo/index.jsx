import React, { PropTypes, Component } from 'react';
import ReactJsonLogic, { applyLogic } from '../../../dist';
import style from './style.scss';

const propTypes = {
  title: PropTypes.string,
  value: PropTypes.any,
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      result: 'Not Evauluated',
    };
  }

  onEvaluate = () => {
    this.setState({ result: applyLogic(this.state.value) });
  }

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
          onChange={e => this.setState({ value: e })}
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

export default App;
