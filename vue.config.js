'use strict'
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/gobang/' : '/gobang/',
  devServer: {
    port: '8888',
  },
  assetsDir: 'static',
  outputDir: 'dist',
  productionSourceMap: false,
  lintOnSave: process.env.NODE_ENV === 'development',
  transpileDependencies: ['quasar'],
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: true,
    },
  },
  configureWebpack: {
    name: '五子棋',
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
  },
}
