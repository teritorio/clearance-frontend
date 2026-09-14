<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { ArrowRight, CircleCheck, Clock, Setting } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import en from 'dayjs/locale/en-gb'
import es from 'dayjs/locale/es'
import fr from 'dayjs/locale/fr'
import relativeTime from 'dayjs/plugin/relativeTime'

const props = defineProps<{
  project: InitializedProject
}>()

dayjs.extend(relativeTime)

const _daysjsLocale = { en, fr, es }

const { locale } = useI18n()

const lastUpdateCompact = computed(() => {
  if (!props.project.date_last_update) {
    return null
  }
  const diff = dayjs().diff(dayjs(props.project.date_last_update), 'minute')
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
  if (!props.project.date_last_update) {
    return undefined
  }
  return dayjs(props.project.date_last_update).locale(locale.value).fromNow()
})
</script>

<template>
  <el-card shadow="hover" class="project-card">
    <template #header>
      <div class="card-header">
        <div class="card-left">
          <div class="card-info">
            <div class="card-header-row">
              <div class="title-link">
                <project-light :project="project" title-tag="h3" />
              </div>
              <div class="header-stats">
                <span v-if="lastUpdateCompact" class="stat-badge stat-time" :title="lastUpdateTitle">
                  <el-icon><Clock /></el-icon>{{ lastUpdateCompact }}
                </span>
                <nuxt-link :to="`/${project.id}/validators`" class="settings-icon" :title="$t('project.settings')">
                  <el-icon><Setting /></el-icon>
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>
        <nuxt-link :to="`/${project.id}/changes_logs`" class="card-next" :class="{ 'card-next--pending': project.to_be_validated }" :title="project.to_be_validated ? `${$t('project.details')} — ${project.to_be_validated} ${$t('project.toBeValidated')}` : $t('project.details')">
          <span v-if="project.to_be_validated" class="card-next-count">
            <el-icon><CircleCheck /></el-icon>{{ project.to_be_validated }}
          </span>
          <el-icon class="card-next-arrow">
            <ArrowRight />
          </el-icon>
        </nuxt-link>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  background-color: var(--el-bg-color);
  padding: 0;
}

:deep(.el-card__body) {
  padding: 0;
  flex: 1;
}

.card-header {
  display: flex;
  flex-direction: row;
}

.card-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card-info {
  flex: 1;
  min-width: 0;
  padding: 12px 8px 8px 16px;
}

.card-header-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 10px;
  padding: 3px 8px;
  white-space: nowrap;
}

.stat-badge .el-icon {
  font-size: 0.9rem;
}

.stat-time {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}

.settings-icon {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  text-decoration: none;
  font-size: 1.25rem;
  line-height: 1;
  transition: color 0.15s;
}

.settings-icon:hover {
  color: var(--el-text-color-regular);
}

.card-next {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-left: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  width: 72px;
}

.card-next--pending {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-left-color: var(--el-color-primary-light-7);
}

.card-next:hover {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.card-next-count {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.9rem;
  font-weight: 700;
}

.card-next-arrow {
  font-size: 1.1rem;
}

.title-link {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
</style>
