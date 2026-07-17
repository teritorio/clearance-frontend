<script setup lang="ts">
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { FillLayerSpecification, LineLayerSpecification } from 'maplibre-gl'
import type { InitializedProject } from '~/libs/types'
import bbox from '@turf/bbox'
import { LngLatBounds, Map, Marker } from 'maplibre-gl'
import _ from 'underscore'

const props = defineProps<{
  projects: InitializedProject[]
}>()

const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const { locale } = useI18n()

const PROJECT_COLORS = ['#2364AA', '#EA7317', '#73BFB8', '#FEC601', '#3DA5D9', '#E63946', '#2A9D8F', '#E9C46A']

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
const mapLoaded = ref(false)

function getTitle(project: InitializedProject): string {
  const m = project.title
  return m[locale.value] || m.en || Object.values(m).find((v) => !!v) || project.id
}

onMounted(() => {
  const projectFetches = props.projects.map((project, projectIndex) => {
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
  })

  Promise.all(projectFetches).then((projectData) => {
    if (!mapContainer.value) {
      return
    }

    const allFeatures = projectData.flatMap((d) => d.features)
    const geojson: FeatureCollection = { type: 'FeatureCollection', features: allFeatures }

    const mapOptions: ConstructorParameters<typeof Map>[0] = {
      container: mapContainer.value,
      style: runtimeConfig.public.mapStyleUrl as string,
      cooperativeGestures: true,
      attributionControl: false,
    }

    if (geojson.features.length > 0) {
      mapOptions.bounds = new LngLatBounds(bbox(geojson) as [number, number, number, number])
      mapOptions.fitBoundsOptions = { maxZoom: 8, padding: 50 }
    }
    else {
      mapOptions.center = [0, 20]
      mapOptions.zoom = 1
    }

    const map = new Map(mapOptions)

    map.on('load', () => {
      mapLoaded.value = true

      map.addSource('projects', { type: 'geojson', data: geojson })

      map.addLayer({
        id: 'projectsFill',
        type: 'fill',
        source: 'projects',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.15,
        },
      } as FillLayerSpecification)

      map.addLayer({
        id: 'projectsBorder',
        type: 'line',
        source: 'projects',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
        },
      } as LineLayerSpecification)

      projectData.forEach(({ project, color, features }) => {
        if (!features.length) {
          return
        }
        const fc: FeatureCollection = { type: 'FeatureCollection', features }
        const [minLon, minLat, maxLon, maxLat] = bbox(fc) as [number, number, number, number]
        const center: [number, number] = [(minLon + maxLon) / 2, (minLat + maxLat) / 2]

        const el = document.createElement('button')
        el.className = 'project-pin'
        el.style.setProperty('--pin-color', color)
        el.title = getTitle(project)
        el.setAttribute('aria-label', getTitle(project))
        el.addEventListener('click', () => router.push(`/${project.id}/changes_logs`))

        new Marker({ element: el }).setLngLat(center).addTo(map)
      })
    })
  })
})

const _unused = _.identity
</script>

<template>
  <div class="map-wrapper">
    <div v-if="!mapLoaded" class="map-skeleton" />
    <div ref="mapContainer" class="map" :class="{ 'map-hidden': !mapLoaded }" />
  </div>
</template>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');

.project-pin {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--pin-color);
  border: 2.5px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s;
}

.project-pin:hover {
  transform: scale(1.4);
}
</style>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 10px;
  overflow: hidden;
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
  background: linear-gradient(90deg, var(--el-fill-color) 25%, var(--el-fill-color-light) 50%, var(--el-fill-color) 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 10px;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
