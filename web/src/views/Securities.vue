<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-data-table
        :items="securities"
        :items-per-page="-1"
        :headers="[
          { text: $t('common.name'), value: 'name' },
          { text: $tc('common.share', 2), value: 'shares' },
          { text: $tc('common.quote', 1), value: 'quote' },
          { text: $t('common.value'), value: 'value' },
        ]"
        hide-default-footer
      >
        <template #item.shares="{ item: security }">
          <n :value="security.shares" />
        </template>
        <template #item.quote="{ item: security }">
          <n :value="security.quote" :currency="security.currencyCode" />
        </template>
        <template #item.value="{ item: security }">
          <n :value="0" :currency="security.currencyCode" />
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
import { Security } from '@/store/security.model'
import store from '@/store'

const SecuritiesAll = gql`
  query securities($id: Int!) {
    securities(portfolioId: $id) {
      uuid
      name
      shares
      quote
    }
  }
`

@Component({
  apollo: {
    securities: {
      query: SecuritiesAll,
      variables: { id: store.state.portfolio?.id },
    },
  },
  components: { N: FormattedNumber },
})
export default class SecuritiesPage extends Mixins(Vue, IconsMixin) {
  securities: Security[] = []
}
</script>
