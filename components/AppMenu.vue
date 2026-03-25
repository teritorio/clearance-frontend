<script setup lang="ts">
const user = useUser()
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
    <nuxt-link to="/" :title="$t('app.back')">
      <img src="/favicon.svg" />
    </nuxt-link>
    <div>
      <el-select
        class="m-2"
        size="small"
        :placeholder="`${getFlagEmoji(localeProperties.flag as string)} ${localeProperties.name}`"
        @change="changeLocale"
      >
        <el-option
          v-for="l in locales"
          :key="l.code"
          :label="`${getFlagEmoji(l.flag as string)} ${l.name}`"
          :value="l.code"
          :fit-input-width="true"
          :disabled="l.code === locale"
        />
      </el-select>
      <user-profile :user="user" />
    </div>
  </el-header>
</template>

<style scoped>
header {
  align-items: center;
  box-shadow: var(--el-box-shadow-light);
  display: flex;
}

header > div {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.el-select {
  width: 100px;
}

img {
  width: 68px;
}

:deep(.el-select__placeholder) {
  color: var(--el-text-color-regular)
}
</style>
