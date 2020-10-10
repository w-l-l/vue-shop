import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 全局样式
import './assets/css/common.css'

// 字体图标
import './assets/fonts/iconfont.css'

// nprogress进度条样式
import 'nprogress/nprogress.css'

// 树形表格
import treeTable from 'vue-table-with-tree-grid'

// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.component('tree-table', treeTable)
Vue.use(VueQuillEditor)

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
