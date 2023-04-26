<template>
  <div>
    <h1>Clearance for OSM Data</h1>
    <div v-if="projects">
      <p>Configured projects:</p>
      <ul>
        <li v-for="(project, key) in projects" :key="key">
          <a :href="`/${key}/changes_logs/`">{{ key }}</a
          >:
          {{ project }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { Projects, getProjects } from '~/libs/types'

export default defineNuxtComponent({
  name: 'IndexPage',

  async setup(): Promise<{
    projects: Ref<Projects>
  }> {
    const getProjectsPromise = getAsyncDataOrThrows('fetchSettings', () =>
      getProjects(useRuntimeConfig().public.API)
    )

    const [projects] = await Promise.all([getProjectsPromise])

    return {
      projects,
    }
  },
})
</script>
