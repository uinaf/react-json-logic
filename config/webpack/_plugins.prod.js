const webpack = require('webpack');

module.exports = [
  new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    comments: false,
    compress: {
      warnings: false,
    },
  }),

  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
];
