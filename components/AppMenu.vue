<script setup lang="ts">
import type { User } from '~/libs/types'

const user = useState<User>('user')

const { locale, locales, setLocale } = useI18n()
const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value)
})

// Function from https://dev.to/jorik/country-code-to-flag-emoji-a21
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
</script>

<template>
  <el-header height="68px">
    <nuxt-link to="/" :title="$t('app.back')">
      <img src="/favicon.svg" />
    </nuxt-link>
    <div>
      <el-select
        v-model="locale"
        class="m-2"
        placeholder="Language"
        size="small"
        @change="setLocale"
      >
        <el-option
          v-for="l in availableLocales"
          :key="l.code"
          :label="`${getFlagEmoji(l.flag)} ${l.name}`"
          :value="l.code"
          :fit-input-width="true"
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
</style>
