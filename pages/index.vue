<template>
  <Layout :user="user">
    <div>
      <h1>Clearance for OSM Data</h1>
      <template v-if="user">
        <h2>My projects</h2>
        <el-empty description="No project" :image-size="50" />
      </template>

      <h2>Public projects</h2>
      <Project
        v-for="(project, key) in projects || []"
        :key="key"
        :slug="key"
        :project="project"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { getUser } from '~/libs/apiTypes'
import { getAsyncDataOrNull, getAsyncDataOrThrows } from '~/libs/getAsyncData'
import { getProjects } from '~/libs/types'
import Project from '~/components/Project.vue'

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
