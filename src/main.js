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

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
