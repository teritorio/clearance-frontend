<template>
  <div>
    <div style="margin-top: 20px">
      <el-button @click="action(true)">Accept selection</el-button>
      <el-button @click="action(false)">Reject selection</el-button>
      <el-button @click="clearSelection()">Clear selection</el-button>
    </div>
    <el-table
      v-if="logs"
      ref="table"
      :data="logs"
      stripe
      style="width: 100%"
      size="small"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column sortable width="150" prop="id" label="Type ID">
        <template #default="scope">
          <a
            :href="`https://www.openstreetmap.org/${objtypeFull(
              scope.row.objtype
            )}/${scope.row.id}`"
            target="_blank"
          >
            {{ scope.row.objtype }}{{ scope.row.id }}
          </a>
          <a
            :href="`http://127.0.0.1:8111/load_object?objects=${scope.row.objtype}${scope.row.id}`"
            target="hidden_josm_target"
          >
            (j)
          </a>
          <br />
          v{{ scope.row.base['version'] }} ⮞ v{{ scope.row.change['version'] }}
          <el-link
            type="info"
            target="_blank"
            :href="`https://osmlab.github.io/osm-deep-history/#/${objtypeFull(
              scope.row.objtype
            )}/${scope.row.id}`"
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
            :disable-transitions="true"
          >
            {{ scope.row.action }}
          </el-tag>
          <el-tag
            v-if="scope.row.diff_attribs && scope.row.diff_attribs['deleted']"
            type="danger"
            size="small"
            :disable-transitions="true"
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
            :exclude="[
              'tags',
              'version',
              'changeset_id',
              'created',
              'uid',
              'username',
              'changeset',
              ...(scope.row.objtype !== 'n' ? ['lon', 'lat'] : []),
              ...(scope.row.objtype !== 'w' ? ['nodes'] : []),
              ...(scope.row.objtype !== 'r' ? ['members'] : []),
            ]"
            :clear="['nodes', 'members']"
          />
          <el-collapse v-model="accordion" accordion>
            <el-collapse-item :title="scope.row.change.changeset.user" name="0">
              <p>{{ scope.row.change.changeset.tags.source }}</p>
              <p>{{ scope.row.change.changeset.tags.comment }}</p>
            </el-collapse-item>

            <el-collapse-item title="Changeset details" name="1">
              <table>
                <template
                  v-for="[key, value] in Object.entries(
                    scope.row.change.changeset
                  )"
                  :key="key"
                >
                  <tr v-if="!['tags'].includes(key)">
                    <td>{{ key }}</td>
                    <td>{{ value }}</td>
                  </tr>
                </template>
              </table>

              <table>
                <template
                  v-for="[key, value] in Object.entries(
                    scope.row.change.changeset.tags
                  )"
                  :key="key"
                >
                  <tr v-if="![].includes(key)">
                    <td>{{ key }}</td>
                    <td>{{ value }}</td>
                  </tr>
                </template>
              </table>
            </el-collapse-item>
          </el-collapse>
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
    <iframe name="hidden_josm_target" style="display: none"></iframe>
  </div>
</template>

<script lang="ts">
import { PropType, ref, Ref } from 'vue'
import { Logs, Log } from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

  props: {
    logs: {
      type: Array as PropType<Logs>,
      required: true,
    },
  },

  data(): {
    multipleSelection: Ref<Logs>
    accordion: Ref<string>
  } {
    return {
      multipleSelection: ref<Logs>([]),
      accordion: ref('0'),
    }
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

    handleSelectionChange(val: Logs) {
      this.multipleSelection.value = val
    },

    clearSelection() {
      this.$refs.table.clearSelection()
    },

    action(accept: boolean) {
      this.$emit('action', {
        logAction: accept ? 'accept' : 'reject',
        objectIds: this.multipleSelection.value.map((log) => ({
          objtype: log.objtype,
          id: log.id,
          version: log.change.version,
        })),
      })
    },

    objtypeFull(objtype: 'n' | 'w' | 'r'): 'node' | 'way' | 'relation' {
      return { n: 'node', w: 'way', r: 'relation' }[objtype] as
        | 'node'
        | 'way'
        | 'relation'
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
