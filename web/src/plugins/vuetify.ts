import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

import en from 'vuetify/src/locale/en'
import de from 'vuetify/src/locale/de'

import { getInitialLocale } from './i18n'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    current: getInitialLocale(),
    locales: { de, en },
  },
})
