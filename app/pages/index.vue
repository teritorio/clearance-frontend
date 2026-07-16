<script setup lang="ts">
import type { InitializedProject, UninitializedProject } from '~/libs/types'
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
          prefix-icon="Search"
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
          <el-button v-if="selectedTags.length" link size="small" class="reset-tags" @click="selectedTags = []">
            × {{ $t('page.index.resetFilters') }}
          </el-button>
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
      <el-empty v-else :description="$t('page.index.empty')" :image-size="50" />

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
  flex: 1;
}

.hero-body h1 {
  margin: 0 0 0.5rem;
}

.hero-body p {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.hero-admin {
  margin-top: 0.5rem !important;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-shrink: 0;
  align-items: center;
}

.search-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.reset-tags {
  color: var(--el-color-danger);
}

.project-grid :deep(.el-col) {
  margin-bottom: 20px;
}
</style>
