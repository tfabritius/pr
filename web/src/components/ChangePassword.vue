<template>
  <v-card>
    <v-card-title>{{ $t('profile.change-password') }}</v-card-title>
    <v-card-text class="pt-4">
      <v-form ref="form" v-model="validForm" @submit.prevent="changePassword">
        <v-text-field
          v-model="oldPassword"
          type="password"
          :label="$t('profile.old-password')"
          outlined
          dense
          max-length="255"
        />

        <v-text-field
          v-model="newPassword"
          type="password"
          :label="$t('profile.new-password')"
          outlined
          dense
          max-length="255"
          :rules="[ruleMinLength(8)]"
        />

        <v-text-field
          v-model="confirmPassword"
          type="password"
          :label="$t('profile.confirm-password')"
          outlined
          dense
          max-length="255"
          :rules="[
            ruleMatchString(
              newPassword,
              $tc('profile.confirm-password-mismatch'),
            ),
            ruleMinLength(8),
          ]"
        />

        <v-btn type="submit" color="primary" block :disabled="!validForm">
          {{ $t('profile.change-password') }}
        </v-btn>
      </v-form>

      <v-overlay absolute="absolute" :value="loading">
        <v-progress-circular indeterminate size="64" />
      </v-overlay>
    </v-card-text>

    <v-snackbar v-model="showSnackbar" timeout="5000" text color="error">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'

import { isAxiosError, ruleMinLength, ruleMatchString } from '@/utils'

@Component({
  components: {},
})
export default class ChangePassword extends Vue {
  oldPassword = ''
  newPassword = ''
  confirmPassword = ''
  loading = false
  validForm = false
  $refs!: {
    form: HTMLFormElement
  }
  showSnackbar = false
  snackbarMessage = ''

  ruleMinLength = ruleMinLength
  ruleMatchString = ruleMatchString

  async changePassword(): Promise<void> {
    if (!this.$refs.form.validate()) return

    this.loading = true

    try {
      await axios.post('/auth/users/me/password', {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      })

      this.oldPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
      this.$refs.form.resetValidation()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        this.snackbarMessage = this.$tc('profile.invalid-old-password')
      } else {
        this.snackbarMessage = String(err)
      }
      this.showSnackbar = true
    } finally {
      this.loading = false
    }
  }
}
</script>
