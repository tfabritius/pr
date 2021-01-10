<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-data-table
        :items="accounts"
        :headers="[
          { text: $t('common.name'), value: 'name' },
          { text: $t('common.balance'), value: 'kpis.balance' },
          { text: $tc('common.currency', 1), value: 'currencyCode' },
          { text: $t('common.note'), value: 'note' },
        ]"
        hide-default-footer
      >
        <template #item.kpis.balance="{ item: depositAccount }">
          <n
            :value="depositAccount.kpis.balance"
            :currency="depositAccount.currencyCode"
          />
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
import { Account } from '@/store/account.model'

@Component({
  components: { N: FormattedNumber },
})
export default class PortfoliosPage extends Mixins(Vue, IconsMixin) {
  accounts: Account[] = []

  async mounted(): Promise<void> {
    const response = await axios.get<Account[]>(
      `/portfolios/${this.$store.state.portfolio.id}/accounts?kpis=true`,
    )
    this.accounts = response.data.filter((a) => a.type === 'deposit')
  }
}
</script>
