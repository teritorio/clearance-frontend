<script setup lang="ts">
import type { HTMLTags, Project } from '~/libs/types'

const props = defineProps<{
  project: Project
  titleTag: HTMLTags
}>()

const route = useRoute()
const detailsLink = computed(() => {
  let url = `/${props.project.id}`

  if (route.name === 'index') {
    url += '/changes_logs'
  }
  return url
})
</script>

<template>
  <header>
    <span>
      <component :is="titleTag" class="title">
        {{ $i18nHash(project.title) }}
        <el-tag
          v-for="tag in project.project_tags"
          :key="tag"
          size="small"
        >
          {{ tag }}
        </el-tag>
      </component>
      <p>{{ $i18nHash(project.description) }}</p>
    </span>
    <project-stats :last-update="project.date_last_update" :to-be-validated="project.to_be_validated" />
    <el-button-group>
      <nuxt-link class="el-button" :to="`/${project.id}/validators`">
        {{ $t('project.settings') }}
      </nuxt-link>
      <nuxt-link class="el-button el-button--primary" :to="detailsLink">
        {{ $t('project.details') }}
      </nuxt-link>
    </el-button-group>
  </header>
</template>

<style scoped>
header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

header > span {
  justify-content: start;
  display: flex;
  flex-direction: column;
}

.el-row {
  flex-grow: 1;
}

P {
  color: var(--el-color-info);
  margin: 0;
}

.title {
  align-items: center;
  display: flex;
  margin: 0;
  gap: 8px;
  font-weight: 600;
  padding-right: 1em;
}
</style>
