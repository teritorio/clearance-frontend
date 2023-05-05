<template>
  <Layout :user="user">
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
  </Layout>
</template>

<script lang="ts">
import { getUser, User } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { Projects, getProjects } from '~/libs/types'

export default defineNuxtComponent({
  name: 'IndexPage',

  async setup(): Promise<{
    user: Ref<User | null>
    projects: Ref<Projects>
  }> {
    const getUserPromise = getAsyncDataOrNull('fetchUser', () =>
      getUser(useRuntimeConfig().public.API)
    )

    const getProjectsPromise = getAsyncDataOrThrows('fetchSettings', () =>
      getProjects(useRuntimeConfig().public.API)
    )

    const [user, projects] = await Promise.all([
      getUserPromise,
      getProjectsPromise,
    ])

    return {
      user,
      projects,
    }
  },
})
</script>
