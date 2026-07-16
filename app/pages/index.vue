<script setup lang="ts">
import type { InitializedProject, UninitializedProject } from '~/libs/types'
import { CircleClose, RefreshLeft, Search } from '@element-plus/icons-vue'
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

function tagFilterStyle(tag: string, checked: boolean) {
  if (checked) {
    return {
      background: 'var(--el-color-primary)',
      borderColor: 'var(--el-color-primary)',
      color: '#fff',
    }
  }
  const c = useTagColor(tag)
  return { background: c.bg, borderColor: c.border, color: c.color }
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
          :prefix-icon="Search"
          size="large"
          autofocus
          class="search-input"
        >
          <template #suffix>
            <el-icon
              v-if="searchQuery"
              tabindex="0"
              class="search-clear"
              @click="searchQuery = ''"
              @keydown.enter="searchQuery = ''"
              @keydown.space.prevent="searchQuery = ''"
            >
              <CircleClose />
            </el-icon>
          </template>
        </el-input>
        <div v-if="allTags.length" class="tag-filters">
          <el-check-tag
            v-for="tag in allTags"
            :key="tag"
            :checked="selectedTags.includes(tag)"
            :style="tagFilterStyle(tag, selectedTags.includes(tag))"
            @change="(checked) => toggleTag(tag, checked)"
          >
            {{ tag }}
          </el-check-tag>
          <el-button v-if="selectedTags.length" :icon="RefreshLeft" circle class="reset-tags" @click="selectedTags = []" />
        </div>
      </div>

      <template v-if="myProjects.length > 0">
        <h2 class="section-title">
          {{ $t('page.index.myProjects') }}
          <span class="section-count">{{ filteredMyProjects.length }}</span>
        </h2>
        <div class="project-list">
          <ProjectRow v-for="project in filteredMyProjects" :key="project.id" :project="project" />
        </div>
      </template>

      <h2 class="section-title">
        {{ $t('page.index.publicProjects') }}
        <span class="section-count">{{ filteredOtherProjects.length }}</span>
      </h2>
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
        <details class="uninitialized-section">
          <summary class="section-title">
            {{ $t('page.index.uninitializedProjects') }}
            <span class="section-count">{{ uninitializedProjects.length }}</span>
          </summary>
          <el-row :gutter="20" class="project-grid uninitialized-grid">
            <el-col v-for="project in uninitializedProjects" :key="project.id" :xs="24" :md="12" :lg="8">
              <el-card shadow="never" class="ghost-card">
                <div class="ghost-card-inner">
                  <span class="project-id">{{ project.id }}</span>
                  <el-tag type="info" effect="plain" size="small" disable-transitions>
                    {{ $t('page.index.pendingInit') }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </details>
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

.search-input :deep(.search-clear) {
  font-size: 1.4rem;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  outline: none;
}

.search-input :deep(.search-clear:hover),
.search-input :deep(.search-clear:focus) {
  color: var(--el-text-color-regular);
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
  border: 1px solid;
  border-radius: 20px;
  padding: 7px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: filter 0.15s;
}

.tag-filters :deep(.el-check-tag:hover) {
  filter: brightness(0.92);
}

.reset-tags {
  color: var(--el-text-color-placeholder);
  font-size: 0.8rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default;
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 2rem;
  max-width: 720px;
}

.uninitialized-section {
  margin-top: 1rem;
}

.uninitialized-section > summary {
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.uninitialized-section > summary::before {
  content: '▶';
  display: inline-block;
  font-size: 0.6rem;
  margin-right: 6px;
  transition: transform 0.2s;
  color: var(--el-text-color-placeholder);
}

.uninitialized-section[open] > summary::before {
  transform: rotate(90deg);
}

.uninitialized-grid {
  margin-top: 1rem;
}

.project-grid :deep(.el-col) {
  margin-bottom: 20px;
}

.ghost-card {
  background-color: var(--el-fill-color-lighter);
  border-style: dashed;
  opacity: 0.65;
  cursor: default;
}

.ghost-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.project-id {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
