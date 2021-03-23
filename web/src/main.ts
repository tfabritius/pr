import Vue from 'vue'
import '@fontsource/eczar'
import '@fontsource/roboto-condensed'

import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import apolloProvider from './plugins/apollo'

import axios from 'axios'
import { isAxiosError } from './utils'

axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      store.commit('resetStore')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app')
