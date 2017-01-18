// Core
import React, { PropTypes } from 'react';

// UI
import 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';

import style from './style.scss';

// PropTypes
const { string, func } = PropTypes;
const propTypes = {
  value: string,
  onChange: func,
};

const Editor = ({ value, onChange }) => (
  <div>
    <AceEditor
      className={style.Editor}
      mode="json"
      theme="github"
      onChange={onChange}
      name={parseInt(Math.random(), 100).toString()}
      editorProps={{ $blockScrolling: 'Infinity' }}
      value={value}
      tabSize={2}
      width="100%"
      height="200px"
    />
  </div>
);

Editor.propTypes = propTypes;

export default Editor;
