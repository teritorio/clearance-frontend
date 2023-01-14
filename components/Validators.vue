<template>
  <div>
    <el-table
      v-if="validators"
      ref="table"
      :data="Object.entries(validators)"
      stripe
      style="width: 100%"
      size="mini"
    >
      <el-table-column sortable prop="id" label="Validator ID">
        <template #default="scope">
          {{ scope.row[0] }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="id" label="Action">
        <template #default="scope">
          {{
            scope.row[1].action &&
            (scope.row[1].action.action || scope.row[1].action.action_force)
          }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="id" label="Description">
        <template #default="scope">
          {{ scope.row[1].description }}
        </template>
      </el-table-column>
      <el-table-column sortable prop="id" label="Other">
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
import Vue, { PropType } from 'vue'
import { Validators } from '~/libs/types'

export default Vue.extend({
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
