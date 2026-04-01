import type { MultilingualString } from '~/libs/types'

export function useI18nHash(messages: MultilingualString): string | undefined {
  const { locale } = useI18n()

  if (messages == null) {
    return undefined
  }

  return (
    messages[locale.value]
    || messages.en
    || Object.values(messages).find((v) => !!v)
    || undefined
  )
}
