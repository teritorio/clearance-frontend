import type { Map } from 'maplibre-gl'

export function useCoopGestureLocale(getMap: () => Map | undefined) {
  const { locale, t } = useI18n()

  function updateCoopGestureLocale() {
    const map = getMap()
    if (!map) {
      return
    }
    // MapLibre v5 has no public locale setter (Map.setLocale / _locale are private,
    // and there is no overload on cooperativeGestures.enable()). Mutating _locale
    // directly then cycling disable/enable is the only way to rebuild the overlay DOM.
    const l = (map as any)._locale as Record<string, string>
    l['CooperativeGesturesHandler.WindowsHelpText'] = t('map.gestureWindows')
    l['CooperativeGesturesHandler.MacHelpText'] = t('map.gestureMac')
    l['CooperativeGesturesHandler.MobileHelpText'] = t('map.gestureMobile')
    map.cooperativeGestures.disable()
    map.cooperativeGestures.enable()
  }

  // immediate: false — caller is responsible for the initial call (inside map.once('load'))
  watch(locale, updateCoopGestureLocale, { immediate: false })

  return { updateCoopGestureLocale }
}
