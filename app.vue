<script setup lang="ts">
import type { Project, User } from '~/libs/types'

await callOnce(async () => {
  try {
    const user = await useFetchWithCache<User>('user', `${useRuntimeConfig().public.API}/users/me`, { credentials: 'include' })
    useState<User>('user', () => user.value)
  }
  catch (err: any) {
    console.error('Clearance Error :', err.message)
  }
})

try {
  const projects = await useFetchWithCache<Project[]>('projects', `${useRuntimeConfig().public.API}/projects`)
  useState<Project[]>('projects', () => projects.value)
}
catch (err: any) {
  ElMessage.error({
    duration: 0,
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
