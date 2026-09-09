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

const { isLoading } = useLoadingIndicator()
</script>

<template>
  <nuxt-loading-indicator :height="5" color="#f59e0b" />
  <div
    v-loading.lock="isLoading"
    :element-loading-text="$t('common.loading')"
    class="app-wrapper"
  >
    <nuxt-layout>
      <el-container direction="vertical">
        <app-menu />
        <nuxt-page />
        <app-footer />
      </el-container>
    </nuxt-layout>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.app-wrapper {
  min-height: 100vh;
}

.el-container {
  min-height: 100vh;
}

/* Remove EP tag appear/leave transitions globally */
.el-tag {
  transition: none;
}

.el-zoom-in-center-enter-active,
.el-zoom-in-center-leave-active {
  transition: none !important;
}

.el-zoom-in-center-enter-from,
.el-zoom-in-center-leave-active {
  opacity: 1 !important;
  transform: none !important;
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

/* Remove EP tag appear/leave transitions globally */
.el-tag {
  transition: none;
}

/* a11y: EP light tag text is too low-contrast on pastel backgrounds */
.el-tag--success { --el-tag-text-color: #2f6b16; }
.el-tag--danger  { --el-tag-text-color: #b42318; }
.el-tag--warning { --el-tag-text-color: #8a5a00; }
.el-tag--info    { --el-tag-text-color: #606266; }
</style>
