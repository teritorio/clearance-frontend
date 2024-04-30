<script lang="ts">
import type { Project } from '~/libs/types'

export default defineNuxtComponent({
  name: 'Project',

  props: {
    project: {
      type: Object as PropType<Project>,
      required: true,
    },
  },

  computed: {
    apiUrl(): string {
      return useRuntimeConfig().public.API
    },
    overpassUrl(): string {
      return `${this.apiUrl}/projects/${this.project.id}/overpasslike/`
    },
  },
})
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <project-light :project="project" title-tag="h3" />
    </template>
    <div>
      <el-row>
        <UserGroups :user-groups="Object.values(project.user_groups)" />
      </el-row>
      <el-row>
        <ul>
          <li>
            {{ $t('project.overpassUrl') }}
            <a :href="overpassUrl">{{ overpassUrl }}</a>
          </li>
          <li>
            {{ $t('project.extract') }}
            <a :href="`${apiUrl}/${project.id}/extract/${project.id}.osm.bz2`">
              {{ `${project.id}.osm.bz2` }}
            </a>
          </li>
          <li>
            <a :href="`${apiUrl}/${project.id}/extract/update/`">{{
              $t('project.diff')
            }}</a>
          </li>
        </ul>
      </el-row>
    </div>
    <p>
      <span>{{ $t('app.project.mainContacts') }}</span>
      <span v-for="user in project.main_contacts" :key="user">
        <a :href="`https://www.openstreetmap.org/user/${user}`" target="_blank">👤&nbsp;{{ user }}</a>
      </span>
    </p>
    <p>{{ $t('app.project.join') }}</p>
  </el-card>
</template>

<style scoped>
:deep(.el-card__header) {
  background-color: #fafafa;
}
</style>
