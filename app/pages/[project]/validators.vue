<script setup lang="ts">
import type {
  InitializedProject,
  Validators as ValidatorsType,
} from '~/libs/types'
import dayjs from 'dayjs'
import en from 'dayjs/locale/en-gb'
import es from 'dayjs/locale/es'
import fr from 'dayjs/locale/fr'
import relativeTime from 'dayjs/plugin/relativeTime'
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
const config = useRuntimeConfig()
const nuxtApp = useNuxtApp()

const [
  { data: projectDetails, error: projectError },
  { data: validators, error: validatorsError },
] = await Promise.all([
  useAsyncData<InitializedProject>(`project:${projectSlug}`, () => getProject(config.public.api, projectSlug), {
    getCachedData: (key) => (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as InitializedProject | undefined,
  }),
  useAsyncData<ValidatorsType>(`validators:${projectSlug}`, () => getValidators(config.public.api, projectSlug), {
    getCachedData: (key) => (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as ValidatorsType | undefined,
  }),
])

if (projectError.value || validatorsError.value) {
  throw createError({ fatal: true })
}

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

const userGroups = computed(() => Object.values(projectDetails.value?.user_groups ?? {}))
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
    <div v-else class="context-bar-placeholder" />
    <el-tabs class="settings-tabs">
      <el-tab-pane :label="$t('validators.tabValidators')">
        <Validators v-if="validators" :validators="validators" />
      </el-tab-pane>
      <el-tab-pane :label="$t('validators.groups')">
        <LazyUserGroups v-if="userGroups.length" :user-groups="userGroups" :show-map="false" />
      </el-tab-pane>
    </el-tabs>
  </el-main>
</template>

<style scoped>
.settings-page {
  padding: 0;
}

.context-bar-placeholder {
  min-height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-tabs__header) {
  padding: 0 1.25rem;
}

:deep(.el-tabs__content) {
  padding: 0 1.25rem;
}
</style>
