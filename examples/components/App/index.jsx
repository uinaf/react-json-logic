// Core
import React from 'react';

// UI
import GitHubForkRibbon from 'react-github-fork-ribbon';
import style from './style.scss';

// Examples
import Demo from '../Demo';
// import DemoAsync from '../DemoAsync';

// Predefined Rules & Accessor Data
import accessor from '../../constants/accessor.json';
import higherOrderRule from '../../constants/higherOrderRule.json';

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
        src="https://facebook.github.io/react/img/logo.svg"
        alt="react"
      />

      <img
        className={style.JsonLogicLogo}
        src="http://jsonlogic.com/images/jsonlogic-white.png"
        alt="jsonlogic"
      />
    </div>

    <div className={style.Content}>
      {/*
        <Demo
          title="No Initial Value"
        />

        <Demo
          title="with Initial Value"
          value={JSON.parse(
            '{"==":[{"and":[{"==":["1","1"]},{"===":["0","0"]},{"==":["1","1"]}]},"1"]}'
          )}
        />

        <DemoAsync
          title="with Initial Value (Async Loaded)"
        />

        <Demo
          title="with Accessor"
          value={JSON.parse('{"===":[1,{"var":["a.b"]}]}')}
          data={{ a: { b: 1, c: 15, d: { f: 18 } }, x: { y: 15 } }}
        />
      */}

      <Demo
        title="with Accessor - Complex JSON"
        value={higherOrderRule}
        data={accessor}
      />
    </div>
  </div>
);

export default App;
