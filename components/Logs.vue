<script lang="ts">
import type { PropType } from 'vue'
import _ from 'underscore'
import type { Geometry } from 'geojson'
import LogsComponent from '~/components/LogsComponent.vue'
import type { Log, ObjectId, User } from '~/libs/types'
import { setLogs } from '~/libs/types'

export default defineNuxtComponent({
  name: 'LogsComponent',

  components: {
    LogsComponent,
  },

  props: {
    project: {
      type: String,
      required: true,
    },
    logs: {
      type: Array as PropType<Log[]>,
      required: true,
    },
  },

  data(): {
    filterByAction?: string
    filterByUserGroups?: string
    filterBySelectors?: string[]
    filterByUsers?: string
    filterByDate?: string
    scroolCount: number
  } {
    return {
      filterByAction: this.$route.query.filterByAction as string | undefined,
      filterByUserGroups: this.$route.query.filterByUserGroups as
      | string
      | undefined,
      filterBySelectors: this.$route.query.filterBySelectors as
      | string[]
      | undefined,
      filterByUsers: this.$route.query.filterByUsers as string | undefined,
      filterByDate: this.$route.query.filterByDate as string | undefined,
      scroolCount: 10,
    }
  },

  setup() {
    const user = useState<User>('user')

    return { user }
  },

  watch: {
    filterByAction() {
      this.updateUrl()
    },
    filterByUserGroups() {
      this.updateUrl()
    },
    filterBySelectors() {
      this.updateUrl()
    },
    filterByUsers() {
      this.updateUrl()
    },
    filterByDate() {
      this.updateUrl()
    },
  },

  emits: {
    removeLogs: (_objectIds: ObjectId[]) => true,
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
              .map((action) => action[0]),
          ),
        )
        .flat(1)
      return this.count(actions)
    },

    statSelectors() {
      const matches = this.logs.map((log) => _.uniq(log.matches).flat()).flat(1)
      return this.count(matches, (m) => m.selectors.join(';'))
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
          (log.base ? log.changesets.slice(1) : log.changesets).map(
            (changeset) => changeset.user,
          ),
        )
        .flat(2)
      return this.count(users)
    },

    statDates() {
      const dates = this.logs.map((log) => log.change.created.substring(0, 10))
      return this.count(dates).sort()
    },

    logsWithFilter() {
      return this.logs.filter((log) => {
        const changesetsUsers
          = this.filterByUsers !== undefined
          && _.uniq(
            (log.base ? log.changesets.slice(1) : log.changesets).map(
              (changeset) => changeset.user,
            ),
          )
        return (
          (this.filterByAction === undefined
          || Object.values(log.diff_attribs || {})
            .concat(Object.values(log.diff_tags || {}))
            .some(
              (actions) =>
                actions?.some(
                  (action) => action[0] === this.filterByAction,
                ) || false,
            ))
            && (this.filterByUserGroups === undefined
            || log.matches.some((match) =>
              match.user_groups.includes(this.filterByUserGroups!),
            ))
            && (this.filterBySelectors === undefined
            || log.matches.some((match) =>
              this.matchFilterBySelectors(match.selectors),
            ))
            && (this.filterByUsers === undefined
            || (changesetsUsers
            && changesetsUsers.length === 1
            && changesetsUsers[0] === this.filterByUsers))
            && (this.filterByDate === undefined
            || log.change.created.substring(0, 10) === this.filterByDate)
        )
      })
    },

    isProjectUser(): boolean {
      return !!this.user?.projects?.includes(this.project)
    },

    baseGeoms(): Geometry[] {
      return this.logs
        .map((log) => log.base?.geom)
        .filter((geom): geom is Geometry => !!geom)
    },

    changeGeoms(): Geometry[] {
      return this.logs.map((log) => log.change.geom)
    },
  },

  methods: {
    count<Type>(
      data: Type[],
      key: (o: Type) => string = (i) => `${i}`,
    ): [Type, number][] {
      const index = _.indexBy(data, key)
      return _.sortBy(
        Object.entries(_.countBy(data, key)) as [string, number][],
        ([_key, count]) => -count,
      ).map(([key, count]) => [index[key], count])
    },

    accept(objectIds: ObjectId[]) {
      setLogs(useRuntimeConfig().public.API, this.project, 'accept', objectIds)
        .then(() => this.$emit('removeLogs', objectIds))
        .catch((error) => {
          /* eslint no-alert: 0 */
          alert(error)
        })
    },

    accept_selection() {
      const objectIds = this.logsWithFilter.map((log) => ({
        objtype: log.objtype,
        id: log.id,
        version: log.change.version,
        deleted: log.change.deleted,
      }))
      this.accept(objectIds)
    },

    reset_filter() {
      this.filterByAction = undefined
      this.filterByUserGroups = undefined
      this.filterBySelectors = undefined
      this.filterByUsers = undefined
      this.filterByDate = undefined
    },

    validate_selection() {
      this.accept_selection()
      this.reset_filter()
    },

    scroolLoad(): void {
      this.scroolCount += 10
    },

    updateUrl(): void {
      this.$router.replace({
        name: this.$route.name || undefined,
        query: {
          ...this.$route.query,
          filterByAction: this.filterByAction,
          filterByUserGroups: this.filterByUserGroups,
          filterBySelectors: this.filterBySelectors,
          filterByUsers: this.filterByUsers,
          filterByDate: this.filterByDate,
        },
      })
    },

    matchFilterBySelectors(selectors: string[]): boolean {
      return (
        this.filterBySelectors !== undefined
        && _.intersection(selectors, this.filterBySelectors).length > 0
      )
    },
  },
})
</script>

