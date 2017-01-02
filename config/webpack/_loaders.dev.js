const config = require('../');
const extractCSS = require('./_extractCSS');

module.exports = [
  {
    test: /\.jsx?$/,
    loader: 'babel',
    include: [
      config.lib.input,
      config.docs.input,
    ],
  },
  {
    test: /\.scss/,
    loader: extractCSS.extract(
      'style',
      'css-loader?modules=true&localIdentName=[folder]__[local]!postcss!sass?sourceMap'
    ),
  },
  {
    test: /\.css/,
    loader: extractCSS.extract(
      'style',
      'css'
    ),
  },
];
