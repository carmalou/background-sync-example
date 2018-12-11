const path = require('path');

module.exports = {
  entry: {
      index: './src/index.js',
      serviceworker: './serviceworker.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
};