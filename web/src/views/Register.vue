<template>
  <v-container fluid fill-height class="d-flex justify-center">
    <div style="width: 300px">
      <v-card elevation="6">
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="validForm" @submit="register">
            <v-text-field
              ref="username"
              v-model="username"
              :placeholder="$t('common.username')"
              outlined
              dense
              maxlength="100"
              :rules="[ruleValidUsername, ruleMinLength(6)]"
            />
            <v-text-field
              v-model="password"
              type="password"
              :placeholder="$t('common.password')"
              outlined
              dense
              maxlength="255"
              :rules="[ruleMinLength(8)]"
            />
            <v-text-field
              v-model="confirmPassword"
              type="password"
              :placeholder="$t('register.confirm-password')"
              outlined
              dense
              :rules="[
                ruleMatchString(
                  password,
                  $tc('register.confirm-password-mismatch'),
                ),
                ruleMinLength(8),
              ]"
            />

            <v-btn type="submit" color="primary" block :disabled="!validForm">
              {{ $t('register.register') }}
            </v-btn>
          </v-form>

          <v-overlay absolute="absolute" :value="loading">
            <v-progress-circular indeterminate size="64" />
          </v-overlay>
        </v-card-text>
      </v-card>

      <div class="mt-4 text-center text--secondary">
        {{ $t('register.have-account') }}
        <router-link to="/login">{{ $t('register.sign-in') }}</router-link>
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
import { isAxiosError, ruleMatchString, ruleMinLength } from '@/utils'

@Component({
  components: {},
})
export default class RegisterPage extends Vue {
  username = ''
  password = ''
  confirmPassword = ''
  loading = false
  validForm = false
  $refs!: {
    username: HTMLInputElement
    form: HTMLFormElement
  }
  showSnackbar = false
  snackbarMessage = ''

  ruleValidUsername = (value: string): true | string =>
    value.match(/^([a-zA-Z0-9._-])*$/) !== null ||
    this.$tc('register.invalid-chars')

  ruleMatchString = ruleMatchString
  ruleMinLength = ruleMinLength

  mounted(): void {
    this.$refs.username.focus()
  }

  async register(): Promise<void> {
    if (!this.$refs.form.validate()) return

    this.loading = true

    try {
      const response = await axios.post('/auth/register', {
        username: this.username,
        password: this.password,
      })

      this.username = ''
      this.password = ''
      this.confirmPassword = ''
      this.$refs.form.resetValidation()

      this.$store.commit('setSessionToken', response.data.token)
      this.$router.push('/')

      this.$store.dispatch('getUser')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        this.snackbarMessage = err.response.data.message
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
