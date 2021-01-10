<template>
  <i18n-n :value="valueAsNumber" :format="formatOptions">
    <template v-if="focus" v-slot:currency="slotProps">
      <span style="font-size: 0.8em">{{ slotProps.currency }}</span>
    </template>
    <template v-if="focus" v-slot:fraction="slotProps">
      <span style="font-size: 0.7em; vertical-align: text-top">{{
        slotProps.fraction
      }}</span>
    </template>
  </i18n-n>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Big from 'big.js'
import { NumberFormatOptions } from 'vue-i18n'

@Component
export default class FormattedNumber extends Vue {
  @Prop({ required: true })
  value!: Big | number

  @Prop()
  currency?: string

  @Prop({ type: Boolean, default: false })
  percent!: boolean

  @Prop({ type: Boolean, default: false })
  focus!: boolean

  get valueAsNumber(): number {
    if (typeof this.value == 'number') return this.value
    else return this.value.toNumber()
  }

  get formatOptions(): NumberFormatOptions {
    if (this.currency) {
      return {
        style: 'currency',
        currency: this.currency,
        currencyDisplay: 'symbol',
      }
    } else if (this.percent) {
      return { style: 'percent' }
    } else {
      return { style: 'decimal' }
    }
  }
}
</script>
