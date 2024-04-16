<script lang="ts">
import type { PropType } from 'vue'
import type { LocaleObject } from '@nuxtjs/i18n'
import type { User } from '~/libs/apiTypes'

export default defineNuxtComponent({
  name: 'Layout',

  props: {
    back: {
      type: Boolean,
      default: true,
    },
    user: {
      type: Object as PropType<User | null>,
      default: null,
    },
  },

  computed: {
    availableLocales(): LocaleObject[] {
      return this.$i18n.locales as LocaleObject[]
    },

    locale(): string {
      return this.$i18n.locale
    },
  },

  methods: {
    setLocale(locale: string): void {
      this.$i18n.setLocale(locale)
    },

    // Function from https://dev.to/jorik/country-code-to-flag-emoji-a21
    getFlagEmoji(countryCode: string) {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0))
      return String.fromCodePoint(...codePoints)
    },
  },
})
</script>

<template>
  <el-menu mode="horizontal" :ellipsis="false">
    <el-menu-item v-if="back" index="0">
      <a href="/" :title="$t('app.back')">
        <img src="/favicon.svg" style="width: 6em" />
      </a>
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
          v-for="locale in availableLocales"
          :key="locale.code"
          :label="`${getFlagEmoji(locale.flag)} ${locale.name}`"
          :value="locale.code"
          :fit-input-width="true"
        />
      </el-select>
    </el-menu-item>
    <el-menu-item index="3">
      <User :user="user" />
    </el-menu-item>
  </el-menu>
  <div>
    <slot />
  </div>
  <footer>
    <p>
      {{ $t('app.attribution.data') }}
      <a href="https://www.openstreetmap.org/copyright" target="_blank">{{
        $t('app.attribution.osm')
      }}</a>
    </p>
  </footer>
</template>

<style scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
