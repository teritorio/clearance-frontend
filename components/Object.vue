<script setup lang="ts">
const props = withDefaults(defineProps<{
  object: Record<string, any>
  exclude?: string[]
}>(), {
  exclude: () => [],
})

const keys = computed(() =>
  Object.keys(props.object).filter(
    (key) => !props.exclude.includes(key),
  ),
)
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
