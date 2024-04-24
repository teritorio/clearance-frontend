<script setup lang="ts">
import type { Geometry } from 'geojson'
import { intersection, uniq } from 'underscore'
import type { Log, ObjectId, Project, User } from '~/libs/types'
import { setLogs } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-_:a-zA-Z0-9]+$/.test(params.project as string)
  },
})

const route = useRoute()
const projectSlug = route.params.project as string
const project = ref<Project>()
const logs = ref<Log[]>()

try {
  const projectData = await useFetchWithCache<Project>(`project-${projectSlug}`, `${useRuntimeConfig().public.API}/projects/${projectSlug}`)
  project.value = projectData.value
  useState<Project>('project', () => projectData.value)
}
catch (err: any) {
  ElMessage.error(err.message)
}

try {
  const logsData = await useFetchWithCache<Log[]>(`logs-${projectSlug}`, `${useRuntimeConfig().public.API}/projects/${projectSlug}/changes_logs`)
  logs.value = logsData.value
  useState<Log[]>('logs', () => logsData.value)
}
catch (err: any) {
  ElMessage.error(err.message)
}

const baseGeoms = computed(() => {
  if (!logs.value) {
    return []
  }

  return logs.value
    .map((log) => log.base?.geom)
    .filter((geom): geom is Geometry => !!geom)
})

const changeGeoms = computed(() => {
  if (!logs.value) {
    return []
  }

  return logs.value.map((log) => log.change.geom)
})

const user = useState<User>('user')
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(projectSlug)
})

const filterByAction = ref<string | undefined>(route.query.filterByAction as string)
const filterByUserGroups = ref<string | undefined>(route.query.filterByUserGroups as string)
const filterBySelectors = ref<string[] | undefined>(route.query.filterByUserGroups as string[])
const filterByUsers = ref<string | undefined>(route.query.filterByUsers as string)
const filterByDate = ref<string | undefined>(route.query.filterByDate as string)

const logsWithFilter = computed(() => {
  if (!logs.value?.length) {
    return []
  }

  return logs.value.filter((log) => {
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

function removeLogs(objectIds: ObjectId[]) {
  logs.value = logs.value?.filter(
    (log) =>
      objectIds.findIndex(
        (objectId) => log.objtype === objectId.objtype && log.id === objectId.id,
      ) === -1,
  )
}

const router = useRouter()
async function reset_filter() {
  await router.replace({ ...route, query: undefined })
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

async function handleBulkValidation() {
  accept_selection()
  reset_filter()
}

function accept(objectIds: ObjectId[]) {
  setLogs(useRuntimeConfig().public.API, projectSlug, 'accept', objectIds)
    .then(() => removeLogs(objectIds))
    .catch((error) => {
      /* eslint no-alert: 0 */
      alert(error)
    })
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
    <project-light v-if="project" :project="project" />
    <el-row>
      <diff-map
        :base-geom="baseGeoms"
        :change-geom="changeGeoms"
        style="resize: vertical"
      />
    </el-row>
    <log-filters />
    <log-validator-bulk
      v-if="isProjectUser && (filterByAction || filterByUserGroups || filterBySelectors || filterByUsers || filterByDate)"
      @bulk-validation="handleBulkValidation"
    />
    <log-list
      v-if="logs?.length"
      :project="projectSlug"
      :logs="logsWithFilter"
      @remove-logs="removeLogs($event)"
    />
  </div>
</template>
