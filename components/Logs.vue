<template>
  <div>
    <div style="margin-top: 20px">
      <el-button :disabled="!user" @click="action(true)">
        Accept selection
      </el-button>
      <el-button :disabled="!user" @click="clearSelection()">
        Clear selection
      </el-button>
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
      <el-table-column :type="user ? 'selection' : undefined" width="55" />
      <el-table-column sortable width="250" prop="id" label="Type ID">
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

          <el-collapse v-model="accordion" accordion>
            <el-collapse-item title="Changesets" name="0">
              <template
                v-for="(changeset, index) in scope.row.changesets.slice(1)"
                :key="index"
              >
                <p class="changeset">
                  <span>✎ {{ changeset.tags.comment }}</span
                  ><br />
                  <template v-if="changeset.tags.source"
                    ><span>📷 {{ changeset.tags.source }}</span
                    ><br
                  /></template>
                  <span>👤 {{ changeset.user }}</span>
                  <template v-if="changeset.tags.created_by"
                    ><span>🛠 {{ changeset.tags.created_by }}</span
                    ><br
                  /></template>
                  <span>⯼ #{{ changeset.id }}</span>
                </p>
              </template>
            </el-collapse-item>

            <el-collapse-item
              v-for="(changeset, index) in scope.row.changesets.slice(1)"
              :key="index"
              :title="`Changeset details #${changeset.id}`"
              :name="index"
            >
              <table>
                <template
                  v-for="[key, value] in Object.entries(changeset)"
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
                  v-for="[key, value] in Object.entries(changeset.tags)"
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
import { User } from '~/libs/apiTypes'
import { Logs, Log, LogAction, ObjectId } from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

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
    accordion: Ref<string>
  } {
    return {
      multipleSelection: ref<Logs>([]),
      accordion: ref('0'),
    }
  },

  emits: {
    action: (_: { logAction: LogAction; objectIds: ObjectId[] }) => true,
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

.changeset span:nth-child(1) {
  background-color: #eef;
}

.changeset span:nth-child(2) {
  background-color: #efe;
}

.changeset span:nth-child(3) {
  background-color: #fee;
}

.changeset span:nth-child(4) {
  background-color: #ffe;
}

.changeset span:nth-child(5) {
  background-color: #eff;
}
</style>
