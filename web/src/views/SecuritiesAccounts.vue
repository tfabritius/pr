<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-data-table
        :items="accounts"
        :items-per-page="-1"
        :headers="[
          { text: $t('common.name'), value: 'name' },
          { text: $t('common.note'), value: 'note' },
        ]"
        hide-default-footer
      >
        <template #item.kpis.balance="{ item: depositAccount }">
          <n
            :value="depositAccount.balance"
            :currency="depositAccount.currencyCode"
          />
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import gql from 'graphql-tag'

import FormattedNumber from '@/components/FormattedNumber.vue'
import { IconsMixin } from '@/components/icons-mixin'
import { Account } from '@/store/account.model'
import store from '@/store'

const SecuritiesAccountsAll = gql`
  query accounts($id: Int!) {
    accounts(portfolioId: $id, type: "securities") {
      uuid
      name
      note
    }
  }
`

@Component({
  apollo: {
    accounts: {
      query: SecuritiesAccountsAll,
      variables: { id: store.state.portfolio?.id },
    },
  },
  components: { N: FormattedNumber },
})
export default class SecuritiesAccountsPage extends Mixins(Vue, IconsMixin) {
  accounts: Account[] = []
}
</script>
