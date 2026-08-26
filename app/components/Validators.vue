<script setup lang="ts">
import type { Validators } from '~/libs/types'

const props = defineProps<{
  validators: Validators
}>()

const ACTION_KEYS = ['action', 'action_force', 'reject', 'accept'] as const
const KNOWN_KEYS = new Set(['instance', 'action', 'action_force', 'reject', 'accept', 'description'])

const rows = computed(() =>
  Object.entries(props.validators).map(([key, config]) => {
    const actions = ACTION_KEYS
      .filter((k) => config[k] !== undefined)
      .map((k) => ({ key: k, value: config[k] as string }))

    const others = Object.fromEntries(
      Object.entries(config).filter(([k]) => !KNOWN_KEYS.has(k)),
    )

    return {
      key,
      instance: config.instance,
      actions,
      description: config.description,
      others: Object.keys(others).length > 0 ? others : null,
    }
  }),
)

function actionTagType(key: string, value: string) {
  if (value === 'accept') {
    return 'success'
  }
  if (value === 'reject') {
    return 'danger'
  }
  // reject/accept keys with a string value
  if (key === 'reject') {
    return 'warning'
  }
  return 'primary'
}
</script>

<template>
  <el-table :data="rows" stripe size="small" style="width: 100%">
    <el-table-column :label="$t('validators.name')" min-width="200">
      <template #default="{ row }">
        <div class="name-cell">
          <span class="validator-key">{{ row.key }}</span>
          <code v-if="row.instance" class="instance-chip">{{ row.instance }}</code>
        </div>
      </template>
    </el-table-column>

    <el-table-column :label="$t('validators.action')" min-width="180">
      <template #default="{ row }">
        <div class="action-cell">
          <el-tag
            v-for="a in row.actions"
            :key="a.key"
            :type="actionTagType(a.key, a.value)"
            size="small"
            class="action-tag"
          >
            {{ a.key }}: {{ a.value }}
          </el-tag>
        </div>
      </template>
    </el-table-column>

    <el-table-column :label="$t('validators.description')" min-width="200">
      <template #default="{ row }">
        <span class="description-text">{{ row.description }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="$t('validators.others')" min-width="220">
      <template #default="{ row }">
        <textarea v-if="row.others" :value="JSON.stringify(row.others, null, 2)" class="others-textarea" readonly />
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.validator-key {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--el-text-color-primary);
}

.instance-chip {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 0.7rem;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-dark);
  border-radius: 4px;
  padding: 1px 5px;
}

.action-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.action-tag {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
}

.description-text {
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
}

.others-textarea {
  width: 100%;
  max-height: 120px;
  font-family: ui-monospace, monospace;
  font-size: 0.7rem;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 4px 6px;
  resize: vertical;
  box-sizing: border-box;
}

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
