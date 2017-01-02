const path = require('path');

const config = {
  port: process.env.PORT || 8000,
  host: process.env.HOST || 'localhost',

  lib: {
    input: path.resolve(__dirname, '../src'),
    output: path.resolve(__dirname, '../dist'),
  },

  docs: {
    input: path.resolve(__dirname, '../examples'),
    output: path.resolve(__dirname, '../docs'),
  },
};

module.exports = config;
