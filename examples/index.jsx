import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './components/App';

// Initial Render
render(
  <AppContainer>
    <App />
  </AppContainer>,
  document.getElementById('app'),
);

// Hot Reload Config
if (module.hot) {
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default;

    render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      document.getElementById('app'),
    );
  });
}
