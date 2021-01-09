<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-stepper v-model="stepper" vertical>
        <v-stepper-step editable step="1">
          {{ $t('sync.select os') }}
        </v-stepper-step>

        <v-stepper-content step="1">
          <v-btn-toggle v-model="osIndex" mandatory>
            <v-btn>
              <v-icon>{{ mdiMicrosoftWindows }}</v-icon> Windows
            </v-btn>
            <v-btn>
              <v-icon>{{ mdiLinux }}</v-icon> Linux
            </v-btn>
            <v-btn>
              <v-icon>{{ mdiApple }}</v-icon> MacOS
            </v-btn>
          </v-btn-toggle>
        </v-stepper-content>

        <v-stepper-step editable step="2">
          {{ $t('sync.download sync client') }}
        </v-stepper-step>

        <v-stepper-content step="2">
          <p>
            {{ $t('sync.download-sync-client-msg') }}
            <a :href="downloadUrl">{{ downloadUrl }}</a>
          </p>
          <p>{{ $t('sync.latest version') }}: {{ version }}</p>
        </v-stepper-content>

        <v-stepper-step editable step="3">
          {{ $t('sync.upload portfolio') }}
        </v-stepper-step>

        <v-stepper-content step="3">
          <p>{{ $t('sync.upload-portfolio-msg') }}</p>
          <v-card color="grey" light>
            <tt>
              {{ filename[osIndex] }} upload <i>portfolio.xml</i> --username
              {{ $store.state.user.username }} --password
              <i>secret</i> --portfolio <i>ID</i>
            </tt>
          </v-card>

          <i18n path="sync.replace-portfolio-msg" tag="p" class="mt-4">
            <template v-slot:id><i>ID</i></template>
            <template v-slot:portfolio>
              <router-link to="/portfolios">{{
                $tc('common.portfolio', 1)
              }}</router-link>
            </template>
          </i18n>

          <i18n
            path="sync.replace-portfolio-hint-msg"
            tag="p"
            v-if="$store.state.portfolio"
          >
            <template v-slot:id>
              <tt>{{ $store.state.portfolio.id }}</tt>
            </template>
          </i18n>
        </v-stepper-content>
      </v-stepper>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'

@Component({
  components: {},
})
export default class SyncPage extends Mixins(Vue, IconsMixin) {
  stepper = 1

  osIndex = 0
  filename = ['pr-sync-win-x64.exe', 'pr-sync-linux-x64', 'pr-sync-macos-x64']

  version = ''

  get downloadUrl(): string {
    return (
      'https://download.portfolio-report.net/pr-sync/' +
      this.version +
      '/' +
      this.filename[this.osIndex]
    )
  }

  async mounted(): Promise<void> {
    const response = await fetch(
      'https://download.portfolio-report.net/pr-sync/version',
    )

    this.version = await response.text()
  }
}
</script>
