<script setup lang="ts">
import type { Action } from '@teritorio/openstreetmap-logical-history-component'
import type { Geometry } from 'geojson'
import type { ClearanceApiLink, ClearanceApiResponse } from '~/composables/useChangesLogs'
import { LoCha } from '@teritorio/openstreetmap-logical-history-component'
import { uniq } from 'underscore'

definePageMeta({
  validate({ params }) {
    // eslint-disable-next-line e18e/prefer-static-regex -- definePageMeta is a compiler macro, cannot reference outer scope
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const router = useRouter()
const route = useRoute()
const projectSlug = route.params.project as string
const config = useRuntimeConfig()
const user = useUser()
const { data, status, refresh } = useChangesLogs(projectSlug)

const baseGeoms = computed(() => {
  if (!data.value?.loChas) {
    return []
  }

  return data.value.loChas
    .flatMap((loCha) => loCha.features)
    .filter((f) => f.properties.is_before)
    .map((f) => f.geometry)
    .filter((geom): geom is Geometry => !!geom)
})

const changeGeoms = computed(() => {
  if (!data.value?.loChas) {
    return []
  }

  return data.value.loChas
    .flatMap((loCha) => loCha.features)
    .filter((f) => !f.properties.is_before)
    .map((f) => f.geometry)
    .filter((geom): geom is Geometry => !!geom)
})

const isProjectUser = computed(() => {
  return !!user.value?.projects?.includes(projectSlug)
})

function getAllLinks(loCha: ClearanceApiResponse): ClearanceApiLink[] {
  return loCha.metadata.links.flat()
}

const loChasWithFilter = computed(() => {
  if (!data.value?.loChas.length) {
    return []
  }

  return data.value.loChas.filter((loCha: ClearanceApiResponse) => {
    const links = getAllLinks(loCha)

    return links.some((link: ClearanceApiLink) => {
      const changesetsUsers
        = route.query.filterByUsers !== undefined
          && uniq(loCha.metadata.changesets.map((changeset) => changeset.user))

      return (
        (route.query.filterByAction === undefined
          || [
            ...Object.values(link.diff_attribs || {}),
            ...Object.values(link.diff_tags || {}),
          ].some(
            (actions: Action[]) =>
              actions?.some(
                (action: Action) => action[0] === route.query.filterByAction,
              ) || false,
          ))
          && (route.query.filterByUserGroups === undefined
            || link.matches.some((match) =>
              match.user_groups.includes(route.query.filterByUserGroups as string),
            ))
            && (route.query.filterBySelectors === undefined
              || link.matches.some((match) =>
                matchFilterBySelectors(match.selectors),
              ))
              && (route.query.filterByUsers === undefined
                || (changesetsUsers && changesetsUsers.includes(route.query.filterByUsers as string)))
              && (route.query.filterByDate === undefined
                || loCha.features.some((f) =>
                  !f.properties.is_before && f.properties.created?.substring(0, 10) === route.query.filterByDate,
                ))
      )
    })
  })
})

const atomUrl = computed(() => `${config.public.api}/projects/${projectSlug}/changes_logs.atom`)

useHead({
  link: [
    {
      rel: 'alternate',
      type: 'application/atom+xml',
      href: atomUrl.value,
    },
  ],
})

async function handleAccept(loChaIds?: number[]) {
  try {
    if (!loChaIds) {
      loChaIds = loChasWithFilter.value.map((loCha: ClearanceApiResponse) => loCha.metadata.locha_id)
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
    :element-loading-text="$t('common.loading')"
  >
    <el-alert v-if="status === 'idle' && !data" :title="$t('logs.no_data')" type="warning" />
    <el-container v-if="data && status === 'success'" direction="vertical">
      <project-light :project="data.project" title-tag="h1" />
      <el-row>
        <diff-map
          :base-geom="baseGeoms"
          :change-geom="changeGeoms"
          style="resize: vertical"
        />
      </el-row>
      <log-filters :lo-chas="data.loChas" />
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
      <template v-if="loChasWithFilter.length">
        <el-space fill :size="20">
          <el-card
            v-for="loCha in loChasWithFilter"
            :key="loCha.metadata.locha_id"
            style="--el-card-bg-color: #FAFAFA;"
          >
            <template v-if="isProjectUser" #header>
              <div class="card-header">
                <el-button-group>
                  <el-button type="primary" @click="handleAccept([loCha.metadata.locha_id])">
                    ✓
                  </el-button>
                </el-button-group>
              </div>
            </template>
            <LoCha :data="loCha" />
          </el-card>
        </el-space>
      </template>
      <el-empty
        v-else-if="data.loChas.length"
        :description="$t('logs.no_results')"
      />
      <el-empty
        v-else
        :description="$t('logs.no_data')"
      />
    </el-container>
  </el-main>
</template>

<style scope>
.el-main {
  overflow: initial;
}

.card-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
