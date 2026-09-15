<script setup lang="ts">
import type { ValidatorAction, ValidatorActions } from '~/composables/useChangesLogs'

defineProps<{
  diff: ValidatorActions
  validatorDescriptions?: Record<string, string | null>
}>()
</script>

<template>
  <div class="attribs-diff">
    <template v-for="(actions, key) in diff" :key="key">
      <el-tag
        v-if="(actions as ValidatorAction[]).length === 0"
        type="warning"
        size="small"
        :disable-transitions="true"
        class="action-tag"
      >
        ?
      </el-tag>
      <template v-else>
        <template v-for="(action, i) in (actions as ValidatorAction[])" :key="i">
          <el-dropdown
            v-if="action.options"
            :show-timeout="0"
            class="action-tag"
          >
            <span class="el-dropdown-link">
              <el-badge
                :value="Object.keys(action.options).length || undefined"
                :type="action.action === 'reject' ? 'danger' : 'info'"
              >
                <el-tooltip :content="validatorDescriptions?.[action.validator_id] ?? undefined" :disabled="!validatorDescriptions?.[action.validator_id]" placement="top">
                  <el-tag
                    :type="action.action === 'reject' ? 'danger' : 'info'"
                    size="small"
                    :disable-transitions="true"
                  >
                    {{ action.validator_id }} ⮟
                  </el-tag>
                </el-tooltip>
              </el-badge>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(option, k) in action.options" :key="k">
                  {{ k }}
                  <template v-if="Array.isArray(option)">
                    <ul>
                      <li v-for="op in option" :key="op">
                        {{ op }}
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    {{ option }}
                  </template>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-tooltip v-else :content="validatorDescriptions?.[action.validator_id] ?? undefined" :disabled="!validatorDescriptions?.[action.validator_id]" placement="top">
            <el-tag
              :type="action.action === 'reject' ? 'danger' : 'info'"
              size="small"
              :disable-transitions="true"
              class="action-tag"
            >
              {{ action.validator_id }}
            </el-tag>
          </el-tooltip>
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped>
.action-tag {
  margin-right: 0.3em;
  font-weight: bold;
}
</style>
