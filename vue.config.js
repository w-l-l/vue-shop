const { resolve } = require('path')
module.exports = {
  devServer: {
    open: true,
    port: 3000
  },
  chainWebpack: config => {
    // 生产环境
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add(resolve('./src/main-pro.js'))
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
    })
    // 开发环境
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add(resolve('./src/main-dev.js'))
    })
  }
}
