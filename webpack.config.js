var path = require('path');
var srcPath = path.join(__dirname, 'project-code');
var buildPath = path.join(__dirname, 'production-code');

module.exports = {
 // context: __dirname,
  entry: path.join(srcPath, '', 'game.js'),
  output: {
      path: buildPath,
      filename: 'transpiled.js'
  },
  module: {
      loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
              presets: ['react-es2015', 'stage-0']
            }
          },
          {
          test: /\.scss$/,
          loaders: ['style', 'css', 'sass']
          }
      ]
  }
};