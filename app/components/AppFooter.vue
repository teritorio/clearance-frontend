<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <el-footer class="app-footer">
    <span class="attribution">
      {{ $t('app.attribution.data') }}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{{
        $t('app.attribution.osm')
      }}</a>
    </span>
    <span class="spacer" />
    <span v-if="config.public.version" class="version">v{{ config.public.version }}</span>
    <span class="sep">·</span>
    <span>
      {{ $t('app.attribution.madeBy') }}
      <a href="https://www.teritorio.fr" target="_blank" rel="noopener noreferrer">Teritorio</a>
    </span>
    <span class="sep">·</span>
    <span>
      {{ $t('app.attribution.webApp') }}
      <a href="https://clearance.teritorio.xyz" target="_blank" rel="noopener noreferrer">clearance.teritorio.xyz</a>
    </span>
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
  border-top: 1px solid var(--el-border-color-lighter);
}

.app-footer a {
  color: var(--el-text-color-secondary);
}

.app-footer a:hover {
  color: var(--el-text-color-primary);
}

.spacer {
  flex: 1;
}

.sep {
  color: var(--el-border-color);
}

.version {
  color: var(--el-text-color-placeholder);
}
</style>
