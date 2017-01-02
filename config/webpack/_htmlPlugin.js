const config = require('../');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
  new HtmlWebpackPlugin({
    template: path.join(config.docs.input, 'index.html'),
    filename: 'index.html',
    chunks: ['app', 'vendor'],
  }),
];
