<script setup lang="ts">
import type { Action } from '@teritorio/openstreetmap-logical-history-component'
import type { Geometry } from 'geojson'
import type { ClearanceApiLink, ClearanceLoChaData, ClearanceMatch } from '~/composables/useChangesLogs'
import { LoCha } from '@teritorio/openstreetmap-logical-history-component'
import { uniq } from 'underscore'

definePageMeta({
  validate({ params }) {
    // eslint-disable-next-line e18e/prefer-static-regex -- definePageMeta is a compiler macro, cannot reference outer scope
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const BATCH_SIZE = 3
const LOCHA_HASH_PATTERN = /^#locha-(-?\d+)-group-/

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

function getAllLinks(loCha: ClearanceLoChaData): ClearanceApiLink[] {
  return loCha.metadata.links.flat()
}

function uniqMatches(links: ClearanceApiLink[]): ClearanceMatch[] {
  const seen = new Set<string>()
  return links.flatMap((link) => link.matches).filter((match) => {
    const key = match.selectors.join(';')
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

const loChasWithFilter = computed(() => {
  if (!data.value?.loChas.length) {
    return []
  }

  return data.value.loChas.filter((loCha: ClearanceLoChaData) => {
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

const sentinelRef = useTemplateRef<HTMLElement>('sentinel')
let loading = false

function visibleCountForHash(loChas: ClearanceLoChaData[]): number {
  if (!route.hash) {
    return BATCH_SIZE
  }
  const match = route.hash.match(LOCHA_HASH_PATTERN)
  if (!match) {
    return BATCH_SIZE
  }
  const loChaId = Number(match[1])
  const index = loChas.findIndex(
    (l: ClearanceLoChaData) => l.metadata.locha_id === loChaId,
  )
  if (index === -1) {
    return BATCH_SIZE
  }
  return Math.max(BATCH_SIZE, index + 1)
}

const visibleCount = ref(BATCH_SIZE)

watch(loChasWithFilter, (loChas) => {
  visibleCount.value = visibleCountForHash(loChas)
})

const visibleLoChas = computed(() => {
  return loChasWithFilter.value.slice(0, visibleCount.value)
})

const hasMore = computed(() => {
  return visibleCount.value < loChasWithFilter.value.length
})

function loadMore() {
  if (loading || !hasMore.value) {
    return
  }
  loading = true
  requestAnimationFrame(() => {
    visibleCount.value += BATCH_SIZE
    loading = false
  })
}

let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      loadMore()
    }
  })

  watch(sentinelRef, (el) => {
    observer!.disconnect()
    if (el) {
      observer!.observe(el)
    }
  }, { immediate: true })
})

onUnmounted(() => {
  observer?.disconnect()
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
      loChaIds = loChasWithFilter.value.map((loCha: ClearanceLoChaData) => loCha.metadata.locha_id)
    }

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
  catch (err: any) {
    ElMessage.error({
      duration: 5000,
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
            v-for="loCha in visibleLoChas"
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
            <LoCha :id="String(loCha.metadata.locha_id)" :data="loCha" :map-style-url="config.public.mapStyleUrl as string" :hash="route.hash">
              <template #tags-diff="{ title, date, diff, dst, src }">
                <div v-if="title || (dst?.is_after && src)" class="locha-infos">
                  <span v-if="title" class="locha-title">🔗 {{ title }}</span>
                  <span v-if="dst?.is_after && src" class="locha-date">📅 {{ date }}</span>
                </div>
                <tags-diff
                  v-if="!dst?.deleted"
                  :diff="diff"
                  :src="src"
                  :dst="dst"
                />
              </template>
              <template #link-metadata="{ links }">
                <el-tag
                  v-for="userGroup in uniq((links as ClearanceApiLink[]).flatMap((link) => link.matches.flatMap((m: ClearanceMatch) => m.user_groups)))"
                  :key="userGroup"
                  size="small"
                  class="match-tag"
                >
                  📌 {{ userGroup }}
                </el-tag>
                <el-tag
                  v-for="match in uniqMatches(links as ClearanceApiLink[])"
                  :key="match.selectors.join(';')"
                  size="small"
                  type="warning"
                  class="match-tag"
                >
                  🏷️ {{ match.selectors.join(' ') }}
                </el-tag>
              </template>
            </LoCha>
          </el-card>
        </el-space>
        <div v-if="hasMore" ref="sentinel" class="sentinel" />
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

.link-metadata {
  text-align: center;
}

.locha-object h3,
.locha-object p {
  margin: 0;
}

.locha-infos {
  display: flex;
  gap: 0.5rem;
}

.locha-title,
.locha-date {
  font-size: 12px;
  color: grey;
}

.sentinel {
  min-height: 1px;
}
</style>
