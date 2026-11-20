import type { MultiPolygon, Polygon } from 'geojson'

export function fetchPolygon(url: string): Promise<Polygon | MultiPolygon | undefined> {
  return fetch(url)
    .then(async (r) => {
      if (r.ok) {
        const json = await r.json()
        if (json?.type === 'Polygon' || json?.type === 'MultiPolygon') {
          return json as Polygon | MultiPolygon
        }
      }
      return undefined
    })
    .catch(() => undefined)
}
