<template>
  <div>
    <div style="margin-top: 20px">
      <el-badge :value="logs.length" class="item">
        <el-tag>{{ $t('logs.objects') }}</el-tag>
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

    <template v-for="log in logs || []" :key="log.id">
      <br />

      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>
              {{ log.objtype }}{{ log.id }} -
              {{ log.base.tags.name || log.change.tags.name }}
            </span>
            <span>
              <el-tag
                v-if="log.diff_attribs && log.diff_attribs['deleted']"
                type="danger"
                size="small"
                :disable-transitions="true"
              >
                {{ $t('logs.deleted') }}
              </el-tag>
            </span>
            <span class="">
              <el-text class="mx-1" size="small">
                📌 {{ log.matches.map((m) => m.split(':')[0]).join(', ') }} 🏷️
                {{ log.matches.map((m) => m.split('#')[1]).join(', ') }}
              </el-text>
            </span>
            <span>
              <a
                class="el-button"
                :href="`https://www.openstreetmap.org/${objtypeFull(
                  log.objtype
                )}/${log.id}`"
                target="_blank"
              >
                OSM
              </a>

              <a
                class="el-button"
                :href="`http://127.0.0.1:8111/load_object?objects=${log.objtype}${log.id}`"
                target="hidden_josm_target"
              >
                JOSM
              </a>

              <a
                class="el-button"
                target="_blank"
                :href="`https://osmlab.github.io/osm-deep-history/#/${objtypeFull(
                  log.objtype
                )}/${log.id}`"
                title="OSM Deep History"
              >
                Deep H
              </a>

              <el-button
                v-if="user"
                type="primary"
                @click="
                  accept({
                    objtype: log.objtype,
                    id: log.id,
                    version: log.change.version,
                  })
                "
                >✓</el-button
              >
            </span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="7">
            v{{ log.base['version'] }} ⮞ v{{ log.change['version'] }}
            <Changesets :changesets="log.changesets.slice(1)" />
          </el-col>
          <el-col :span="7">
            <Diff
              :src="log.base"
              :dst="log.change"
              :diff="log.diff_attribs || {}"
              :exclude="[
                'tags',
                'version',
                'changeset_id',
                'created',
                'uid',
                'username',
                'lat',
                'lon',
                ...(log.objtype !== 'n' ? ['lon', 'lat'] : []),
                ...(log.objtype !== 'w' ? ['nodes'] : []),
                ...(log.objtype !== 'r' ? ['members'] : []),
              ]"
              :clear="['nodes', 'members']"
            />
            <LazyComponent
              v-if="
                log.diff_attribs &&
                (log.diff_attribs.hasOwnProperty('lat') ||
                  log.diff_attribs.hasOwnProperty('lon') ||
                  log.diff_attribs.hasOwnProperty('nodes'))
              "
              style="border: 1px solid lightgrey"
            >
              <DiffMap
                :id="log.id"
                :objtype="log.objtype"
                :created-at-base="log.base.created"
                :created-at-change="log.change.created"
              />
            </LazyComponent>
          </el-col>
          <el-col :span="10">
            <Diff
              :src="log.base.tags"
              :dst="log.change.tags"
              :diff="log.diff_tags || {}"
            />
          </el-col>
        </el-row>
      </el-card>
    </template>

    <iframe name="hidden_josm_target" style="display: none"></iframe>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import LazyComponent from 'v-lazy-component'
import _ from 'underscore'
import { User } from '~/libs/apiTypes'
import Diff from '~/components/Diff.vue'
import {
  Logs,
  ObjectId,
  ObjTypeFull,
  ObjType,
  objTypeFull,
  setLogs,
} from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

  components: {
    Diff,
    LazyComponent,
  },

  props: {
    project: {
      type: String,
      required: true,
    },
    user: {
      type: Object as PropType<User | null>,
      default: null,
    },
    logs: {
      type: Array as PropType<Logs>,
      required: true,
    },
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
    accept(objectId: ObjectId) {
      setLogs(useRuntimeConfig().public.API, this.project, 'accept', [objectId])
        .then(() => {
          const index = this.logs.findIndex(
            (log) => log.objtype === objectId.objtype && log.id === objectId.id
          )
          if (index > -1) {
            this.logs.splice(index, 1)
          }
        })
        .catch((error) => {
          alert(error)
        })
    },

    objtypeFull(objtype: ObjType): ObjTypeFull {
      return objTypeFull(objtype)
    },
  },
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
