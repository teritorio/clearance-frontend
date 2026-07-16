<script setup lang="ts">
import type { HTMLTags, InitializedProject } from '~/libs/types'

defineProps<{
  project: InitializedProject
  titleTag: HTMLTags
}>()

const TAG_COLORS = [
  { bg: '#fef3e5', color: '#b45309', border: '#f59e0b' },
  { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  { bg: '#f0fdfa', color: '#0f766e', border: '#5eead4' },
  { bg: '#eef2ff', color: '#4338ca', border: '#a5b4fc' },
  { bg: '#fff1f2', color: '#be123c', border: '#fda4af' },
  { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' },
]

function tagColor(tag: string) {
  return TAG_COLORS[(tag.charCodeAt(0) + tag.length) % TAG_COLORS.length]!
}
</script>

<template>
  <div class="project-light">
    <component :is="titleTag" class="title">
      {{ useI18nHash(project.title) }}
      <span
        v-for="tag in project.project_tags"
        :key="tag"
        class="tag"
        :style="{
          background: tagColor(tag).bg,
          color: tagColor(tag).color,
          borderColor: tagColor(tag).border,
        }"
      >{{ tag }}</span>
    </component>
    <p class="description">
      {{ useI18nHash(project.description) }}
    </p>
  </div>
</template>

<style scoped>
.project-light {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.title {
  margin: 0;
  font-weight: 600;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 11px;
  line-height: 18px;
  font-weight: 500;
  white-space: nowrap;
}

.description {
  color: var(--el-text-color-secondary);
  margin: 0;
  font-size: 0.875rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
