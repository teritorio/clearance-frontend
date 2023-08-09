<template>
  <div>
    <div style="margin-top: 20px">
      <el-button :disabled="!user" type="primary" @click="action(true)">
        Accept selection
      </el-button>
      <el-button :disabled="!user" @click="clearSelection()">
        Clear selection
      </el-button>
      <el-divider direction="vertical" />
      <el-badge :value="logs.length" class="item">
        <el-tag>Objects</el-tag>
      </el-badge>
      <el-badge
        v-for="[key, count] in stats"
        :key="key"
        :value="count"
        class="item"
      >
        <el-tag size="small" type="danger">{{ key }}</el-tag>
      </el-badge>
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
      <el-table-column :type="user ? 'selection' : undefined" width="35" />
      <el-table-column sortable width="250" prop="id" label="Type ID">
        <template #default="scope">
          <el-button
            v-if="user"
            circle
            @click="
              accept({
                objtype: scope.row.objtype,
                id: scope.row.id,
                version: scope.row.change.version,
              })
            "
            >✓</el-button
          >
          &nbsp;
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

          <el-tag
            v-if="scope.row.diff_attribs && scope.row.diff_attribs['deleted']"
            type="danger"
            size="small"
            :disable-transitions="true"
          >
            deleted
          </el-tag>

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

          <Changesets :changesets="scope.row.changesets.slice(1)" />
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
              'lat',
              'lon',
              ...(scope.row.objtype !== 'n' ? ['lon', 'lat'] : []),
              ...(scope.row.objtype !== 'w' ? ['nodes'] : []),
              ...(scope.row.objtype !== 'r' ? ['members'] : []),
            ]"
            :clear="['nodes', 'members']"
          />
          <LazyComponent>
            <DiffMap
              v-if="
                scope.row.diff_attribs &&
                (scope.row.diff_attribs.hasOwnProperty('lat') ||
                  scope.row.diff_attribs.hasOwnProperty('lon') ||
                  scope.row.diff_attribs.hasOwnProperty('nodes'))
              "
              :id="scope.row.id"
              :objtype="scope.row.objtype"
              :created-at-base="scope.row.changesets[0].created_at"
              :created-at-change="scope.row.changesets.at(-1).created_at"
            />
          </LazyComponent>
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
import LazyComponent from 'v-lazy-component'
import _ from 'underscore'
import { User } from '~/libs/apiTypes'
import {
  Logs,
  Log,
  LogAction,
  ObjectId,
  ObjTypeFull,
  ObjType,
  objTypeFull,
} from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

  components: {
    LazyComponent,
  },

  props: {
    user: {
      type: Object as PropType<Ref<User | null>>,
      default: null,
    },
    logs: {
      type: Array as PropType<Logs>,
      required: true,
    },
  },

  data(): {
    multipleSelection: Ref<Logs>
  } {
    return {
      multipleSelection: ref<Logs>([]),
    }
  },

  emits: {
    action: (_: { logAction: LogAction; objectIds: ObjectId[] }) => true,
  },

  computed: {
    stats(): [string, number][] {
      const actions = this.logs
        .map((log) =>
          _.uniq(
            [
              ...Object.values(log.diff_attribs || {}),
              ...Object.values(log.diff_tags || {}),
            ]
              .flat(1)
              .map((action) => action[0])
          )
        )
        .flat(1)

      return _.sortBy(
        Object.entries(
          _.pick(_.countBy(actions), (value) => value > this.logs.length * 0.05)
        ) as [string, number][],
        ([_key, count]) => -count
      )
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

    accept(objectId: ObjectId) {
      this.$emit('action', {
        logAction: 'accept',
        objectIds: [objectId],
      })

      const index = this.logs.findIndex(
        (log) => log.objtype === objectId.objtype && log.id === objectId.id
      )
      if (index > -1) {
        this.logs.splice(index, 1)
      }
    },

    objtypeFull(objtype: ObjType): ObjTypeFull {
      return objTypeFull(objtype)
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
