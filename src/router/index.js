import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../views/Login.vue'
const Login = () => import(/* webpackChunkName: "only" */ '../views/Login.vue')
// import Home from '../views/Home.vue'
const Home = () => import(/* webpackChunkName: "only" */ '../views/Home.vue')
// import Welcome from '../views/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "only" */ '../views/Welcome.vue')

// import Users from '../views/user/Users.vue'
const Users = () => import(/* webpackChunkName: "user" */ '../views/user/Users.vue')

// import Rights from '../views/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "power" */ '../views/power/Rights.vue')
// import Roles from '../views/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "power" */ '../views/power/Roles.vue')

// import Categories from '../views/goods/Categories.vue'
const Categories = () => import(/* webpackChunkName: "goods" */ '../views/goods/Categories.vue')
// import Params from '../views/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "goods" */ '../views/goods/Params.vue')
// import Goods from '../views/goods/Goods.vue'
const Goods = () => import(/* webpackChunkName: "goods" */ '../views/goods/Goods.vue')
// import Add from '../views/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "goods" */ '../views/goods/Add.vue')

// import Order from '../views/order/Order.vue'
const Order = () => import(/* webpackChunkName: "order" */ '../views/order/Order.vue')

// import Report from '../views/report/Report.vue'
const Report = () => import(/* webpackChunkName: "report" */ '../views/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: () => window.sessionStorage.getItem('token') ? window.sessionStorage.getItem('activePath') || '/welcome' : '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/goods', component: Goods },
      { path: '/goods/add', component: Add },
      { path: '/goods/edit/:id', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next() 放行 next(url) 强制跳转
  to.path !== '/login' && !window.sessionStorage.getItem('token') ? next('/login') : next()
})

export default router
