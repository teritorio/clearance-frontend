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

const userGroups = computed(() =>
  projectDetails.value ? Object.values(projectDetails.value.user_groups) : [],
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
      <el-tab-pane :label="$t('validators.tabGroups')">
        <UserGroups v-if="userGroups.length" :user-groups="userGroups" />
      </el-tab-pane>
      <el-tab-pane :label="$t('validators.tabValidators')">
        <Validators v-if="validators" :validators="validators" />
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
  padding: 0 1.25rem;
  flex: 1;
  overflow: auto;
}

:deep(.el-tabs__content) {
  overflow: visible;
}
</style>
