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
import Vue from 'vue'
import { Projects, getProjects } from '~/libs/types'

export default Vue.extend({
  name: 'IndexPage',

  async asyncData({ $config }): Promise<{
    projects: Projects
  }> {
    const getProjectsPromise = getProjects($config.API)

    const [projects] = await Promise.all([getProjectsPromise])

    return Promise.resolve({
      projects,
    })
  },

  data(): {
    projects: Projects
  } {
    return {
      // @ts-ignore
      projects: null,
    }
  },
})
</script>
