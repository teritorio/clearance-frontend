<script setup lang="ts">
import type { Action, IFeature } from '@teritorio/openstreetmap-logical-history-component'
import type { Geometry } from 'geojson'
import type { ClearanceApiLink, ClearanceLoChaData, ClearanceMatch } from '~/composables/useChangesLogs'
import { LoCha } from '@teritorio/openstreetmap-logical-history-component'
import { uniq } from 'underscore'
import { getAfterDates, getAfterUsers } from '~/composables/useChangesLogs'

definePageMeta({
  validate({ params }) {
    // eslint-disable-next-line e18e/prefer-static-regex -- definePageMeta is a compiler macro, cannot reference outer scope
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const BATCH_SIZE = 3
const LOCHA_HASH_PATTERN = /^#locha-(-?\d+)-group-/

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const projectSlug = route.params.project as string
const config = useRuntimeConfig()
const user = useUser()
const { data, status } = useChangesLogs(projectSlug)
const pendingAcceptIds = ref(new Set<number>())
const pendingAcceptGroupKeys = ref(new Set<string>())

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

function getFeatureLinks(loCha: ClearanceLoChaData, feature: IFeature, groupIndex: number): ClearanceApiLink[] {
  const links = loCha.metadata.links[groupIndex] as ClearanceApiLink[]
  if (feature.properties.is_before) {
    const link = links.find((l) => l.before === feature.id || l.after === feature.id)
    return link ? [link] : []
  }
  return links.filter((l) => l.before === feature.id || l.after === feature.id)
}

function getBeforeFeature(loCha: ClearanceLoChaData, link: ClearanceApiLink): IFeature | undefined {
  return loCha.features.find((f) => f.id === link.before) as IFeature | undefined
}

function getRapprochementsCount(loCha: ClearanceLoChaData): number {
  return loCha.metadata.links.length
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
    if (route.query.filterByUsers !== undefined
      && !getAfterUsers(loCha).includes(route.query.filterByUsers as string)) {
      return false
    }
    if (route.query.filterByDate !== undefined
      && !getAfterDates(loCha).includes(route.query.filterByDate as string)) {
      return false
    }
    return loCha.metadata.links.flat().some((link: ClearanceApiLink) =>
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
            )),
    )
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
  if (!loChaIds) {
    loChaIds = loChasWithFilter.value.map((loCha: ClearanceLoChaData) => loCha.metadata.locha_id)
  }

  loChaIds.forEach((id) => pendingAcceptIds.value.add(id))

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

    if (data.value) {
      data.value.loChas = data.value.loChas.filter(
        (loCha) => !loChaIds!.includes(loCha.metadata.locha_id),
      )
    }

    ElMessage.success({
      duration: 3000,
      message: t('logs.accept_success'),
    })

    if (!loChasWithFilter.value.length) {
      resetFilters()
    }
  }
  catch {
    loChaIds.forEach((id) => pendingAcceptIds.value.delete(id))
    ElMessage.error({
      duration: 5000,
      message: t('logs.accept_error'),
    })
  }
}

async function handleAcceptGroup(loCha: ClearanceLoChaData, groupIndex: number) {
  const loChaId = loCha.metadata.locha_id
  const key = `${loChaId}-${groupIndex}`
  pendingAcceptGroupKeys.value.add(key)

  try {
    await $fetch(`${config.public.api}/projects/${projectSlug}/changes_logs/${loChaId}/${groupIndex}/accept`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
    })

    if (data.value) {
      const locha = data.value.loChas.find((l) => l.metadata.locha_id === loChaId)
      if (locha) {
        locha.metadata.links.splice(groupIndex, 1)
        locha.features = locha.features
          .filter((f) => f.properties.links !== groupIndex)
          .map((f) => ({
            ...f,
            properties: {
              ...f.properties,
              links: (f.properties.links as number) > groupIndex
                ? (f.properties.links as number) - 1
                : f.properties.links,
            },
          }))
        if (locha.metadata.links.length === 0) {
          data.value.loChas = data.value.loChas.filter((l) => l.metadata.locha_id !== loChaId)
        }
      }
    }

    ElMessage.success({
      duration: 3000,
      message: t('logs.accept_success'),
    })

    if (!loChasWithFilter.value.length) {
      resetFilters()
    }
  }
  catch {
    ElMessage.error({
      duration: 5000,
      message: t('logs.accept_error'),
    })
  }
  finally {
    pendingAcceptGroupKeys.value.delete(key)
  }
}

async function resetFilters() {
  await router.replace({ ...route, query: undefined })
}

