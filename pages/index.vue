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

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getProjects } from '~/libs/types'

const getUserPromise = getAsyncDataOrNull('fetchUser', () =>
  getUser(useRuntimeConfig().public.API)
)

const getProjectsPromise = getAsyncDataOrThrows('fetchSettings', () =>
  getProjects(useRuntimeConfig().public.API)
)

const [userAsyncData, projectsAsyncData] = await Promise.all([
  getUserPromise,
  getProjectsPromise,
])

const [user, projects] = [userAsyncData?.data, projectsAsyncData?.data]
</script>
