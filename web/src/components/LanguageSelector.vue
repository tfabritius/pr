<template>
  <v-menu
    open-on-hover
    open-delay="60"
    close-delay="500"
    transition="slide-y-transition"
  >
    <template #activator="{ on }">
      <v-btn text icon v-on="on">
        <v-icon>{{ mdiTranslate }}</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="l of languages"
        :key="l.code"
        @click="$store.commit('setLanguage', l.code)"
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

  get language(): string {
    return this.$store.state.language
  }

  set language(language: string) {
    this.$store.commit('setLanguage', language)
  }
}
</script>
