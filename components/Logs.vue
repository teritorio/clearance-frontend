<template>
  <div>
    <h3>{{ $t('logs.filters') }}</h3>
    <el-row style="margin-top: 20px">
      <el-badge :value="logs.length" class="item">
        <el-tag size="small">{{ $t('logs.objects') }}</el-tag>
      </el-badge>
      <el-badge
        v-for="[key, count] in stats"
        :key="key"
        :value="count"
        class="item"
      >
        <el-button
          type="danger"
          :plain="filterByAction != key"
          size="small"
          @click="filterByAction = filterByAction != key ? key : undefined"
        >
          {{ key }}
        </el-button>
      </el-badge>
    </el-row>
    <el-row>
      <el-badge
        v-for="[key, count] in statUserGroups"
        :key="key"
        :value="count"
        class="item"
      >
        <el-button
          type="primary"
          :plain="filterByUserGroups != key"
          size="small"
          @click="
            filterByUserGroups = filterByUserGroups != key ? key : undefined
          "
        >
          📌 {{ key }}
        </el-button>
      </el-badge>
    </el-row>
    <el-row>
      <el-badge
        v-for="[key, count] in statSelectors"
        :key="key"
        :value="count"
        class="item"
      >
        <el-button
          type="warning"
          :plain="filterBySelectors != key"
          size="small"
          @click="
            filterBySelectors = filterBySelectors != key ? key : undefined
          "
        >
          🏷️ {{ key }}
        </el-button>
      </el-badge>
    </el-row>

    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>

    <template v-for="log in logsWithFilter || []" :key="log.id">
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
            <span>
              <el-tag
                v-for="text in [
                  ...new Set(log.matches.map((m) => m.user_groups).flat()),
                ].sort()"
                :key="text"
                size="small"
                class="item"
                :effect="filterByUserGroups == text ? 'dark' : undefined"
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
                :effect="filterBySelectors == text ? 'dark' : undefined"
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

              <a
                class="el-button"
                target="_blank"
                :href="`https://pewu.github.io/osm-history/#/${objtypeFull(
                  log.objtype
                )}/${log.id}`"
                title="OSM History Viewer"
              >
                OSM H
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
                'deleted',
                'geom',
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
      <br />
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

  data(): {
    filterByAction?: string
    filterByUserGroups?: string
    filterBySelectors?: string
  } {
    return {
      filterByAction: undefined,
      filterByUserGroups: undefined,
      filterBySelectors: undefined,
    }
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
        .map((log) => _.uniq(log.matches.map((m) => m.user_groups).flat(2)))
        .flat(1)
      return this.count(userGroups)
    },

    logsWithFilter() {
      return this.logs.filter(
        (log) =>
          (this.filterByAction === undefined ||
            Object.values(log.diff_attribs || {})
              .concat(Object.values(log.diff_tags || {}))
              .some(
                (actions) =>
                  actions?.some(
                    (action) => action[0] === this.filterByAction
                  ) || false
              )) &&
          (this.filterByUserGroups === undefined ||
            log.matches.some((match) =>
              match.user_groups.includes(this.filterByUserGroups!)
            )) &&
          (this.filterBySelectors === undefined ||
            log.matches.some(
              (match) => match.selector === this.filterBySelectors
            ))
      )
    },
  },

  methods: {
    count(data: string[]): [string, number][] {
      return _.sortBy(
        Object.entries(_.countBy(data)) as [string, number][],
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
