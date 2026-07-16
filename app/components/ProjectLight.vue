<script setup lang="ts">
import type { HTMLTags, InitializedProject } from '~/libs/types'

const props = defineProps<{
  project: InitializedProject
  titleTag: HTMLTags
}>()

const { t } = useI18n()
const details = computed(() => ({
  label: t('project.details'),
  url: `/${props.project.id}/changes_logs`,
}))

const TAG_COLORS = [
  { bg: '#fef3e5', color: '#b45309', border: '#f59e0b' }, // amber
  { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' }, // blue
  { bg: '#f0fdfa', color: '#0f766e', border: '#5eead4' }, // teal
  { bg: '#eef2ff', color: '#4338ca', border: '#a5b4fc' }, // indigo
  { bg: '#fff1f2', color: '#be123c', border: '#fda4af' }, // rose
  { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' }, // violet
]

function tagColor(tag: string) {
  return TAG_COLORS[(tag.charCodeAt(0) + tag.length) % TAG_COLORS.length]!
}
</script>

<template>
  <header>
    <span class="project-info">
      <component :is="titleTag" class="title">
        {{ useI18nHash(project.title) }}
      </component>
      <div v-if="project.project_tags?.length" class="tags">
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
      </div>
      <p class="description">{{ useI18nHash(project.description) }}</p>
    </span>
    <project-stats :last-update="project.date_last_update" :to-be-validated="project.to_be_validated" />
    <el-button-group>
      <nuxt-link class="el-button" :to="`/${project.id}/validators`">
        {{ $t('project.settings') }}
      </nuxt-link>
      <nuxt-link class="el-button el-button--primary" :to="details.url">
        {{ details.label }}
      </nuxt-link>
    </el-button-group>
  </header>
</template>

<style scoped>
header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.project-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  margin: 0;
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 12px;
  line-height: 20px;
  font-weight: 500;
  white-space: nowrap;
}

.description {
  color: var(--el-color-info);
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
