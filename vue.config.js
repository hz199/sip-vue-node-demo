const path = require('path')
// const compressionWebpackPlugin = require('compression-webpack-plugin')

module.exports = {
  devServer: {
    open: true,
    port: 8081,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:8788`,
        changeOrigin: true
      }
    }
  },
  // 这个参数回影响代理
  productionSourceMap: process.env.NODE_ENV !== 'production',
  // 修改上下文作用域
  chainWebpack: (config) => {
    config.context(path.resolve(__dirname, './app'))
          .resolve.alias
          .set('@', path.resolve(__dirname, './app/src'))
  },
  // 代码gzip压缩
  configureWebpack: () => {
    // if (process.env.NODE_ENV === 'production') {
    //   return {
    //     plugins: [
    //       new compressionWebpackPlugin({
    //         test: /\.(js|css)$/,
    //         threshold: 10240,
    //         deleteOriginalAssets: false // 压缩后是否删除原文件
    //       })
    //     ]
    //   }
    // }
  }
}
