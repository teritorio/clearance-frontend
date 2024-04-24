<script setup lang="ts">
import { intersection, uniq } from 'underscore'
import type { Geometry } from 'geojson'
import type { Log, ObjectId, Project, User } from '~/libs/types'

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

const logsFiltered = computed(() => {
  if (!logs.value?.length) {
    return []
  }

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
  if (!user.value) {
    return false
  }
  return !!user.value.projects?.includes(projectSlug)
})

function matchFilterBySelectors(selectors: string[]): boolean {
  return !!(route.query.filterBySelectors && intersection(selectors, route.query.filterBySelectors?.toString()).length > 0)
}

function removeLogs(objectIds: ObjectId[]) {
  logs.value = logs.value?.filter(
    (log) =>
      objectIds.findIndex(
        (objectId) => log.objtype === objectId.objtype && log.id === objectId.id,
      ) === -1,
  )
}

async function validate(objectIds: ObjectId[]) {
  try {
    await useFetchWithCache(
      'accept',
      `${useRuntimeConfig().public.API}/projects/${projectSlug}/changes_logs/accept`,
      {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(objectIds),
      },
    )
    removeLogs(objectIds)
  }
  catch (err: any) {
    ElMessage.error(err.message)
  }
}

const router = useRouter()
async function handleBulkValidation() {
  if (!logs.value) {
    return
  }

  const objectIds = logs.value.map((log) => ({
    objtype: log.objtype,
    id: log.id,
    version: log.change.version,
    deleted: log.change.deleted,
  }))

  validate(objectIds)

  await router.replace({ ...route, query: undefined })
}
</script>

<template>
  <el-main>
    <!-- TODO: Improve this component for reuse -->
    <project-light v-if="project" :project="project" />
    <!-- TODO: Create a component -->
    <el-row>
      <diff-map
        :base-geom="baseGeoms"
        :change-geom="changeGeoms"
        style="resize: vertical"
      />
    </el-row>
    <log-filters />
    <log-validator-bulk
      v-if="isProjectUser && (Object.keys(route.query).length)"
      @bulk-validation="handleBulkValidation"
    />
    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>
    <log-list
      v-if="logs?.length"
      :logs="logsFiltered"
      :project-slug="projectSlug"
      @validate="validate"
    />
    <iframe name="hidden_josm_target" style="display: none" />
  </el-main>
</template>

<style scope>
.el-main {
  overflow: initial;
}
</style>
