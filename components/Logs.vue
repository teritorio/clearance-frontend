<script setup lang="ts">
import { intersection, uniq } from 'underscore'
import LogsComponent from '~/components/LogsComponent.vue'
import type { Log, ObjectId, User } from '~/libs/types'
import { setLogs } from '~/libs/types'

const props = defineProps<{
  projectSlug: string
}>()

const emit = defineEmits<{
  (e: 'removeLogs', objectIds: ObjectId[]): void
}>()

const logs = useState<Log[]>('logs')
const user = useState<User>('user')

const route = useRoute()
const logsWithFilter = computed(() => {
  return logs.value.filter((log) => {
    const changesetsUsers
      = route.query.filterByUsers !== undefined
      && uniq(
        (log.base ? log.changesets.slice(1) : log.changesets).map(
          (changeset) => changeset.user,
        ),
      )
    return (
      (route.query.filterByAction === undefined
      || Object.values(log.diff_attribs || {})
        .concat(Object.values(log.diff_tags || {}))
        .some(
          (actions) =>
            actions?.some(
              (action) => action[0] === route.query.filterByAction,
            ) || false,
        ))
        && (route.query.filterByUserGroups === undefined
        || log.matches.some((match) =>
          match.user_groups.includes(route.query.filterByUserGroups as string),
        ))
        && (route.query.filterBySelectors === undefined
        || log.matches.some((match) =>
          matchFilterBySelectors(match.selectors),
        ))
        && (route.query.filterByUsers === undefined
        || (changesetsUsers
        && changesetsUsers.length === 1
        && changesetsUsers[0] === route.query.filterByUsers))
        && (route.query.filterByDate === undefined
        || log.change.created.substring(0, 10) === route.query.filterByDate)
    )
  })
})

const isProjectUser = computed(() => {
  return !!user.value.projects?.includes(props.projectSlug)
})

function accept(objectIds: ObjectId[]) {
  setLogs(useRuntimeConfig().public.API, props.projectSlug, 'accept', objectIds)
    .then(() => emit('removeLogs', objectIds))
    .catch((error) => {
      /* eslint no-alert: 0 */
      alert(error)
    })
}

function accept_selection() {
  const objectIds = logsWithFilter.value.map((log) => ({
    objtype: log.objtype,
    id: log.id,
    version: log.change.version,
    deleted: log.change.deleted,
  }))
  accept(objectIds)
}

const router = useRouter()
function reset_filter() {
  router.replace({ ...route, query: undefined })
}

function validate_selection() {
  accept_selection()
  reset_filter()
}

const scrollCount = ref(10)
function scrollLoad() {
  scrollCount.value += 10
}

function matchFilterBySelectors(selectors: string[]): boolean {
  return !!(route.query.filterBySelectors && intersection(selectors, route.query.filterBySelectors?.toString()).length > 0)
}
</script>

<template>
  <div>
    <el-button-group v-if="isProjectUser && (Object.keys(route.query).length)">
      <el-button type="primary" @click="validate_selection">
        ✓ {{ $t('logs.validate_selection') }}
      </el-button>
    </el-button-group>

    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>

    <el-space v-infinite-scroll="scrollLoad" :fill="true" wrap :size="20">
      <LogsComponent
        v-for="log in (logsWithFilter || []).slice(0, scrollCount + 1)"
        :key="log.id"
        :log="log"
        :project="projectSlug"
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
