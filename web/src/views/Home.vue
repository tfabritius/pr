<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <div v-if="!$store.state.portfolio">
        <v-alert color="info" outlined>
          <v-icon color="info">
            {{ mdiInformation }}
          </v-icon>
          {{ $t('home.no portfolio') }}
        </v-alert>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'

import { IconsMixin } from '@/components/icons-mixin'
import PortfoliosList from '@/components/PortfoliosList.vue'

@Component({
  components: {
    PortfoliosList,
  },
})
@Component
export default class HomePage extends Mixins(Vue, IconsMixin) {}
</script>
