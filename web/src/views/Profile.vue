<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-card tile>
        <v-card-title>{{ $t('common.profile') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="$store.state.user.username"
            :label="$t('common.username')"
            readonly
            outlined
            dense
            style="font-family: monospace"
          />

          {{ $t('profile.username-change-text') }}
        </v-card-text>
      </v-card>

      <div class="mt-4">
        <ChangePassword />
      </div>

      <v-card class="mt-4" tile>
        <v-card-title>{{ $t('profile.delete-account') }}</v-card-title>
        <v-card-text>
          {{ $t('profile.delete-account-text') }}
          <v-switch
            v-model="enableDelete"
            color="error"
            :label="$t('profile.im-sure')"
          />
          <v-btn
            color="error"
            block
            :disabled="!enableDelete"
            @click="deleteAccount"
          >
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-text>
      </v-card>

      <v-snackbar v-model="showSnackbar" timeout="5000" text color="error">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ChangePassword from '@/components/ChangePassword.vue'

@Component({
  components: { ChangePassword },
})
export default class ProfilePage extends Vue {
  enableDelete = false

  loading = false
  $refs!: {
    username: HTMLInputElement
  }
  showSnackbar = false
  snackbarMessage = ''

  async deleteAccount(): Promise<void> {
    try {
      await this.$store.dispatch('deleteAccount')
    } catch (err) {
      this.snackbarMessage = String(err)
      this.showSnackbar = true
    }
  }
}
</script>
