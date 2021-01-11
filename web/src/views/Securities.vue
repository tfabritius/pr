<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-data-table
        :items="securities"
        :items-per-page="-1"
        :headers="[
          { text: $t('common.name'), value: 'name' },
          { text: $tc('common.share', 2), value: 'kpis.shares' },
          { text: $tc('common.quote', 1), value: 'kpis.quote' },
          { text: $t('common.value'), value: 'kpis.value' },
        ]"
        hide-default-footer
      >
        <template #item.kpis.shares="{ item: security }">
          <n :value="security.kpis.shares" />
        </template>
        <template #item.kpis.quote="{ item: security }">
          <n :value="security.kpis.quote" :currency="security.currencyCode" />
        </template>
        <template #item.kpis.value="{ item: security }">
          <n :value="security.kpis.value" :currency="security.currencyCode" />
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import axios from 'axios'

import FormattedNumber from '@/components/FormattedNumber.vue'
import { IconsMixin } from '@/components/icons-mixin'
import { Security } from '@/store/security.model'

@Component({
  components: { N: FormattedNumber },
})
export default class SecuritiesPage extends Mixins(Vue, IconsMixin) {
  securities: Security[] = []

  async mounted(): Promise<void> {
    const response = await axios.get<Security[]>(
      `/portfolios/${this.$store.state.portfolio.id}/securities?kpis=true`,
    )
    this.securities = response.data
  }
}
</script>
