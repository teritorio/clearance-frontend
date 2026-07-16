<script setup lang="ts">
const admin = useAdmin()
const projects = useProjects()

const { fetchUser } = useAuth()
await callOnce(() => fetchUser())

const { data, error } = await useProjectsData()

watchEffect(() => {
  if (error.value) {
    ElMessage.error({ duration: 5000, message: error.value.message })
  }
})

watch(data, (val) => {
  admin.value = val?.admin ?? null
  projects.value = val?.projects ?? []
}, { immediate: true })
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
  font-family: ui-sans-serif, system-ui, sans-serif;
}

/* Theme: aligned with clearance-website (amber primary) */
:root {
  --el-color-primary: #f59e0b;
  --el-color-primary-dark-2: #d97706;
  --el-color-primary-light-3: #f8bb54;
  --el-color-primary-light-5: #fbcc85;
  --el-color-primary-light-7: #fdddb5;
  --el-color-primary-light-8: #fee5ca;
  --el-color-primary-light-9: #fef3e5;
}
</style>
