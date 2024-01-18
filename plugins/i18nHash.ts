import { MultilingualString } from '~/libs/types'

export default defineNuxtPlugin((_nuxtApp) => {
  return {
    provide: {
      i18nHash: (messages: MultilingualString) => {
        const i18n = useI18n()
        return messages && (messages[i18n.locale.value] || messages.en)
      },
    },
  }
})
