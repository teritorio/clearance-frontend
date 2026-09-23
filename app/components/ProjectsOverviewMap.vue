<script setup lang="ts">
import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson'
import type { CircleLayerSpecification, FillLayerSpecification, LineLayerSpecification } from 'maplibre-gl'
import type { InitializedProject } from '~/libs/types'
import bbox from '@turf/bbox'
import { FullscreenControl, LngLatBounds, Map } from 'maplibre-gl'

const props = defineProps<{
  projects: InitializedProject[]
}>()

const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const { locale } = useI18n()

const PROJECT_COLORS = ['#2364AA', '#EA7317', '#73BFB8', '#FEC601', '#3DA5D9', '#E63946', '#2A9D8F', '#E9C46A']

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
const mapLoaded = ref(false)

let map: Map | undefined

const { updateCoopGestureLocale } = useCoopGestureLocale(() => map)

function getTitle(project: InitializedProject): string {
  const m = project.title
  return m[locale.value] || m.en || Object.values(m).find((v) => !!v) || project.id
}

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  // Start polygon fetches and map init in parallel
  const polygonsPromise = Promise.all(
    props.projects.map((project, projectIndex) => {
      const color = PROJECT_COLORS[projectIndex % PROJECT_COLORS.length]!
      const polygonUrls = Object.values(project.user_groups)
        .filter((ug) => !!ug.polygon)
        .map((ug) => ug.polygon!)

      return Promise.all(
        polygonUrls.map((url) =>
          fetch(url)
            .then(async (r) => {
              if (r.ok) {
                return { geometry: await r.json() as Polygon | MultiPolygon, ok: true as const }
              }
              return { ok: false as const }
            })
            .catch(() => ({ ok: false as const })),
        ),
      ).then((results) => {
        const features: Feature<Polygon | MultiPolygon>[] = results
          .filter((r): r is { geometry: Polygon | MultiPolygon, ok: true } => r.ok)
          .map((r) => ({
            type: 'Feature' as const,
            geometry: r.geometry,
            properties: { color, projectId: project.id, title: getTitle(project) },
          }))
        return { project, color, features }
      })
    }),
  )

  map = new Map({
    container: mapContainer.value,
    style: runtimeConfig.public.mapStyleUrl as string,
    cooperativeGestures: true,
    attributionControl: false,
    center: [0, 20],
    zoom: 1,
  })

  map.once('load', () => {
    if (!map) {
      return
    }
    updateCoopGestureLocale()
    mapLoaded.value = true
    map.addControl(new FullscreenControl())

    polygonsPromise.then((projectData) => {
      if (!map) {
        return
      }
      const m = map
      const allFeatures = projectData.flatMap((d) => d.features)
      const geojson: FeatureCollection = { type: 'FeatureCollection', features: allFeatures }

      if (geojson.features.length > 0) {
        m.fitBounds(new LngLatBounds(bbox(geojson) as [number, number, number, number]), { maxZoom: 8, padding: 50, animate: false })
      }

      m.addSource('projects', { type: 'geojson', data: geojson })
      m.addLayer({
        id: 'projectsFill',
        type: 'fill',
        source: 'projects',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.15,
        },
      } as FillLayerSpecification)
      m.addLayer({
        id: 'projectsBorder',
        type: 'line',
        source: 'projects',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
        },
      } as LineLayerSpecification)

      const pins: Feature<Point>[] = projectData
        .filter(({ features }) => features.length > 0)
        .map(({ project, color, features }) => {
          const fc: FeatureCollection = { type: 'FeatureCollection', features }
          const [minLon, minLat, maxLon, maxLat] = bbox(fc) as [number, number, number, number]
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [(minLon + maxLon) / 2, (minLat + maxLat) / 2] },
            properties: { color, projectId: project.id },
          }
        })

      m.addSource('projectPins', { type: 'geojson', data: { type: 'FeatureCollection', features: pins } })
      m.addLayer({
        id: 'projectPins',
        type: 'circle',
        source: 'projectPins',
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#fff',
        },
      } as CircleLayerSpecification)

      m.on('mouseenter', 'projectPins', () => {
        m.getCanvas().style.cursor = 'pointer'
      })
      m.on('mouseleave', 'projectPins', () => {
        m.getCanvas().style.cursor = ''
      })
      m.on('click', 'projectPins', (e) => {
        const projectId = e.features?.[0]?.properties?.projectId
        if (projectId) {
          router.push(`/${projectId}/changes_logs`)
        }
      })
    })
  })
})
</script>

<template>
  <div class="map-wrapper">
    <div v-if="!mapLoaded" class="map-skeleton" />
    <div ref="mapContainer" class="map" :class="{ 'map-hidden': !mapLoaded }" />
  </div>
</template>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  isolation: isolate;
  margin-bottom: 1.5rem;
}

.map {
  width: 100%;
  height: 100%;
}

.map-hidden {
  visibility: hidden;
}

.map-skeleton {
  position: absolute;
  inset: 0;
  background: #f2efe9;
}
</style>
