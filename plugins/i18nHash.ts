import type { MultilingualString } from '~/libs/types'

export default defineNuxtPlugin((_nuxtApp) => {
  return {
    provide: {
      i18nHash: (messages: MultilingualString): string | undefined => {
        const i18n = useI18n()
        return (
          (messages != null && (messages[i18n.locale.value] || messages.en))
          || undefined
        )
      },
    },
  }
})
