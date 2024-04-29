<script setup lang="ts">
import type { User } from '~/libs/types'

const user = useState<User>('user')

const { locale, locales, setLocale, localeProperties, loadLocaleMessages } = useI18n()

// Function from https://dev.to/jorik/country-code-to-flag-emoji-a21
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

async function changeLocale(locale: string) {
  await loadLocaleMessages(locale)
  await setLocale(locale)
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
        :placeholder="`${getFlagEmoji(localeProperties.flag)} ${localeProperties.name}`"
        @change="changeLocale"
      >
        <el-option
          v-for="l in locales"
          :key="l.code"
          :label="`${getFlagEmoji(l.flag)} ${l.name}`"
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
