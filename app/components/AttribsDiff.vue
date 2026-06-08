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
      <el-tag
        v-if="(actions as Action[]).length === 0"
        type="warning"
        effect="plain"
        size="small"
        :disable-transitions="true"
        class="action-tag"
      >
        ?
      </el-tag>
      <template v-else>
        <template v-for="(action, i) in (actions as Action[])" :key="i">
          <el-dropdown
            v-if="action[2]"
            :show-timeout="0"
            class="action-tag"
          >
            <span class="el-dropdown-link">
              <el-badge
                :value="Object.keys(action[2]).length || undefined"
                type="warning"
              >
                <el-tag
                  type="warning"
                  effect="plain"
                  size="small"
                  :disable-transitions="true"
                >
                  {{ action[0] }} ⮟
                </el-tag>
              </el-badge>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(option, k) in action[2]" :key="k">
                  {{ k }}
                  <template v-if="Array.isArray(option)">
                    <ul>
                      <li v-for="op in option" :key="op">
                        {{ op }}
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    {{ formatOption(String(k), option) }}
                  </template>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-tag
            v-else
            type="warning"
            effect="plain"
            size="small"
            :disable-transitions="true"
            class="action-tag"
          >
            {{ action[0] }}
          </el-tag>
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped>
.action-tag {
  margin-right: 0.3em;
}
</style>
