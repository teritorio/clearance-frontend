<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { CircleCheck, Clock, Setting } from '@element-plus/icons-vue'
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
  <div class="project-row">
    <nuxt-link :to="`/${project.id}/changes_logs`" class="row-main">
      <span class="row-title">
        {{ useI18nHash(project.title) }}
        <span
          v-for="tag in project.project_tags"
          :key="tag"
          class="tag"
          :style="{
            background: useTagColor(tag).bg,
            color: useTagColor(tag).color,
            borderColor: useTagColor(tag).border,
          }"
        >{{ tag }}</span>
      </span>
      <span class="row-stats">
        <span v-if="lastUpdateCompact" class="stat-badge" :title="lastUpdateTitle">
          <el-icon><Clock /></el-icon>{{ lastUpdateCompact }}
        </span>
        <span v-if="project.to_be_validated" class="stat-badge stat-pending" :title="$t('project.toBeValidated')">
          <el-icon><CircleCheck /></el-icon>{{ project.to_be_validated }}
        </span>
      </span>
    </nuxt-link>
    <nuxt-link :to="`/${project.id}/validators`" class="row-settings" :title="$t('project.settings')">
      <el-icon><Setting /></el-icon>
    </nuxt-link>
  </div>
</template>

<style scoped>
.project-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.project-row:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.row-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.row-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--el-text-color-primary);
  min-width: 0;
}

.row-main:hover .row-title {
  color: var(--el-color-primary);
}

.tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 11px;
  line-height: 18px;
  font-weight: 500;
  white-space: nowrap;
}

.row-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
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

.stat-pending {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.row-settings {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  font-size: 1.1rem;
  text-decoration: none;
  transition: color 0.15s;
  line-height: 1;
}

.row-settings:hover {
  color: var(--el-text-color-regular);
}
</style>
