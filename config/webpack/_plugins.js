const webpack = require('webpack');
const extractCSS = require('./_extractCSS');

module.exports = [
  extractCSS,

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),
];