<template>
  <div>
    <el-row>
      <DiffMap
        :base-geom="baseGeoms"
        :change-geom="changeGeoms"
        style="resize: vertical"
      />
    </el-row>
    <h3>{{ $t('logs.filters') }}</h3>
    <el-row style="margin-top: 20px">
      <el-badge :value="logs.length" class="item" :max="999">
        <el-tag size="small">
          {{ $t('logs.objects') }}
        </el-tag>
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
          :plain="filterByAction !== key"
          :disabled="(filterByAction && filterByAction !== key) || false"
          size="small"
          @click="filterByAction = filterByAction !== key ? key : undefined"
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
          :plain="filterByUserGroups !== key"
          :disabled="(filterByUserGroups && filterByUserGroups !== key) || false"
          size="small"
          @click="
            filterByUserGroups = filterByUserGroups !== key ? key : undefined
          "
        >
          📌 {{ key }}
        </el-button>
      </el-badge>
    </el-row>
    <el-row>
      <el-badge
        v-for="[match, count] in statSelectors"
        :key="match.selectors.join(';')"
        :value="count"
        class="item"
        :max="999"
      >
        <el-button
          type="warning"
          :plain="filterBySelectors !== match.selectors"
          :disabled="
            (filterBySelectors && !matchFilterBySelectors(match.selectors))
              || false
          "
          size="small"
          @click="
            filterBySelectors = !matchFilterBySelectors(match.selectors)
              ? match.selectors
              : undefined
          "
        >
          🏷️ {{ $i18nHash(match.name) || match.selectors.join(' ') }}
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
          :plain="filterByUsers !== key"
          :disabled="(filterByUsers && filterByUsers !== key) || false"
          size="small"
          @click="filterByUsers = filterByUsers !== key ? key : undefined"
        >
          👤 {{ key }}
        </el-button>
      </el-badge>
      <span v-if="statUsers.length > 20">{{ $t('logs.tags_more') }}</span>
    </el-row>
    <el-row>
      <el-badge
        v-for="[key, count] in statDates"
        :key="key"
        :value="count"
        class="item"
        :max="999"
      >
        <el-button
          type="primary"
          :plain="filterByDate !== key"
          :disabled="(filterByDate && filterByDate !== key) || false"
          size="small"
          @click="filterByDate = filterByDate !== key ? key : undefined"
        >
          📅 {{ key }}
        </el-button>
      </el-badge>
    </el-row>

    <el-button-group
      v-if="
        isProjectUser
          && (filterByAction
            || filterByUserGroups
            || filterBySelectors
            || filterByUsers
            || filterByDate)
      "
    >
      <el-button type="primary" @click="validate_selection()">
        ✓ {{ $t('logs.validate_selection') }}
      </el-button>
    </el-button-group>

    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>

    <el-space v-infinite-scroll="scroolLoad" :fill="true" wrap :size="20">
      <LogsComponent
        v-for="log in (logsWithFilter || []).slice(0, scroolCount + 1)"
        :key="log.id"
        :log="log"
        :project="project"
        :project-user="isProjectUser"
        @accept="accept([$event])"
      />
    </el-space>

    <iframe name="hidden_josm_target" style="display: none" />
  </div>
</template>

<style scoped>
.item {
  margin-top: 0.7em;
  margin-right: 1.3em;
}
</style>
