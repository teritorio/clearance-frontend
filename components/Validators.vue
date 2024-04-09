<script lang="ts">
import type { PropType } from 'vue'
import type { Validators } from '~/libs/types'

export default defineNuxtComponent({
  name: 'ValidatorsCompo',

  props: {
    validators: {
      type: Object as PropType<Validators>,
      required: true,
    },
  },
})
</script>

<template>
  <div>
    <el-table
      v-if="validators"
      ref="table"
      :data="Object.entries(validators)"
      stripe
      style="width: 100%"
      size="small"
    >
      <el-table-column sortable prop="id" :label="$t('validators.validatorId')">
        <template #default="scope">
          {{ scope.row[0] }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="id" :label="$t('validators.action')">
        <template #default="scope">
          {{ scope.row[1].action || scope.row[1].action_force }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="id" :label="$t('validators.description')">
        <template #default="scope">
          {{ scope.row[1].description }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="id" :label="$t('validators.other')">
        <template #default="scope">
          <Object
            :object="scope.row[1]"
            :exclude="['action', 'action_force', 'description']"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
