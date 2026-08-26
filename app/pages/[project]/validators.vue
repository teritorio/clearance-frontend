<script setup lang="ts">
import type {
  InitializedProject,
  UserGroup,
  Validators as ValidatorsType,
} from '~/libs/types'
import dayjs from 'dayjs'
import en from 'dayjs/locale/en-gb'
import es from 'dayjs/locale/es'
import fr from 'dayjs/locale/fr'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  getAsyncDataOrThrows,
  setAsyncRef,
} from '~/libs/getAsyncData'
import {
  getProject,
  getValidators,
} from '~/libs/types'

dayjs.extend(relativeTime)
const _dayjsLocales = { en, fr, es }

definePageMeta({
  validate({ params }) {
    // eslint-disable-next-line e18e/prefer-static-regex -- definePageMeta is a compiler macro, cannot reference outer scope
    return /^[-\w:]+$/.test(params.project as string)
  },
})

const { locale } = useI18n()
const route = useRoute()
const projectSlug = route.params.project as string
const projectDetails = ref<InitializedProject>()
const validators = ref<ValidatorsType>()
const config = useRuntimeConfig()

getAsyncDataOrThrows('fetchProject', () =>
  getProject(config.public.api, projectSlug)).then(setAsyncRef(projectDetails))

getAsyncDataOrThrows('fetchValidators', () =>
  getValidators(config.public.api, projectSlug)).then(setAsyncRef(validators))

const lastUpdateCompact = computed(() => {
  const dateStr = projectDetails.value?.date_last_update
  if (!dateStr) {
    return null
  }
  const diff = dayjs().diff(dayjs(dateStr), 'minute')
  if (diff < 60) {
    return `${diff}m`
  }
  if (diff < 60 * 24) {
    return `${Math.floor(diff / 60)}h`
  }
  if (diff < 60 * 24 * 30) {
    return `${Math.floor(diff / (60 * 24))}d`
  }
  return `${Math.floor(diff / (60 * 24 * 30))}mo`
})

const lastUpdateTitle = computed(() => {
  const dateStr = projectDetails.value?.date_last_update
  if (!dateStr) {
    return undefined
  }
  return dayjs(dateStr).locale(locale.value).fromNow()
})

// Cache URL → Promise<string[]> pour dédupliquer les fetches (plusieurs groupes partagent souvent la même URL osm_tags)
const osmTagsCache = new Map<string, Promise<string[]>>()

const MOCK_OSM_TAGS = false // set to true to bypass CORS for UI testing

function fetchOsmTagsSelects(url: string): Promise<string[]> {
  if (MOCK_OSM_TAGS) {
    return Promise.resolve(['amenity=restaurant', 'amenity=cafe', 'shop=supermarket', 'tourism=hotel'])
  }
  if (!osmTagsCache.has(url)) {
    osmTagsCache.set(url, fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then((entries: Array<{ select?: string[] }>) => entries.flatMap((e) => e.select ?? []))
      .catch(() => []))
  }
  return osmTagsCache.get(url)!
}

const enrichedUserGroups = ref<UserGroup[]>([])

watch(
  () => projectDetails.value?.user_groups,
  async (userGroupsMap) => {
    if (!userGroupsMap) {
      enrichedUserGroups.value = []
      return
    }
    const groups = Object.values(userGroupsMap)
    enrichedUserGroups.value = await Promise.all(
      groups.map(async (group) => {
        // L'API injecte déjà les selects → pas besoin de fetcher
        if (group.select?.length) {
          return group
        }
        if (!group.osm_tags) {
          return group
        }
        const select = await fetchOsmTagsSelects(group.osm_tags)
        return { ...group, select }
      }),
    )
  },
  { immediate: true },
)
</script>

<template>
  <el-main class="settings-page">
    <project-context-bar
      v-if="projectDetails"
      :project="projectDetails"
      :project-slug="projectSlug"
      :last-update-compact="lastUpdateCompact"
      :last-update-title="lastUpdateTitle"
    />
    <el-tabs class="settings-tabs">
      <el-tab-pane :label="$t('validators.tabValidators')">
        <Validators v-if="validators" :validators="validators" />
      </el-tab-pane>
      <el-tab-pane :label="$t('validators.groups')">
        <LazyUserGroups v-if="enrichedUserGroups.length" :user-groups="enrichedUserGroups" :show-selectors="true" :show-map="false" />
      </el-tab-pane>
    </el-tabs>
  </el-main>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.settings-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  padding: 0 1.25rem;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0 1.25rem;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
}
</style>
