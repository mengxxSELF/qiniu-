const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const QiuniuUploadPlugin = require('./qiniu-webpack-plugin')

const bucket = 'cancan'
const accessKey = '2LC7KPccc'
const secretKey = 'SXrdqdveeee'
const domain = 'http://pq3smc.xxxxxx'

const filePath = path.resolve(__dirname, 'public')

module.exports = {
  mode: 'development',
  entry: {
    index: './views/index.js',
  },
  output: {
    filename: 'index.js',
    path: filePath,
    publicPath: domain
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './views/index.html',
      filename: 'index.html',
    }),
    new QiuniuUploadPlugin({
      bucket,
      accessKey,
      secretKey,
      domain,
      path: filePath
    })
  ]
}
