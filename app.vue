<script setup lang="ts">
import type { User } from '~/libs/apiTypes'
import type { Project } from '~/libs/types'

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
    <app-menu />
    <nuxt-page />
    <app-footer />
  </nuxt-layout>
</template>
