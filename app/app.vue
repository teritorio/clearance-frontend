<script setup lang="ts">
import type { Project, ProjectsResponse } from '~/libs/types'

const config = useRuntimeConfig()

const { fetchUser } = useAuth()
await fetchUser()

try {
  const response = await useFetchWithCache<ProjectsResponse>('projectsResponse', `${config.public.api}/projects`)
  useState<string | null>('admin', () => response.value?.admin ?? null)
  useState<Project[]>('projects', () => response.value?.projects ?? [])
}
catch (err: any) {
  ElMessage.error({
    duration: 5000,
    message: err.message,
  })
}
</script>

<template>
  <nuxt-loading-indicator :height="5" />
  <nuxt-layout>
    <el-container direction="vertical">
      <app-menu />
      <nuxt-page />
      <app-footer />
    </el-container>
  </nuxt-layout>
</template>

<style>
body {
  margin: 0;
}
</style>
