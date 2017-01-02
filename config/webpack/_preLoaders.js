const config = require('../');

module.exports = [
  {
    test: /\.jsx?$/,
    loader: 'eslint-loader',
    exclude: [
      /node_modules/,
      config.lib.output,
      config.docs.output,
    ],
  },
];
