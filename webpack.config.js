const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const VirtualFilesPlugin = require('./virtual-files-plugin');


module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new VirtualFilesPlugin(path.resolve(__dirname, 'src'), [
      {
        path: './virtual-module.js',
        content: 'export default \'virtual-module\';'
      },
      {
        path: './virtual-module-with-dummy.js',
        content: 'export default \'virtual-module-with-dummy\';'
      },
    ]),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
