import Vue from 'vue'
import VueI18n from 'vue-i18n'

import store from '@/store'
import de from '@/locales/de.json'
import en from '@/locales/en.json'

Vue.use(VueI18n)

export const supportedLocales = [
  { code: 'en', name: 'English (en)' },
  { code: 'de', name: 'Deutsch (de)' },
]

const fallbackLocale = 'en'

export function getInitialLocale(): string {
  const lang = store.state.language

  if (lang && supportedLocales.map((l) => l.code).includes(lang)) {
    return lang
  }

  const browserLocale = navigator.language

  if (browserLocale) {
    const locale = browserLocale.trim().split(/-|_/)[0]
    if (supportedLocales.map((l) => l.code).includes(locale)) {
      return locale
    }
  }

  return fallbackLocale
}

export default new VueI18n({
  locale: getInitialLocale(),
  fallbackLocale,
  messages: { de, en },
})
