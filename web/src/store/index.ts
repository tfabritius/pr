import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import i18n, { getInitialLocale } from '@/plugins/i18n'
import router from '../router'
import { Portfolio } from './portfolio.model'
import { Currency } from './currency.model'

Vue.use(Vuex)

interface State {
  language: string
  currencies: Currency[]
  portfolio: Portfolio | null
  portfolios: Portfolio[]
  sessionToken: string
  user: unknown
}

const state: State = {
  language: 'en',
  currencies: [],
  portfolio: null,
  portfolios: [],
  sessionToken: '',
  user: {},
}

export default new Vuex.Store({
  strict: false,

  state,

  getters: {
    loggedIn: (state) => state.sessionToken !== '',
  },

  mutations: {
    setSessionToken(state, value) {
      state.sessionToken = value

      if (value === '') {
        axios.defaults.headers = {}
      } else {
        axios.defaults.headers = {
          authorization: 'bearer ' + value,
        }
      }
    },
    setCurrencies(state, value) {
      state.currencies = value
    },
    addPortfolio(state, value) {
      state.portfolios.push(value)
    },
    removePortfolio(state, value) {
      state.portfolios = state.portfolios.filter((p) => p !== value)
    },
    selectPortfolio(state, value) {
      state.portfolio = value
    },
    setPortfolios(state, value) {
      state.portfolios = value
    },
    updatePortfolio(state, value) {
      const idx = state.portfolios.findIndex((p) => p.id === value.id)
      Vue.set(state.portfolios, idx, value)
    },
    setUser(state, value) {
      state.user = value
    },
    setLanguage(state, { lang, vm }) {
      state.language = lang

      // VueI18n
      i18n.locale = lang

      // Vuetify
      if (vm) {
        vm.$vuetify.lang.current = lang
      }

      // HTML element
      document.documentElement.setAttribute('lang', lang)

      // LocalStorage
      localStorage.setItem('language', lang)
    },
  },

  actions: {
    initializeLanguage({ commit }) {
      commit('setLanguage', { lang: getInitialLocale() })
    },
    async getUser({ commit }) {
      const response = await axios.get('/auth/users/me')
      commit('setUser', response.data)
    },
    async getCurrencies({ commit }) {
      const response = await axios.get('/currencies')
      commit('setCurrencies', response.data)
    },
    async getPortfolios({ commit }) {
      const response = await axios.get('/portfolios')
      commit('setPortfolios', response.data)
    },
    async addPortfolio({ commit }, portfolio) {
      const response = await axios.post('/portfolios', portfolio)
      commit('addPortfolio', response.data)
    },
    async updatePortfolio({ commit }, portfolio) {
      const response = await axios.put(`/portfolios/${portfolio.id}`, portfolio)
      commit('updatePortfolio', response.data)
    },
    async deletePortfolio({ commit, state }, portfolio) {
      await axios.delete(`/portfolios/${portfolio.id}`)
      commit('removePortfolio', portfolio)
      if (state.portfolio === portfolio) {
        commit('selectPortfolio', null)
      }
    },
    async logout({ commit }) {
      await axios.post('/auth/logout')
      commit('setUser', {})
      commit('setPortfolios', [])
      commit('selectPortfolio', null)
      commit('setSessionToken', '')
      router.push('/login')
    },

    async deleteAccount({ commit }) {
      await axios.delete('/auth/users/me')
      commit('setUser', {})
      commit('setPortfolios', [])
      commit('selectPortfolio', null)
      commit('setSessionToken', '')
      router.push('/login')
    },
  },
  modules: {},
})
