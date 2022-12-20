<template>
  <div>
    <el-table
      v-if="logs"
      ref="table"
      :data="logs"
      stripe
      style="width: 100%"
      size="mini"
      :row-class-name="tableRowClassName"
    >
      <el-table-column sortable width="150" prop="id" label="Type ID">
        <template #default="scope">
          {{ scope.row.objtype }}{{ scope.row.id }}
          <br />
          v{{ scope.row.base['version'] }} ⮞ v{{ scope.row.change['version'] }}
          <el-link
            type="info"
            target="_blank"
            :href="`https://osmlab.github.io/osm-deep-history/#/${
              { n: 'node', w: 'way', r: 'relation' }[scope.row.objtype]
            }/${scope.row.id}`"
            title="OSM Deep History"
            size="small"
          >
            OSM Deep H
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        width="100"
        prop="action"
        label="Action"
        :filters="[
          { text: 'accept', value: 'accept' },
          { text: 'reject', value: 'reject' },
        ]"
        :filter-method="filterAction"
      >
        <template #default="scope">
          <el-tag
            v-if="scope.row.action"
            :type="scope.row.action === 'reject' ? 'danger' : 'success'"
            size="small"
          >
            {{ scope.row.action }}
          </el-tag>
          <el-tag
            v-if="scope.row.diff_attribs && scope.row.diff_attribs['deleted']"
            type="danger"
            size="small"
          >
            deleted
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="300" label="Attributes">
        <template #default="scope">
          <Diff
            :src="scope.row.base"
            :dst="scope.row.change"
            :diff="scope.row.diff_attribs || {}"
            :exclude="
              [].concat(
                ['tags', 'version'],
                scope.row.objtype !== 'n' ? ['lon', 'lat'] : [],
                scope.row.objtype !== 'w' ? ['nodes'] : [],
                scope.row.objtype !== 'r' ? ['members'] : []
              )
            "
            :clear="['nodes', 'members']"
          />
        </template>
      </el-table-column>
      <el-table-column label="tags">
        <template #default="scope">
          <Diff
            :src="scope.row.base.tags"
            :dst="scope.row.change.tags"
            :diff="scope.row.diff_tags || {}"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Logs, Log } from '~/libs/types'

export default Vue.extend({
  name: 'LogsComponent',

  props: {
    logs: {
      type: Array as PropType<Logs>,
      required: true,
    },
  },

  methods: {
    tableRowClassName({
      log,
      _rowIndex,
    }: {
      log: Log
      _rowIndex: number
    }): string | null {
      return log?.action
        ? {
            reject: 'warning-row',
            accept: 'success-row',
            null: null,
          }[log.action]
        : null
    },

    filterAction(value: string, log: Log) {
      return log.action === value
    },
  },
})
</script>

<style scoped>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

:deep(.el-table__cell) {
  vertical-align: top;
}
</style>
