<script setup lang="ts">
import { intersection, uniq } from 'underscore'
import type { Log, ObjectId, User } from '~/libs/types'
import { setLogs } from '~/libs/types'

const props = defineProps<{
  project: string
  logs: Log[]
}>()

const emit = defineEmits<{
  (e: 'removeLogs', objectIds: ObjectId[]): void
}>()

const route = useRoute()
const filterByAction = ref<string | undefined>(route.query.filterByAction as string)
const filterByUserGroups = ref<string | undefined>(route.query.filterByUserGroups as string)
const filterBySelectors = ref<string[] | undefined>(route.query.filterByUserGroups as string[])
const filterByUsers = ref<string | undefined>(route.query.filterByUsers as string)
const filterByDate = ref<string | undefined>(route.query.filterByDate as string)
const scroolCount = ref<number>(10)

const logsWithFilter = computed(() => {
  return props.logs.filter((log) => {
    const changesetsUsers
      = filterByUsers.value !== undefined
      && uniq(
        (log.base ? log.changesets.slice(1) : log.changesets).map(
          (changeset) => changeset.user,
        ),
      )
    return (
      (filterByAction.value === undefined
      || Object.values(log.diff_attribs || {})
        .concat(Object.values(log.diff_tags || {}))
        .some(
          (actions) =>
            actions?.some(
              (action) => action[0] === filterByAction.value,
            ) || false,
        ))
        && (filterByUserGroups.value === undefined
        || log.matches.some((match) =>
          match.user_groups.includes(filterByUserGroups.value!),
        ))
        && (filterBySelectors.value === undefined
        || log.matches.some((match) =>
          matchFilterBySelectors(match.selectors),
        ))
        && (filterByUsers.value === undefined
        || (changesetsUsers
        && changesetsUsers.length === 1
        && changesetsUsers[0] === filterByUsers.value))
        && (filterByDate.value === undefined
        || log.change.created.substring(0, 10) === filterByDate.value)
    )
  })
})

const user = useState<User>('user')
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(props.project)
})

function accept(objectIds: ObjectId[]) {
  setLogs(useRuntimeConfig().public.API, props.project, 'accept', objectIds)
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

function reset_filter() {
  filterByAction.value = undefined
  filterByUserGroups.value = undefined
  filterBySelectors.value = undefined
  filterByUsers.value = undefined
  filterByDate.value = undefined
}

function validate_selection() {
  accept_selection()
  reset_filter()
}

function scroolLoad() {
  scroolCount.value += 10
}

function matchFilterBySelectors(selectors: string[]) {
  return (
    filterBySelectors.value !== undefined
    && intersection(selectors, filterBySelectors.value).length > 0
  )
}
</script>

<template>
  <div>
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
      <log-item
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
