<template>
  <div>
    <v-select
      :value="value"
      :items="$store.state.currencies"
      item-text="code"
      item-value="code"
      :label="label"
      @input="update"
      outlined
      dense
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class SelectCurrency extends Vue {
  @Prop({ default: '' })
  value!: string

  @Prop({ default: '' })
  label!: string

  update(event: string): void {
    this.$emit('input', event)
  }
}
</script>
