<template>
  <el-page-header @back="back">
    <template #content>
      <div class="flex items-right">
        <User :user="user" />

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
            :label="getFlagEmoji(locale.flag) + ' ' + locale.name"
            :value="locale.code"
            :fit-input-width="true"
          />
        </el-select>
      </div>
    </template>
  </el-page-header>
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

<script lang="ts">
import { PropType } from 'vue'
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables'
import { User } from '~/libs/apiTypes'

export default defineNuxtComponent({
  name: 'Layout',

  props: {
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
    back() {
      this.$router.push('/')
    },

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
