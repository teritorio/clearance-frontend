<template>
  <div>
    <h3>{{ $t('logs.filters') }}</h3>
    <el-row style="margin-top: 20px">
      <el-badge :value="logs.length" class="item" :max="999">
        <el-tag size="small">{{ $t('logs.objects') }}</el-tag>
      </el-badge>
      <el-badge
        v-for="[key, count] in stats"
        :key="key"
        :value="count"
        class="item"
        :max="999"
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
        :max="999"
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
        :max="999"
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
    <el-row>
      <el-badge
        v-for="[key, count] in statUsers.slice(0, 20)"
        :key="key"
        :value="count"
        class="item"
        :max="999"
      >
        <el-button
          type="info"
          :plain="filterByUsers != key"
          size="small"
          @click="filterByUsers = filterByUsers != key ? key : undefined"
        >
          👤 {{ key }}
        </el-button>
      </el-badge>
      <span v-if="statUsers.length > 20">{{ $t('logs.tags_more') }}</span>
    </el-row>

    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>

    <el-space v-infinite-scroll="scroolLoad" :fill="true" wrap :size="20">
      <Log
        v-for="log in (logsWithFilter || []).slice(0, scroolCount + 1)"
        :key="log.id"
        :log="log"
        :project="project"
        :project-user="!!user?.projects?.includes(project)"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none"></iframe>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import _ from 'underscore'
import { User } from '~/libs/apiTypes'
import Log from '~/components/Log.vue'
import { Logs } from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

  components: {
    Log,
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
    filterByUsers?: string
    scroolCount: number
  } {
    return {
      filterByAction: undefined,
      filterByUserGroups: undefined,
      filterBySelectors: undefined,
      filterByUsers: undefined,
      scroolCount: 10,
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
        .map((log) => _.uniq(log.matches.map((m) => m.selectors)).flat())
        .flat(1)
      return this.count(selectors)
    },

    statUserGroups() {
      const userGroups = this.logs
        .map((log) => _.uniq(log.matches.map((m) => m.user_groups).flat(2)))
        .flat(1)
      return this.count(userGroups)
    },

    statUsers() {
      const users = this.logs
        .map((log) =>
          log.changesets.slice(1).map((changeset) => changeset.user)
        )
        .flat(2)
      return this.count(users)
    },

    logsWithFilter() {
      return this.logs.filter((log) => {
        const changesetsUsers =
          this.filterByUsers !== undefined &&
          _.uniq(log.changesets.slice(1).map((changeset) => changeset.user))
        return (
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
            log.matches.some((match) =>
              match.selectors.includes(this.filterBySelectors)
            )) &&
          (this.filterByUsers === undefined ||
            (changesetsUsers.length === 1 &&
              changesetsUsers[0] === this.filterByUsers))
        )
      })
    },
  },

  methods: {
    count(data: string[]): [string, number][] {
      return _.sortBy(
        Object.entries(_.countBy(data)) as [string, number][],
        ([_key, count]) => -count
      )
    },

    scroolLoad(): void {
      this.scroolCount += 10
    },
  },
})
</script>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>
