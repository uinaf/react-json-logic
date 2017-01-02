const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = new ExtractTextPlugin('style.css', { allChunks: true });
