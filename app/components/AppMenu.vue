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
</style>
