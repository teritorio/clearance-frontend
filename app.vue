<script setup lang="ts">
import type { Project, User } from '~/libs/types'

const authToken = useCookie('_interslice_session')
if (authToken.value) {
  await callOnce(async () => {
    try {
      const user = await useFetchWithCache<User>('user', `${useRuntimeConfig().public.API}/users/me`, { credentials: 'include' })
      useState<User>('user', () => user.value)
    }
    catch (err: any) {
      ElMessage.error(err.message)
    }
  })
}

try {
  const projects = await useFetchWithCache<Project[]>('projects', `${useRuntimeConfig().public.API}/projects`)
  useState<Project[]>('projects', () => projects.value)
}
catch (err: any) {
  ElMessage.error(err.message)
}
</script>

<template>
  <nuxt-layout>
    <el-container direction="vertical">
      <app-menu />
      <el-main>
        <nuxt-page />
      </el-main>
      <app-footer />
    </el-container>
  </nuxt-layout>
</template>

<style>
body {
  margin: 0;
}
</style>
