<template>
  <v-container fluid fill-height class="d-flex justify-center">
    <div style="width: 300px">
      <v-card elevation="6">
        <v-card-text class="pt-4">
          <v-form @submit="login">
            <v-text-field
              ref="username"
              v-model="username"
              :placeholder="$t('common.username')"
              outlined
              dense
              maxlength="100"
            />
            <v-text-field
              v-model="password"
              type="password"
              :placeholder="$t('common.password')"
              outlined
              dense
              max-length="255"
            />

            <v-btn type="submit" color="primary" block>
              {{ $t('login.sign-in') }}
            </v-btn>
          </v-form>

          <v-overlay absolute="absolute" :value="loading">
            <v-progress-circular indeterminate size="64" />
          </v-overlay>
        </v-card-text>
      </v-card>

      <div class="mt-4 text-center text--secondary">
        {{ $t('login.not-registered') }}
        <router-link to="/register">
          {{ $t('login.create-account') }}
        </router-link>
      </div>

      <v-snackbar v-model="showSnackbar" timeout="5000" text color="error">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'

import { isAxiosError } from '../utils'

@Component({
  components: {},
})
export default class LoginPage extends Vue {
  username = ''
  password = ''
  loading = false
  $refs!: {
    username: HTMLInputElement
  }
  showSnackbar = false
  snackbarMessage = ''

  mounted(): void {
    this.$refs.username.focus()
  }

  async login(): Promise<void> {
    this.loading = true

    try {
      const response = await axios.post('/auth/login', {
        username: this.username,
        password: this.password,
      })

      this.password = ''
      this.$store.commit('setSessionToken', response.data.token)
      this.$router.push('/')

      this.$store.dispatch('getUser')
      this.$store.dispatch('getCurrencies')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        this.snackbarMessage = this.$tc('login.invalid-credentials')
      } else {
        this.snackbarMessage = err
      }
      this.showSnackbar = true
    } finally {
      this.loading = false
    }
  }
}
</script>
