<script lang="ts">
import type { PropType } from 'vue'

export default defineNuxtComponent({
  name: 'DiffCompinent',

  props: {
    object: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    exclude: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },

  computed: {
    keys(): string[] {
      return Object.keys(this.object).filter(
        (key) => !this.exclude.includes(key),
      )
    },
  },
})
</script>

<template>
  <table>
    <tr v-for="key in keys" :key="key">
      <td>
        {{ key }}
      </td>
      <td>
        {{ object[key] }}
      </td>
    </tr>
  </table>
</template>

<style scoped>
td {
  vertical-align: top;
}

td.key {
  white-space: nowrap;
}
</style>
