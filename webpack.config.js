const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    index: './views/index.js',
    manage: './views/manage.js'
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].bundle.js',
    publicPath: ''
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    inline: true,
    // hot: true,
    port: 3000
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './views/index.html',
      chunks: ['index'],
      filename: 'index.html',
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: './views/manage.html',
      chunks: ['manage'],
      filename: 'manage.html',
      inject: 'body'
    })
  ]
}
