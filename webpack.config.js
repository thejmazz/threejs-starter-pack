'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './index.js',
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  devtool: 'sourcemap',
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /(node_modules)/,
      loader: 'babel'
    }]
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'My Three Project',
    template: './index.html'
  })]
}
