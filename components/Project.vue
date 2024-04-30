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

  setup() {
    const activeName = ref('')

    return {
      activeName,
    }
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
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item :title="$t('project.seeMore')" name="1">
        <UserGroups :user-groups="Object.values(project.user_groups)" />
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
        <p>
          <span>{{ $t('app.project.mainContacts') }}</span>
          <span v-for="user in project.main_contacts" :key="user">
            <a :href="`https://www.openstreetmap.org/user/${user}`" target="_blank">👤&nbsp;{{ user }}</a>
          </span>
        </p>
        <p>{{ $t('app.project.join') }}</p>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped>
:deep(.el-card__header) {
  background-color: #fafafa;
}

ul, p {
  font-size: initial;
  line-height: initial;
}
</style>
