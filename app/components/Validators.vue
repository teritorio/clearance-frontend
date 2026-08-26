<script setup lang="ts">
import type { Validators } from '~/libs/types'

const props = defineProps<{
  validators: Validators
}>()

const rows = computed(() =>
  props.validators.map((item) => ({
    id: item.settings.id,
    actionType: item.action ? item.action[1] : null,
    actionForce: item.action_force,
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

    <el-table-column :label="$t('validators.action')" min-width="160">
      <template #default="{ row }">
        <div class="action-cell">
          <el-tag
            v-if="row.actionType"
            :type="row.actionType === 'accept' ? 'success' : 'danger'"
            size="small"
            class="action-tag"
          >
            {{ row.actionType }}
          </el-tag>
          <el-tag
            v-if="row.actionForce"
            type="warning"
            size="small"
            class="action-tag"
          >
            forced
          </el-tag>
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

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
