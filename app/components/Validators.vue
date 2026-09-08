<script setup lang="ts">
import type { Validators } from '~/libs/types'

const props = defineProps<{
  validators: Validators
}>()

const rows = computed(() =>
  props.validators.map((item) => {
    const { id, description, global_osm_tags_matches: _g, specific_osm_tags_matches: _s, ...rawConfig } = item.settings
    const config = Object.fromEntries(
      Object.entries(rawConfig).filter(([, v]) => v !== null),
    )
    return {
      id,
      actions: item.actions ?? [],
      description,
      config: Object.keys(config).length ? config : null,
    }
  }),
)
</script>

<template>
  <div class="validators-wrapper">
    <p class="intro-text">
      Liste et ordre des règles de validation appliquées aux changements entrant.
      <el-tag type="success" size="small" class="legend-tag">
        accept
      </el-tag> {{ $t('validators.legendAccept') }} ·
      <el-tag type="danger" size="small" class="legend-tag">
        reject
      </el-tag> {{ $t('validators.legendReject') }} ·
      <el-tag type="warning" size="small" class="legend-tag">
        forced
      </el-tag> {{ $t('validators.legendForced') }}
    </p>
    <el-table :data="rows" stripe size="small" class="validators-table">
      <el-table-column :label="$t('validators.action')" min-width="200">
        <template #default="{ row }">
          <div class="actions-cell">
            <div v-if="!row.actions.length" class="action-row">
              <span class="action-validator-id">{{ row.id }}</span>
            </div>
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
  padding-top: 12px;
}

.intro-text {
  font-size: 0.85rem;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
}

.legend-tag {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  vertical-align: middle;
  margin: 0 2px;
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

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
