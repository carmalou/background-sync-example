const path = require('path');

const ClientConfig = {
  entry: './index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devtool: 'cheap-source-map'
};

const ServiceWorkerConfig = {
    target: 'webworker',
    mode: 'development',
    entry: './serviceworker.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'serviceworker.js'
    },
    devtool: 'cheap-source-map'
}

module.exports = [ ClientConfig, ServiceWorkerConfig ];