<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <el-footer class="app-footer">
    <span>
      {{ $t('app.attribution.data') }}
      <a href="https://www.openstreetmap.org/copyright" target="_blank">{{
        $t('app.attribution.osm')
      }}</a>
    </span>
    <span class="sep">·</span>
    <span>v{{ config.public.version }}</span>
    <span class="sep">·</span>
    <a href="https://clearance.teritorio.xyz" target="_blank">clearance.teritorio.xyz</a>
  </el-footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.app-footer a {
  color: var(--el-text-color-secondary);
}

.sep {
  color: var(--el-border-color);
}
</style>
