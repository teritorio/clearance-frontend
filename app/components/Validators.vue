<script setup lang="ts">
import type { Validators } from '~/libs/types'

const props = defineProps<{
  validators: Validators
}>()

const rows = computed(() =>
  props.validators.map((item) => ({
    id: item.settings.id,
    actions: item.actions ?? [],
    description: item.settings.description,
  })),
)
</script>

<template>
  <el-table :data="rows" stripe size="small" style="width: 100%">
    <el-table-column :label="$t('validators.name')" min-width="220">
      <template #default="{ row }">
        <span class="validator-id">{{ row.id }}</span>
      </template>
    </el-table-column>

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
  </el-table>
</template>

<style scoped>
.validator-id {
  font-weight: 600;
  font-size: 0.875rem;
  font-family: ui-monospace, monospace;
  color: var(--el-text-color-primary);
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

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
