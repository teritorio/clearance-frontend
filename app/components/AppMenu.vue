<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

async function changeLocale(code: string) {
  // Keep locale union in sync with nuxt.config.ts i18n.locales
  await setLocale(code as 'en' | 'es' | 'fr')
}
</script>

<template>
  <el-header height="68px">
    <nuxt-link to="/" :title="$t('app.back')" class="brand">
      <img src="/favicon.svg" />
      <span class="brand-name">clearance</span>
    </nuxt-link>
    <div>
      <el-dropdown trigger="click" @command="changeLocale">
        <span class="lang-trigger">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
          </svg>
          {{ locale.toUpperCase() }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="l in locales"
              :key="l.code"
              :command="l.code"
              :disabled="l.code === locale"
            >
              {{ l.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <user-profile />
    </div>
  </el-header>
</template>

<style scoped>
header {
  align-items: center;
  box-shadow: var(--el-box-shadow-light);
  display: flex;
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--el-bg-color);
}

header > div {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-left: auto;
}

img {
  width: 36px;
}

.lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--el-text-color-regular);
  user-select: none;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s;
}

.lang-trigger:hover {
  background: var(--el-fill-color-light);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
  letter-spacing: -0.02em;
}
</style>
