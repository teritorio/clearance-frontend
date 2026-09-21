import type { Map } from 'maplibre-gl'

export function useCoopGestureLocale(getMap: () => Map | undefined) {
  const { locale, t } = useI18n()

  function updateCoopGestureLocale() {
    const map = getMap()
    if (!map) {
      return
    }
    const l = (map as any)._locale as Record<string, string>
    l['CooperativeGesturesHandler.WindowsHelpText'] = t('map.gestureWindows')
    l['CooperativeGesturesHandler.MacHelpText'] = t('map.gestureMac')
    l['CooperativeGesturesHandler.MobileHelpText'] = t('map.gestureMobile')
    map.cooperativeGestures.disable()
    map.cooperativeGestures.enable()
  }

  watch(locale, updateCoopGestureLocale)

  return { updateCoopGestureLocale }
}
