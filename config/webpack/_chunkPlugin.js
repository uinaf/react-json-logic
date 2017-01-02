const webpack = require('webpack');

module.exports = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: '[name].[hash].js',
    minChunks: Infinity,
  }),
];
