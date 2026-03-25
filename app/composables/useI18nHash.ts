import type { MultilingualString } from '~/libs/types'

export function useI18nHash(messages: MultilingualString): string | undefined {
  const { locale } = useI18n()

  return (messages != null && (messages[locale.value] || messages.en)) || undefined
}
