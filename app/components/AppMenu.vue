<script setup lang="ts">
const { locale, locales, setLocale, localeProperties } = useI18n()

// Function from https://dev.to/jorik/country-code-to-flag-emoji-a21
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

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
      <a href="https://github.com/teritorio/clearance-frontend" target="_blank" rel="noopener noreferrer" class="github-link" :title="$t('app.github')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
        </svg>
      </a>
      <el-dropdown trigger="click" @command="changeLocale">
        <span class="lang-trigger">{{ getFlagEmoji(localeProperties.flag as string) }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="l in locales"
              :key="l.code"
              :command="l.code"
              :disabled="l.code === locale"
            >
              {{ getFlagEmoji(l.flag as string) }} {{ l.name }}
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
  font-size: 1.4rem;
  cursor: pointer;
  line-height: 1;
  user-select: none;
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

.github-link {
  display: flex;
  align-items: center;
  color: var(--el-text-color-placeholder);
  text-decoration: none;
  transition: color 0.15s;
}

.github-link:hover {
  color: var(--el-text-color-primary);
}
</style>
