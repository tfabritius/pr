import Vue from 'vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'

import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'

import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount('#app')