function matchFilterBySelectors(selectors: string[]) {
  return route.query.filterBySelectors !== undefined && selectors.includes(route.query.filterBySelectors as string)
}

function getGroupChangesets(loCha: ClearanceLoChaData, groupIndex: number) {
  const changesetIds = new Set(
    loCha.features
      .filter((f) => f.properties.links === groupIndex)
      .map((f) => f.properties.changeset_id),
  )
  return (loCha.metadata.changesets ?? []).filter((c) => changesetIds.has(c.id))
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
            class="locha-card"
            :class="{ 'locha-card--pending': pendingAcceptIds.has(loCha.metadata.locha_id) }"
            style="--el-card-padding: 0;"
          >
            <template v-if="getRapprochementsCount(loCha) > 1" #header>
              <div class="card-header">
                <el-button-group v-if="isProjectUser">
                  <el-button type="primary" @click="handleAccept([loCha.metadata.locha_id])">
                    ✓ {{ $t('logs.validate_locha') }}
                  </el-button>
                </el-button-group>
                <strong class="object-count">
                  {{ $t('logs.rapprochements_count', { n: getRapprochementsCount(loCha) }) }}
                </strong>
              </div>
            </template>
            <LoCha :id="String(loCha.metadata.locha_id)" :data="loCha" :map-style-url="config.public.mapStyleUrl as string" :hash="route.hash">
              <template v-if="isProjectUser" #header-start-end="{ index: groupIndex }">
                <el-button-group>
                  <el-button
                    type="primary"
                    :loading="pendingAcceptGroupKeys.has(`${loCha.metadata.locha_id}-${groupIndex}`)"
                    @click="handleAcceptGroup(loCha, groupIndex)"
                  >
                    ✓
                  </el-button>
                </el-button-group>
              </template>
              <template #object-detail="{ feature, index: groupIndex }">
                <template v-for="(link, i) in getFeatureLinks(loCha, feature, groupIndex)" :key="i">
                  <template v-if="feature.properties.is_after">
                    <template v-for="(before, _) in [getBeforeFeature(loCha, link)]" :key="_">
                      <div v-if="link.diff_attribs && Object.keys(link.diff_attribs).length" class="diff-section diff-section--centered diff-section--attribs">
                        <AttribsDiff :diff="link.diff_attribs" />
                      </div>
                      <div class="diff-section">
                        <TagsDiff
                          v-if="!feature.properties.deleted"
                          :diff="link.diff_tags"
                          :src="before?.properties"
                          :dst="feature.properties"
                        />
                      </div>
                    </template>
                  </template>
                  <template v-else-if="feature.properties.is_new">
                    <TagsDiff
                      :diff="link.diff_tags"
                      :dst="feature.properties"
                    />
                  </template>
                  <template v-else>
                    <TagsDiff
                      :src="feature.properties"
                    />
                  </template>
                </template>
              </template>
              <template #content-start="{ index: groupIndex }">
                <Changesets
                  v-if="getGroupChangesets(loCha, groupIndex).length"
                  :changesets="getGroupChangesets(loCha, groupIndex)"
                />
              </template>
              <template #header-center="{ index: groupIndex }">
                <el-tag
                  v-for="userGroup in uniq((loCha.metadata.links[groupIndex] as ClearanceApiLink[]).flatMap((link) => link.matches.flatMap((m: ClearanceMatch) => m.user_groups)))"
                  :key="userGroup"
                  size="small"
                  class="match-tag"
                >
                  📌 {{ useI18nHash(data?.project.user_groups[userGroup]?.title) ?? userGroup }}
                </el-tag>
                <el-tag
                  v-for="match in uniqMatches(loCha.metadata.links[groupIndex] as ClearanceApiLink[])"
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

<style scoped>
.el-main {
  overflow: initial;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
}

:deep(.header-center) {
  text-align: center;
}

:deep(.group-header .header-center .el-tag) {
  transition: none !important;
  animation: none !important;
  font-size: 16px;
}

:deep(.locha-object h3),
:deep(.locha-object p) {
  margin: 0;
}

.locha-card {
  --el-card-bg-color: #e0e0e4;
}

.locha-card--pending {
  opacity: 0.4;
  pointer-events: none;
}

.locha-card :deep(.locha) {
  padding-top: 0;
}

.sentinel {
  min-height: 1px;
}

.diff-section {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e4e7ed;
}

.diff-section--centered {
  text-align: center;
}

.diff-section--attribs {
  background-color: #fef3c7;
  border-radius: 4px;
  padding: 0.5rem;
  border-top: none;
}
</style>
