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
}
</style>
