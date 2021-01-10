<template>
  <v-menu open-on-click offset-y transition="slide-y-transition">
    <template #activator="{ on }">
      <v-btn text icon v-on="on">
        <v-icon>{{ mdiTranslate }}</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="l of languages"
        :key="l.code"
        @click="setLanguage(l.code)"
      >
        {{ l.name }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import { supportedLocales } from '@/plugins/i18n.ts'
import { IconsMixin } from '@/components/icons-mixin'

@Component
export default class LanguageSelector extends Mixins(Vue, IconsMixin) {
  get languages(): Array<{ code: string; name: string }> {
    return supportedLocales
  }

  setLanguage(lang: string): void {
    this.$store.commit('setLanguage', { lang, vm: this })
  }
}
</script>
