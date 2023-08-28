<template>
  <div>
    <div style="margin-top: 20px">
      <el-badge :value="logs.length" class="item">
        <el-tag size="small">{{ $t('logs.objects') }}</el-tag>
      </el-badge>
      <el-badge
        v-for="[key, count] in stats"
        :key="key"
        :value="count"
        class="item"
      >
        <el-tag size="small" type="danger">{{ key }}</el-tag>
      </el-badge>
      <br />
      <el-badge
        v-for="[key, count] in statUserGroups"
        :key="key"
        :value="count"
        class="item"
      >
        <el-tag size="small">📌 {{ key }}</el-tag>
      </el-badge>
      <br />
      <el-badge
        v-for="[key, count] in statSelectors"
        :key="key"
        :value="count"
        class="item"
      >
        <el-tag size="small" type="warning">🏷️ {{ key }}</el-tag>
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
                class="item"
              >
                {{ $t('logs.deleted') }}
              </el-tag>
            </span>
            <span class="">
              <el-tag
                v-for="text in [
                  ...new Set(log.matches.map((m) => m.user_groups).flat()),
                ].sort()"
                :key="text"
                size="small"
                class="item"
              >
                📌 {{ text }}
              </el-tag>
              <el-tag
                v-for="text in [
                  ...new Set(log.matches.map((m) => m.selector)),
                ].sort()"
                :key="text"
                size="small"
                type="warning"
                class="item"
              >
                🏷️ {{ text }}
              </el-tag>
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
                ...(log.objtype !== 'r' ? ['members'] : []),
              ]"
              :clear="['members', 'geom']"
            />
            <LazyComponent
              v-if="log.base.geom || log.change.geom"
              style="border: 1px solid lightgrey"
            >
              <DiffMap
                :id="log.id"
                :objtype="log.objtype"
                :base-geom="log.base.geom"
                :change-geom="log.change.geom"
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
      return this.count(actions)
    },

    statSelectors() {
      const selectors = this.logs
        .map((log) => _.uniq(log.matches.map((m) => m.selector)))
        .flat(1)
      return this.count(selectors)
    },

    statUserGroups() {
      const userGroups = this.logs
        .map((log) => _.uniq(log.matches.map((m) => m.user_groups)))
        .flat(2)
      return this.count(userGroups)
    },
  },

  methods: {
    count(data: string[]): [string, number][] {
      return _.sortBy(
        Object.entries(
          _.pick(_.countBy(data), (value) => value > this.logs.length * 0.05)
        ) as [string, number][],
        ([_key, count]) => -count
      )
    },

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
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
