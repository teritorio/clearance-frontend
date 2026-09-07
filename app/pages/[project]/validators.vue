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

const { data: projectDetails } = useAsyncData<InitializedProject>(
  'fetchProject',
  () => getProject(config.public.api, projectSlug),
)

const { data: validators } = useAsyncData<ValidatorsType>(
  'fetchValidators',
  () => getValidators(config.public.api, projectSlug),
)

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
        <div v-else class="validators-skeleton">
          <div class="skeleton-table">
            <el-skeleton v-for="i in 6" :key="i" animated :rows="0" class="skeleton-row">
              <template #template>
                <div class="skeleton-row-inner">
                  <el-skeleton-item variant="button" style="width: 56px; height: 20px; flex-shrink: 0;" />
                  <el-skeleton-item variant="text" style="width: 160px; height: 14px; flex-shrink: 0;" />
                  <el-skeleton-item variant="text" style="flex: 1; height: 14px;" />
                </div>
              </template>
            </el-skeleton>
          </div>
          <div class="skeleton-legend" />
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('validators.groups')">
        <LazyUserGroups v-if="userGroups.length" :user-groups="userGroups" :show-map="false" />
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

.context-bar-placeholder {
  min-height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
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

.validators-skeleton {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  padding-top: 12px;
}

.skeleton-table {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.skeleton-row {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 12px 0;
}

.skeleton-row-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-legend {
  flex-shrink: 0;
  width: 260px;
  height: 140px;
  background: var(--el-fill-color-light);
  border-radius: var(--el-border-radius-base);
  border-left: 3px solid var(--el-border-color);
}
</style>
