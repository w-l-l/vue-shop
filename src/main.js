import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 全局样式
import './assets/css/common.css'

// 字体图标
import './assets/fonts/iconfont.css'

import treeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', treeTable)

// 时间过滤器
Vue.filter('dateFormat', value => {
  const dt = new Date(value)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
