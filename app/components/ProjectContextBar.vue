<script setup lang="ts">
import type { InitializedProject } from '~/libs/types'
import { CircleCheck, Clock, Setting } from '@element-plus/icons-vue'

defineProps<{
  project: InitializedProject
  projectSlug: string
  lastUpdateCompact: string | null
  lastUpdateTitle: string | undefined
}>()
</script>

<template>
  <div class="context-bar">
    <div class="context-left">
      <span class="project-title">{{ useI18nHash(project.title) }}</span>
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
    </div>
    <div class="context-stats">
      <span v-if="lastUpdateCompact" class="stat stat-time" :title="lastUpdateTitle">
        <el-icon><Clock /></el-icon>{{ lastUpdateCompact }}
      </span>
      <span v-if="project.to_be_validated" class="stat stat-pending" :title="$t('project.toBeValidated')">
        <el-icon><CircleCheck /></el-icon>{{ project.to_be_validated }}
      </span>
    </div>
    <nuxt-link :to="`/${projectSlug}/validators`" class="settings-link" :title="$t('project.settings')">
      <el-icon><Setting /></el-icon>
    </nuxt-link>
  </div>
</template>

<style scoped>
.context-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 1.25rem;
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.context-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.project-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  flex-shrink: 0;
}

.context-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 4px 10px;
  white-space: nowrap;
}

.stat .el-icon {
  font-size: 1rem;
}

.stat-time {
  color: var(--el-color-info-dark-2);
  background: var(--el-color-info-light-9);
}

.stat-pending {
  color: var(--el-color-primary-dark-2);
  background: var(--el-color-primary-light-9);
}

.settings-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--el-text-color-placeholder);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.settings-link:hover {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
}

.settings-link .el-icon {
  font-size: 18px;
}
</style>
