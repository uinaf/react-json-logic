// Core
const webpack = require('webpack');

// Constants & Configs
const config = require('../');
const plugins = require('./_plugins');
const loaders = require('./_loaders.dev');
const preLoaders = require('./_preLoaders');
const resolve = require('./_resolve');
const htmlPlugin = require('./_htmlPlugin');
const postcss = require('./_postCSS');

// Main Config for Lib & Docs Development
module.exports = {
  resolve,

  entry: {
    app: [
      `webpack-dev-server/client?http://${config.host}:${config.port}`,
      'webpack/hot/only-dev-server',
      'react-hot-loader/patch',
      'babel-polyfill',
      './examples/index.jsx',
    ],
  },

  output: {
    path: config.docs.output,
    filename: 'index.js',
    publicPath: '/',
  },

  module: {
    preLoaders,
    loaders,
  },

  postcss,

  plugins: plugins.concat(htmlPlugin, [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ]),
};
