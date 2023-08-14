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
        >
          <el-option
            v-for="locale in availableLocales"
            :key="locale.code"
            :label="locale.name"
            :value="locale.code"
          >
            {{ locale.flag }} {{ locale.name }}
          </el-option>
        </el-select>
      </div>
    </template>
  </el-page-header>
  <div>
    <slot />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue'
import { LocaleObject } from '@nuxtjs/i18n/dist/runtime/composables'
import { User } from '~/libs/apiTypes'
import { useI18n } from '#imports'

export default defineNuxtComponent({
  name: 'Layout',

  props: {
    user: {
      type: Object as PropType<User | null>,
      default: null,
    },
  },

  data(): {
    locale: string
  } {
    return {
      locale: useI18n().locale.value,
    }
  },

  watches: {
    locale() {
      useI18n().setLocale(this.locale)
    },
  },

  computed: {
    availableLocales(): LocaleObject[] {
      return useI18n().locales.value as LocaleObject[]
    },
  },

  methods: {
    back() {
      this.$router.push('/')
    },
  },
})
</script>
