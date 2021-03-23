import Vue from 'vue'
import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'

import store from '@/store'

Vue.use(VueApollo)

export default new VueApollo({
  defaultClient: new ApolloClient({
    uri: process.env.VUE_APP_API_URL + 'graphql',
    request: (operation) => {
      const token = store.state.sessionToken
      operation.setContext({
        headers: {
          authorization: token ? `Bearer ${token}` : '',
        },
      })
    },
  }),
})
