<template>
  <v-list>
    <v-list-item
      v-for="p of $store.state.portfolios"
      :key="p.id"
      dense
      @click="$store.commit('selectPortfolio', p)"
    >
      {{ p.name }}
    </v-list-item>
    <v-divider />
    <v-list-item dense to="/portfolios">
      <v-list-item-icon>
        <v-icon>{{ mdiPlaylistEdit }}</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <i>{{ $t('common.manage portfolios') }}</i>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'

import { IconsMixin } from './icons-mixin'

@Component
export default class PortfoliosList extends Mixins(Vue, IconsMixin) {}
</script>
