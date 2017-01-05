// Core
import React from 'react';

// UI
import GitHubForkRibbon from 'react-github-fork-ribbon';
import style from './style.scss';

// Examples
import Demo from '../Demo';

const App = () => (
  <div className={style.App}>
    <GitHubForkRibbon
      href="//github.com/altayaydemir/react-json-logic"
      target="_blank"
      position="right"
      color="black"
    >
      Fork me on GitHub
    </GitHubForkRibbon>

    <div className={style.Header}>
      <img
        className={style.ReactLogo}
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/React.js_logo.svg/2000px-React.js_logo.svg.png"
        alt="react"
      />

      <img
        className={style.Baby}
        src="https://media.giphy.com/media/5X7GDf7zc1Ebu/giphy.gif"
        alt="baby"
      />

      <img
        className={style.JsonLogicLogo}
        src="http://jsonlogic.com/images/jsonlogic-white.png"
        alt="jsonlogic"
      />
    </div>

    <div className={style.Content}>
      <Demo
        title="No Initial Value"
      />

      <Demo
        title="With Initial Value"
        value={JSON.parse('{"==":[{"and":[{"==":["1","1"]},{"===":["0","0"]}]},"1"]}')}
      />

      <Demo
        title="With Accessor"
        value={JSON.parse('{"==":["1",{"var":["b.a"]}]}')}
        data={{ b: { a: 1 } }}
      />
    </div>
  </div>
);

export default App;
