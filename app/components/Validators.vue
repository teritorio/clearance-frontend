<script setup lang="ts">
import type { Validators } from '~/libs/types'

const props = defineProps<{
  validators: Validators
}>()

const legendOpen = ref<string[]>(['legend'])

const rows = computed(() =>
  props.validators.map((item) => {
    const { id: _id, description, ...rawConfig } = item.settings
    const config = Object.fromEntries(
      Object.entries(rawConfig).filter(([, v]) => v !== null),
    )
    return {
      actions: item.actions ?? [],
      description,
      config: Object.keys(config).length ? config : null,
    }
  }),
)
</script>

<template>
  <div class="validators-wrapper">
    <el-collapse v-model="legendOpen" class="legend">
      <el-collapse-item name="legend">
        <template #title>
          <span class="legend-title">ℹ️ {{ $t('validators.legend') }}</span>
        </template>
        <div class="legend-body">
          <div class="legend-row">
            <el-tag type="success" size="small" class="legend-tag">
              accept
            </el-tag>
            <span>{{ $t('validators.legendAccept') }}</span>
          </div>
          <div class="legend-row">
            <el-tag type="danger" size="small" class="legend-tag">
              reject
            </el-tag>
            <span>{{ $t('validators.legendReject') }}</span>
          </div>
          <div class="legend-row">
            <el-tag type="warning" size="small" class="legend-tag">
              forced
            </el-tag>
            <span>{{ $t('validators.legendForced') }}</span>
          </div>
          <p class="legend-order">
            {{ $t('validators.legendOrder') }}
          </p>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-table :data="rows" stripe size="small" style="width: 100%">
      <el-table-column :label="$t('validators.action')" min-width="200">
        <template #default="{ row }">
          <div class="actions-cell">
            <div v-for="action in row.actions" :key="action.validator_id" class="action-row">
              <el-tag
                :type="action.action === 'accept' ? 'success' : 'danger'"
                size="small"
                class="action-tag"
              >
                {{ action.action }}
              </el-tag>
              <el-tag
                v-if="action.force"
                type="warning"
                size="small"
                class="action-tag"
              >
                forced
              </el-tag>
              <span class="action-validator-id">{{ action.validator_id }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('validators.description')" min-width="240">
        <template #default="{ row }">
          <span class="description-text">{{ row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('validators.config')" min-width="240">
        <template #default="{ row }">
          <pre v-if="row.config" class="config-json">{{ JSON.stringify(row.config, null, 2) }}</pre>
          <span v-else class="config-empty">—</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.validators-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.legend-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.legend-tag {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  flex-shrink: 0;
}

.legend-order {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.actions-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.action-tag {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
}

.action-validator-id {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
}

.description-text {
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
}

.config-json {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  color: var(--el-text-color-regular);
}

.config-empty {
  color: var(--el-text-color-placeholder);
}

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
