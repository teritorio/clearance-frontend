<script setup lang="ts">
import type { InitializedProject, UninitializedProject } from '~/libs/types'
import { RefreshLeft, Search } from '@element-plus/icons-vue'
import _ from 'underscore'
import { isInitializedProject } from '~/libs/types'

const admin = useAdmin()
const user = useUser()

const { data } = await useProjectsData()

const partitionedProjects = computed(() =>
  _.partition(data.value?.projects ?? [], isInitializedProject),
)

const initializedProjects = computed<InitializedProject[]>(() => partitionedProjects.value[0] as InitializedProject[])
const uninitializedProjects = computed<UninitializedProject[]>(() => partitionedProjects.value[1] as UninitializedProject[])

const myProjects = computed<InitializedProject[]>(() =>
  initializedProjects.value.filter((p) => user.value?.projects.includes(p.id) ?? false),
)

const otherProjects = computed<InitializedProject[]>(() =>
  initializedProjects.value.filter((p) => !user.value?.projects.includes(p.id)),
)

const totalPending = computed(() =>
  initializedProjects.value.reduce((sum, p) => sum + (p.to_be_validated ?? 0), 0),
)

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const { locale } = useI18n()

const allTags = computed(() => {
  const tags = new Set<string>()
  initializedProjects.value.forEach((p) => p.project_tags.forEach((t) => tags.add(t)))
  return [...tags].sort()
})

function getLocalizedTitle(project: InitializedProject): string {
  const m = project.title
  return m[locale.value] || m.en || Object.values(m).find((v) => !!v) || ''
}

function filterProjects(projects: InitializedProject[]): InitializedProject[] {
  const q = searchQuery.value.toLowerCase()
  return projects.filter((p) => {
    const matchesSearch = !q || getLocalizedTitle(p).toLowerCase().includes(q)
    const matchesTags = !selectedTags.value.length || selectedTags.value.some((t) => p.project_tags.includes(t))
    return matchesSearch && matchesTags
  })
}

const filteredMyProjects = computed(() => filterProjects(myProjects.value))
const filteredOtherProjects = computed(() => filterProjects(otherProjects.value))

const hasActiveFilters = computed(() => !!searchQuery.value || selectedTags.value.length > 0)

function resetSearch() {
  searchQuery.value = ''
  selectedTags.value = []
}

function toggleTag(tag: string, checked: boolean) {
  if (checked) {
    selectedTags.value = [...selectedTags.value, tag]
  }
  else {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  }
}
</script>

<template>
  <el-main>
    <el-container direction="vertical">
      <div class="hero">
        <div class="hero-body">
          <h1>{{ $t('app.title') }}</h1>
          <p>{{ $t('app.summary') }}</p>
          <p v-if="admin" class="hero-admin">
            {{ $t('app.project.new') }}
            <a :href="`https://www.openstreetmap.org/user/${encodeURIComponent(admin)}`" target="_blank">{{ admin }}</a>
          </p>
        </div>
        <div class="hero-stats">
          <el-statistic :value="initializedProjects.length" :title="$t('page.index.totalProjects')" />
          <el-statistic :value="totalPending" :title="$t('page.index.totalPending')" />
        </div>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('page.index.search')"
          clearable
          :prefix-icon="Search"
          size="large"
          class="search-input"
        />
        <div v-if="allTags.length" class="tag-filters">
          <el-check-tag
            v-for="tag in allTags"
            :key="tag"
            :checked="selectedTags.includes(tag)"
            @change="(checked) => toggleTag(tag, checked)"
          >
            {{ tag }}
          </el-check-tag>
          <el-button v-if="selectedTags.length" :icon="RefreshLeft" circle class="reset-tags" @click="selectedTags = []" />
        </div>
      </div>

      <template v-if="myProjects.length > 0">
        <h2>{{ $t('page.index.myProjects') }}</h2>
        <el-row :gutter="20" class="project-grid">
          <el-col v-for="project in filteredMyProjects" :key="project.id" :xs="24" :md="12" :lg="8">
            <Project :project="project" />
          </el-col>
        </el-row>
      </template>

      <h2>{{ $t('page.index.publicProjects') }}</h2>
      <template v-if="filteredOtherProjects.length > 0">
        <el-row :gutter="20" class="project-grid">
          <el-col v-for="project in filteredOtherProjects" :key="project.id" :xs="24" :md="12" :lg="8">
            <Project :project="project" />
          </el-col>
        </el-row>
      </template>
      <div v-else class="empty-state">
        <el-empty
          :description="hasActiveFilters ? $t('page.index.noResults') : $t('page.index.empty')"
          :image-size="80"
        >
          <el-button v-if="hasActiveFilters" type="primary" plain :icon="RefreshLeft" @click="resetSearch">
            {{ $t('page.index.resetSearch') }}
          </el-button>
        </el-empty>
      </div>

      <template v-if="uninitializedProjects?.length">
        <h2>{{ $t('page.index.uninitializedProjects') }}</h2>
        <ul>
          <li v-for="project in uninitializedProjects" :key="project.id">
            {{ project.id }}
          </li>
        </ul>
      </template>
    </el-container>
  </el-main>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  background-color: var(--el-color-primary-light-9);
  border-radius: var(--el-border-radius-base);
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}

.hero-body {
  flex: 0 0 33%;
  max-width: 33%;
}

.hero-body h1 {
  margin: 0 0 0.5rem;
}

.hero-body p {
  color: var(--el-text-color-secondary);
  font-size: 1rem;
  margin: 0.25rem 0 0;
  line-height: 1.5;
}

.hero-admin {
  margin-top: 0.5rem !important;
}

.hero-stats {
  flex: 1;
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: flex-end;
}

.hero-stats :deep(.el-statistic__head) {
  font-size: 1rem;
}

.hero-stats :deep(.el-statistic__content) {
  font-size: 3rem;
}

.search-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-input {
  width: 65%;
  min-width: 400px;
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 8px 20px;
  font-size: 1.1rem;
}

.search-input :deep(.el-input__inner) {
  height: 36px;
  font-size: 1.1rem;
}

.search-input :deep(.el-input__prefix .el-icon) {
  font-size: 1.3rem;
  color: var(--el-text-color-placeholder);
}

.search-input :deep(.el-input__clear) {
  font-size: 1.4rem;
  width: 1.4rem;
  height: 1.4rem;
}

.empty-state {
  padding: 2rem 0;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.tag-filters :deep(.el-check-tag) {
  border: 1px solid var(--el-border-color);
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-regular);
  border-radius: 20px;
  padding: 7px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s;
}

.tag-filters :deep(.el-check-tag:hover) {
  border-color: var(--el-color-primary-light-3);
  background: var(--el-color-primary-light-9);
}

.tag-filters :deep(.el-check-tag.is-checked) {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #fff;
}

.reset-tags {
  color: var(--el-text-color-placeholder);
  font-size: 0.8rem;
}

.project-grid :deep(.el-col) {
  margin-bottom: 20px;
}
</style>
