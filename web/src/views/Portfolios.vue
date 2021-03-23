<template>
  <v-container class="d-flex justify-center">
    <div style="width: 800px">
      <v-btn color="primary" class="mb-4" @click="newPortfolio">
        <v-icon>{{ mdiPlus }}</v-icon> {{ $t('common.new') }}
      </v-btn>

      <v-data-table
        :items="$store.state.portfolios"
        :items-per-page="-1"
        :headers="[
          { text: $t('common.id'), value: 'id' },
          { text: $t('common.name'), value: 'name' },
          { text: $t('common.note'), value: 'note' },
          { text: $tc('common.currency', 1), value: 'baseCurrencyCode' },
          { value: 'actions' },
        ]"
        hide-default-footer
      >
        <template #item.actions="{ item }">
          <v-btn color="primary" icon text @click="editPortfolio(item)">
            <v-icon>{{ mdiPencil }}</v-icon>
          </v-btn>
          <v-btn color="error" icon text @click="confirmDeletePortfolio(item)">
            <v-icon>{{ mdiDelete }}</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="portfolioDialog" width="500">
        <v-form ref="form" @submit.prevent="savePortfolio">
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="selectedPortfolio.name"
                :label="$t('common.name')"
                outlined
                :rules="[ruleMinLength(1)]"
                dense
              />
              <v-text-field
                v-model="selectedPortfolio.note"
                :label="$t('common.note')"
                outlined
                dense
              />
              <select-currency
                v-model="selectedPortfolio.baseCurrencyCode"
                :label="$tc('common.currency', 1)"
                :rules="[ruleMinLength(1, $tc('common.required'))]"
              />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="portfolioDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> {{ $t('common.cancel') }}
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> {{ $t('common.save') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog v-model="deleteDialog" width="500">
        <v-form ref="form" @submit.prevent="deletePortfolio">
          <v-card>
            <v-card-text>
              {{
                $t('portfolios.confirm-delete-msg', {
                  name: selectedPortfolio.name,
                })
              }}
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" text @click="deleteDialog = false">
                <v-icon>{{ mdiClose }}</v-icon> {{ $t('common.no') }}
              </v-btn>
              <v-btn type="submit" color="primary" text>
                <v-icon>{{ mdiCheck }}</v-icon> {{ $t('common.yes') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-snackbar v-model="showSnackbar" timeout="5000" text color="error">
        {{ snackbarMessage }}
      </v-snackbar>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'

import { ruleMinLength } from '@/utils'
import { Portfolio } from '@/store/portfolio.model'
import { IconsMixin } from '@/components/icons-mixin'
import SelectCurrency from '@/components/SelectCurrency.vue'

@Component({
  components: { SelectCurrency },
})
export default class PortfoliosPage extends Mixins(Vue, IconsMixin) {
  $refs!: {
    form: HTMLFormElement
  }
  showSnackbar = false
  snackbarMessage = ''

  portfolioDialog = false
  deleteDialog = false
  selectedPortfolio = {} as Portfolio

  ruleMinLength = ruleMinLength

  newPortfolio(): void {
    this.selectedPortfolio = { name: '', note: '', baseCurrencyCode: '' }
    this.portfolioDialog = true
    if (this.$refs.form) this.$refs.form.resetValidation()
  }

  editPortfolio(portfolio: Portfolio): void {
    this.selectedPortfolio = { ...portfolio }
    this.portfolioDialog = true
  }

  async savePortfolio(): Promise<void> {
    if (!this.$refs.form.validate()) {
      return
    }

    try {
      if (this.selectedPortfolio.id) {
        await this.$store.dispatch('updatePortfolio', this.selectedPortfolio)
      } else {
        await this.$store.dispatch('addPortfolio', this.selectedPortfolio)
      }
    } catch (err) {
      this.snackbarMessage = err
      this.showSnackbar = true
    }
    this.portfolioDialog = false
  }

  confirmDeletePortfolio(portfolio: Portfolio): void {
    this.selectedPortfolio = portfolio
    this.deleteDialog = true
  }

  async deletePortfolio(): Promise<void> {
    await this.$store.dispatch('deletePortfolio', this.selectedPortfolio)
    this.deleteDialog = false
  }
}
</script>
