<script lang="ts">
import type { PropType } from 'vue'
import _ from 'underscore'
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
    scroolCount: number
  } {
    return {
      scroolCount: 10,
    }
  },

  setup() {
    const user = useState<User>('user')

    return { user }
  },

  emits: {
    removeLogs: (_objectIds: ObjectId[]) => true,
  },

  computed: {
    logsWithFilter() {
      return this.logs.filter((log) => {
        const changesetsUsers
          = this.$route.query.filterByUsers !== undefined
          && _.uniq(
            (log.base ? log.changesets.slice(1) : log.changesets).map(
              (changeset) => changeset.user,
            ),
          )
        return (
          (this.$route.query.filterByAction === undefined
          || Object.values(log.diff_attribs || {})
            .concat(Object.values(log.diff_tags || {}))
            .some(
              (actions) =>
                actions?.some(
                  (action) => action[0] === this.$route.query.filterByAction,
                ) || false,
            ))
            && (this.$route.query.filterByUserGroups === undefined
            || log.matches.some((match) =>
              match.user_groups.includes(this.$route.query.filterByUserGroups as string),
            ))
            && (this.$route.query.filterBySelectors === undefined
            || log.matches.some((match) =>
              this.matchFilterBySelectors(match.selectors),
            ))
            && (this.$route.query.filterByUsers === undefined
            || (changesetsUsers
            && changesetsUsers.length === 1
            && changesetsUsers[0] === this.$route.query.filterByUsers))
            && (this.$route.query.filterByDate === undefined
            || log.change.created.substring(0, 10) === this.$route.query.filterByDate)
        )
      })
    },

    isProjectUser(): boolean {
      return !!this.user?.projects?.includes(this.project)
    },
  },

  methods: {
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
      this.$router.replace({ ...this.$route, query: undefined })
    },

    validate_selection() {
      this.accept_selection()
      this.reset_filter()
    },

    scroolLoad(): void {
      this.scroolCount += 10
    },

    matchFilterBySelectors(selectors: string[]): boolean {
      return (
        this.$route.query.filterBySelectors !== undefined
        && _.intersection(selectors, this.$route.query.filterBySelectors as string).length > 0
      )
    },
  },
})
</script>

<template>
  <div>
    <el-button-group
      v-if="isProjectUser && Object.keys($route.query).length"
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
