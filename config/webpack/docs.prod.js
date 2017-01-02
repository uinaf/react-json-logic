// Constants & Configs
const config = require('../');
const plugins = require('./_plugins');
const productionPlugins = require('./_plugins.prod');
const chunkPlugin = require('./_chunkPlugin');
const loaders = require('./_loaders.prod');
const preLoaders = require('./_preLoaders');
const resolve = require('./_resolve');
const htmlPlugin = require('./_htmlPlugin');
const postcss = require('./_postCSS');

// Main Config for Lib & Docs Development
module.exports = {
  debug: false,
  devtool: false,
  resolve,

  entry: {
    app: [
      './examples/index.jsx',
    ],
    vendor: [
      'babel-polyfill',
      'react',
      'react-dom',
    ],
  },

  output: {
    path: config.docs.output,
    filename: '[name].[hash].js',
    publicPath: './',
  },

  module: {
    preLoaders,
    loaders,
  },

  postcss,

  plugins: plugins.concat(
    productionPlugins,
    htmlPlugin,
    chunkPlugin
  ),
};
