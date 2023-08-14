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

<script lang="ts">
import { PropType } from 'vue'
import { Validators } from '~/libs/types'

export default defineNuxtComponent({
  name: 'ValidatorsComponent',

  props: {
    validators: {
      type: Object as PropType<Validators>,
      required: true,
    },
  },
})
</script>

<style scoped>
:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
