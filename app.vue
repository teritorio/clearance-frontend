<script setup lang="ts">
import type { User } from '~/libs/apiTypes'
import type { Project } from '~/libs/types'

const back = ref(true)
const { locale, locales, setLocale } = useI18n()

const authToken = useCookie('_interslice_session')
if (authToken.value) {
  await callOnce(async () => {
    try {
      const user = await useFetchWithCache<User>('user', `${useRuntimeConfig().public.API}/users/me`, { credentials: 'include' })
      useState<User>('user', () => user.value)
    }
    catch (err: any) {
      ElMessage.error(err.message)
    }
  })
}

try {
  const projects = await useFetchWithCache<Project[]>('projects', `${useRuntimeConfig().public.API}/projects`)
  useState<Project[]>('projects', () => projects.value)
}
catch (err: any) {
  ElMessage.error(err.message)
}

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
  <nuxt-layout>
    <el-menu mode="horizontal" :ellipsis="false">
      <el-menu-item v-if="back" index="0">
        <nuxt-link to="/" :title="$t('app.back')">
          <img src="/favicon.svg" style="width: 6em" />
        </nuxt-link>
      </el-menu-item>
      <el-menu-item v-else index="0">
        <img src="/favicon.svg" style="width: 6em" />
      </el-menu-item>
      <div class="flex-grow" />
      <el-menu-item index="1">
        <slot name="header" />
      </el-menu-item>
      <div class="flex-grow" />
      <el-menu-item index="2">
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
      </el-menu-item>
      <el-menu-item index="3">
        <User :user="user" />
      </el-menu-item>
    </el-menu>
    <nuxt-page />
    <app-footer />
  </nuxt-layout>
</template>
