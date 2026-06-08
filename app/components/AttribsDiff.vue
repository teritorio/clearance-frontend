<script setup lang="ts">
import type { Action, Actions } from '@teritorio/openstreetmap-logical-history-component'

defineProps<{
  diff: Actions
}>()

function formatOption(key: string, value: unknown): string {
  if (key === 'dist' && typeof value === 'number') {
    return `${Math.round(value)} m`
  }
  return String(value)
}
</script>

<template>
  <div class="attribs-diff">
    <template v-for="(actions, key) in diff" :key="key">
      <template v-for="(action, i) in (actions as Action[])" :key="i">
        <el-tag
          type="warning"
          effect="plain"
          size="small"
          :disable-transitions="true"
          class="action-tag"
        >
          {{ action[0] }}
          <template v-if="action[2]">
            <span v-for="(option, k) in action[2]" :key="k" class="action-option">
              — {{ formatOption(String(k), option) }}
            </span>
          </template>
        </el-tag>
      </template>
    </template>
  </div>
</template>

<style scoped>
.action-tag {
  margin-right: 0.3em;
  font-weight: bold;
}

.action-option {
  opacity: 0.85;
}
</style>
