import type { Map } from 'maplibre-gl'

export function useCoopGestureLocale(getMap: () => Map | undefined) {
  const { locale, t } = useI18n()

  function updateCoopGestureLocale() {
    const map = getMap()
    if (!map) {
      return
    }
    // MapLibre v4+ has no public locale setter — setCooperativeGestures() was removed
    // in v4.0.0 with no replacement (see maplibre/maplibre-gl-js#5307). Mutating the
    // private _locale field then cycling disable/enable is the only workaround until
    // a public API is restored upstream.
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
