// Constants & Configs
const config = require('../');
const name = require('../../package.json').name;
const plugins = require('./_plugins');
const loaders = require('./_loaders.dev');
const preLoaders = require('./_preLoaders');
const resolve = require('./_resolve');
const externals = require('./_externals');
const postcss = require('./_postCSS');

// Main Config for Lib & Docs Development
module.exports = {
  resolve,

  entry: './src/index.jsx',

  output: {
    path: config.lib.output,
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    library: name,
  },

  module: {
    preLoaders,
    loaders,
  },

  postcss,

  externals,

  plugins,
};
