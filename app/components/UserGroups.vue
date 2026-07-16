<script setup lang="ts">
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type {
  FillLayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl'
import type { UserGroup } from '~/libs/types'
import bbox from '@turf/bbox'
import {
  LngLatBounds,
  Map,
} from 'maplibre-gl'
import _ from 'underscore'

const props = defineProps<{
  userGroups: UserGroup[]
}>()

const runtimeConfig = useRuntimeConfig()
const colors = ['#2364AA', '#EA7317', '#73BFB8', '#FEC601', '#3DA5D9']

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
const mapLoaded = ref(false)

onMounted(() => {
  type ColoredGroup = UserGroup & { color: string }
  const coloredGroups: ColoredGroup[] = props.userGroups.map((userGroup: UserGroup, index: number) => ({
    ...userGroup,
    color: colors[index % colors.length]!,
  }))
  const fetchAllPolygons: Promise<
    Feature<Polygon | MultiPolygon> | undefined
  >[] = coloredGroups
    .filter((userGroup) => !!userGroup.polygon)
    .map((userGroup) => {
      return fetch(userGroup.polygon!).then(async (data) => {
        if (data.ok) {
          const geojson: Feature<Polygon | MultiPolygon> = {
            type: 'Feature',
            geometry: await data.json(),
            properties: { color: userGroup.color },
          }
          return geojson
        }
        else {
          console.error(`Failed to fetch polygon "${userGroup.polygon}": HTTP ${data.status}`)
        }
      }).catch((err) => {
        console.error(`Failed to fetch polygon "${userGroup.polygon}":`, err)
        return undefined
      })
    })

  Promise.all(fetchAllPolygons).then((allPolygons) => {
    if (!mapContainer.value) {
      return
    }

    const geojson = {
      type: 'FeatureCollection',
      features: _.compact(allPolygons),
    } as FeatureCollection

    const mapOptions: ConstructorParameters<typeof Map>[0] = {
      container: mapContainer.value,
      style: runtimeConfig.public.mapStyleUrl as string,
      cooperativeGestures: true,
      attributionControl: false,
    }

    if (geojson.features.length > 0) {
      mapOptions.bounds = new LngLatBounds(bbox(geojson) as [number, number, number, number])
      mapOptions.fitBoundsOptions = { maxZoom: 20, padding: 50 }
    }
    else {
      mapOptions.center = [0, 20]
      mapOptions.zoom = 1
    }

    const map = new Map(mapOptions)

    map.on('load', () => {
      mapLoaded.value = true
      map.addSource('geojson', { type: 'geojson', data: geojson })

      map.addLayer({
        id: 'geojsonFill',
        type: 'fill',
        source: 'geojson',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.3,
        },
      } as FillLayerSpecification)
      map.addLayer({
        id: 'geojsonBorder',
        type: 'line',
        source: 'geojson',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
        },
      } as LineLayerSpecification)
    })
  })
})

const groups = computed(() =>
  props.userGroups.map((userGroup: UserGroup, index: number) => {
    return {
      ...userGroup,
      color: colors[index % colors.length]!,
    }
  }),
)
</script>

<template>
  <div class="user-groups">
    <ul class="group-list">
      <li v-for="(group, index) in groups" :key="index" class="group-row">
        <span class="group-dot" :style="{ background: group.color }" />
        <span class="group-name">{{ useI18nHash(group.title) }}</span>
        <span class="group-users">
          <a
            v-for="user in group.users"
            :key="user"
            :href="`https://www.openstreetmap.org/user/${user}`"
            target="_blank"
            class="user-chip"
          >{{ user }}</a>
        </span>
      </li>
    </ul>
    <div class="map-wrapper">
      <div v-if="!mapLoaded" class="map-skeleton" />
      <div ref="mapContainer" class="map" :class="{ 'map-hidden': !mapLoaded }" />
    </div>
  </div>
</template>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>

<style scoped>
.user-groups {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.group-row:nth-child(odd) {
  background: var(--el-fill-color-lighter);
}

.group-dot {
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 2px;
}

.group-name {
  flex-shrink: 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 120px;
  max-width: 180px;
}

.group-users {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.user-chip {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  text-decoration: none;
  font-size: 0.75rem;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.user-chip:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
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
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
