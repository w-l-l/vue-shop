'use strict'

import Vue from 'vue'
import axios from 'axios'
import NProgress from 'nprogress'

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}

const _axios = axios.create(config)

_axios.interceptors.request.use(
  function (config) {
    NProgress.start()
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    NProgress.done()
    return response
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error)
  }
)

Plugin.install = function (Vue, options) {
  Vue.axios = _axios
  window.axios = _axios
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios
      }
    },
    $axios: {
      get() {
        return _axios
      }
    },
  })
}

Vue.use(Plugin)

export default Plugin
