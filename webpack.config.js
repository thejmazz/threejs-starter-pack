'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: [
    './src/index.js'
  ],
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
  plugins: [
    new HtmlWebpackPlugin({
      title: 'My Three Project',
      template: './src/index.html'
    }),
    new CopyWebpackPlugin([{
      from: 'public'
    }, {
      from: 'node_modules/three/examples/js/loaders/OBJLoader.js',
      to: 'js'
    }])
  ]
}
