<script setup lang="ts">
import type { Geometry } from 'geojson'
import type { LoCha, Project } from '~/libs/types'
import { uniq } from 'underscore'

//
// Validators
//
definePageMeta({
  validate({ params }) {
    return /^[-\w:]+$/.test(params.project as string)
  },
})

//
// Composables
//
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const user = useUser()

//
// Data
//
const projectSlug = route.params.project as string

//
// Data Fetching
//
// TODO: Invalid cache key based on data refresh-timing (set on API-side)
const { data, status, refresh } = useAsyncData(
  `changes_logs-${projectSlug}`,
  async () => {
    try {
      const [project, loChas] = await Promise.all([
        $fetch<Project>(`${config.public.api}/projects/${projectSlug}`),
        $fetch<LoCha[]>(`${config.public.api}/projects/${projectSlug}/changes_logs`),
      ])

      return { project, loChas }
    }
    catch (err) {
      if (err instanceof Error) {
        ElMessage.error({
          duration: 0,
          message: err.message,
        })

        throw new Error(err.message)
      }
      else {
        throw new TypeError('Failed to fetch data')
      }
    }
  },
  {
    transform: ({ project, loChas }) => {
      return {
        project,
        loChas,
        logs: loChas.map((loCha) => loCha.objects).flat(),
      }
    },
  },
)

//
// Computed
//
const baseGeoms = computed(() => {
  if (!data.value?.logs) {
    return []
  }

  return data.value.logs
    .map((log) => log.base?.geom)
    .filter((geom): geom is Geometry => !!geom)
})

const changeGeoms = computed(() => {
  if (!data.value?.logs) {
    return []
  }

  return data.value.logs.map((log) => log.change.geom)
})

const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(projectSlug)
})

const loChasWithFilter = computed(() => {
  if (!data.value?.loChas.length) {
    return []
  }

  return data.value?.loChas.filter((loCha) =>
    loCha.objects.some((log) => {
      const changesetsUsers
      = route.query.filterByUsers !== undefined
      && uniq(
        (log.changesets ? log.base ? log.changesets.slice(1) : log.changesets : []).map(
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

//
// Methods
//

async function handleAccept(loChaIds?: number[]) {
  try {
    if (!loChaIds) {
      loChaIds = loChasWithFilter.value.map((loCha) => loCha.id)
    }

    try {
      await $fetch(`${config.public.api}/projects/${projectSlug}/changes_logs/accept`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loChaIds),
      })
      await refresh()

      if (!loChasWithFilter.value.length) {
        resetFilters()
      }
    }
    catch (err) {
      if (err instanceof Error) {
        ElMessage.error({
          duration: 0,
          message: err.message,
        })

        throw new Error(err.message)
      }
      else {
        throw new TypeError('Failed to fetch data')
      }
    }
  }
  catch (err: any) {
    ElMessage.error({
      duration: 0,
      message: err.message,
    })
  }
}

async function resetFilters() {
  await router.replace({ ...route, query: undefined })
}

function matchFilterBySelectors(selectors: string[]) {
  return route.query.filterBySelectors !== undefined && selectors.includes(route.query.filterBySelectors as string)
}
</script>

<template>
  <el-main
    v-loading.lock="status === 'pending'"
    element-loading-background="#FAFAFA"
    element-loading-text="Loading..."
  >
    <el-alert v-if="status === 'idle' && !data" title="No data available at the moment." type="warning" />
    <el-container v-if="data && status === 'success'" direction="vertical">
      <project-light :project="data.project" title-tag="h1" />
      <el-row>
        <diff-map
          :base-geom="baseGeoms"
          :change-geom="changeGeoms"
          style="resize: vertical"
        />
      </el-row>
      <log-filters :logs="data.logs" />
      <log-validator-bulk
        v-if="isProjectUser && Object.keys(route.query).length"
        @bulk-validation="handleAccept"
      />
      <h3>{{ $t('logs.data') }}</h3>
      <p>{{ $t('logs.data_details') }}</p>
      <ul>
        <li>{{ $t('logs.data_details_osm') }}</li>
        <li>{{ $t('logs.data_details_manual') }}</li>
      </ul>
      <lo-cha-list
        v-if="data.loChas.length"
        :project-slug="projectSlug"
        :lo-chas="loChasWithFilter"
        @accept="handleAccept([$event])"
      />
    </el-container>
  </el-main>
</template>

<style scope>
.el-main {
  overflow: initial;
}
</style>
