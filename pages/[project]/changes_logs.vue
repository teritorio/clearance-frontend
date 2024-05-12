<script setup lang="ts">
import type { Geometry } from 'geojson'
import { uniq } from 'underscore'
import type { LoCha, Log, ObjType, ObjectId, Project } from '~/libs/types'

definePageMeta({
  validate({ params }) {
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const route = useRoute()
const projectSlug = route.params.project as string
const project = ref<Project>()
const loChas = useLoChas()

try {
  const projectData = await useFetchWithCache<Project>(`project-${projectSlug}`, `${useRuntimeConfig().public.API}/projects/${projectSlug}`)
  project.value = projectData.value
}
catch (err: any) {
  ElMessage.error({
    duration: 0,
    message: err.message,
  })
}

try {
  const loChasData = await useFetchWithCache<LoCha[]>(`loChas-${projectSlug}`, `${useRuntimeConfig().public.API}/projects/${projectSlug}/changes_logs`)
  loChas.value = loChasData.value
}
catch (err: any) {
  ElMessage.error({
    duration: 0,
    message: err.message,
  })
}

const logs: Ref<Log[]> = computed(() => {
  if (!loChas.value) {
    return []
  }

  return loChas.value.map((loCha) => loCha.objects).flat()
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

const user = useUser()
const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(projectSlug)
})

const loChasWithFilter: Ref<LoCha[]> = computed(() => {
  if (!loChas.value.length) {
    return []
  }

  return (loChas.value as LoCha[]).filter((loCha) =>
    loCha.objects.some((log) => {
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
          || (changesetsUsers && changesetsUsers.includes(route.query.filterByUsers as string)))
          && (route.query.filterByDate === undefined
          || log.change.created.substring(0, 10) === route.query.filterByDate)
      )
    }),
  )
})

function removeLogs(objectIds: ObjectId[]) {
  loChas.value = (loChas.value as LoCha[]).map((loCha) => {
    loCha.objects = loCha.objects.filter(
      (log) =>
        objectIds.findIndex(
          (objectId) => log.objtype === objectId.objtype && log.id === objectId.id,
        ) === -1,
    )
    return loCha.objects.length > 0 ? loCha : undefined
  }).filter((loCha) => !!loCha) as LoCha[]
  project.value!.to_be_validated = logs.value?.length
}

function formatAcceptedLogs(identifier?: { id: number, objtype: ObjType }): ObjectId[] {
  if (identifier) {
    const log = logs.value.find((log) => log.id === identifier.id && log.objtype === identifier.objtype)

    if (!log) {
      throw createError({
        statusCode: 404,
        message: 'Accepted log not found',
      })
    }

    return [{
      objtype: log.objtype,
      id: log.id,
      version: log.change.version,
      deleted: log.change.deleted,
    }]
  }
  else {
    const logs = loChasWithFilter.value.map((loCha) => loCha.objects).flat().map((log) => ({
      objtype: log.objtype,
      id: log.id,
      version: log.change.version,
      deleted: log.change.deleted,
    }))

    if (!logs.length) {
      throw createError({
        statusCode: 404,
        message: 'Accepted logs not found',
      })
    }

    return logs
  }
}

async function handleAccept(identifier?: { id: number, objtype: ObjType }) {
  try {
    const objectIds = formatAcceptedLogs(identifier)
    await $fetch(
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

    if (!identifier || !loChasWithFilter.value.length) {
      resetFilters()
    }
  }
  catch (err: any) {
    ElMessage.error({
      duration: 0,
      message: err.message,
    })
  }
}

const router = useRouter()
async function resetFilters() {
  await router.replace({ ...route, query: undefined })
}

function matchFilterBySelectors(selectors: string[]) {
  return route.query.filterBySelectors !== undefined && selectors.includes(route.query.filterBySelectors as string)
}
</script>

<template>
  <el-main>
    <project-light v-if="project" :project="project" title-tag="h1" />
    <el-divider border-style="dotted" />
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
      @bulk-validation="handleAccept"
    />
    <h3>{{ $t('logs.data') }}</h3>
    <p>{{ $t('logs.data_details') }}</p>
    <ul>
      <li>{{ $t('logs.data_details_osm') }}</li>
      <li>{{ $t('logs.data_details_manual') }}</li>
    </ul>
    <lo-cha-list
      v-if="loChas?.length"
      :project-slug="projectSlug"
      :lo-chas="loChasWithFilter"
      @accept="handleAccept($event)"
    />
  </el-main>
</template>

<style scope>
.el-main {
  overflow: initial;
}
</style>
