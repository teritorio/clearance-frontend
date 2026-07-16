<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <el-footer class="app-footer">
    <span class="footer-left">
      {{ $t('app.attribution.website') }}
      <a href="https://clearance.teritorio.xyz" target="_blank" rel="noopener noreferrer">clearance.teritorio.xyz</a>
    </span>
    <span class="footer-center">
      {{ $t('app.attribution.madeBy') }}
      <a href="https://www.teritorio.fr" target="_blank" rel="noopener noreferrer">Teritorio</a>
      <a href="https://github.com/teritorio/clearance-frontend" target="_blank" rel="noopener noreferrer" class="github-link" :title="$t('app.github')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
        </svg>
      </a>
    </span>
    <span class="footer-right">
      <span v-if="config.public.version" class="version">v{{ config.public.version }} ·</span>
      {{ $t('app.attribution.data') }}
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{{
        $t('app.attribution.osm')
      }}</a>
    </span>
  </el-footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-top: 1px solid var(--el-border-color-lighter);
}

.app-footer a {
  color: var(--el-text-color-secondary);
  text-decoration: none;
}

.app-footer a:hover {
  color: var(--el-text-color-primary);
}

.footer-left,
.footer-right {
  flex: 1;
}

.footer-right {
  text-align: right;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.version {
  color: var(--el-text-color-placeholder);
}

.github-link {
  display: flex;
  align-items: center;
  color: var(--el-text-color-placeholder);
  transition: color 0.15s;
}

.github-link:hover {
  color: var(--el-text-color-primary);
}
</style>
