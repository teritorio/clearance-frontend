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
import { fetchPolygon } from '~/libs/fetchPolygon'

const props = withDefaults(defineProps<{
  userGroups: UserGroup[]
  showMap?: boolean
}>(), {
  showMap: true,
})

const runtimeConfig = useRuntimeConfig()
const colors = ['#2364AA', '#EA7317', '#73BFB8', '#FEC601', '#3DA5D9']

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
const mapLoaded = ref(false)

let map: Map | undefined

const { updateCoopGestureLocale } = useCoopGestureLocale(() => map)

onMounted(async () => {
  if (props.showMap === false) {
    return
  }

  await nextTick()

  if (!mapContainer.value) {
    return
  }

  type ColoredGroup = UserGroup & { color: string }
  const coloredGroups: ColoredGroup[] = props.userGroups.map((userGroup: UserGroup, index: number) => ({
    ...userGroup,
    color: colors[index % colors.length]!,
  }))

  // Start polygon fetches and map init in parallel
  const polygonsPromise: Promise<(Feature<Polygon | MultiPolygon> | undefined)[]> = Promise.all(
    coloredGroups
      .filter((userGroup) => !!userGroup.polygon)
      .map((userGroup) => {
        return fetchPolygon(userGroup.polygon!).then((geometry) => {
          if (!geometry) {
            return undefined
          }
          return {
            type: 'Feature',
            geometry,
            properties: { color: userGroup.color },
          } as Feature<Polygon | MultiPolygon>
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

  map.once('load', updateCoopGestureLocale)

  const mapLoadPromise = new Promise<void>((resolve) => map!.once('load', resolve))

  // Show the map as soon as the style loads, without waiting for polygon fetches
  mapLoadPromise.then(() => {
    mapLoaded.value = true
  }).catch(() => {})

  Promise.all([mapLoadPromise, polygonsPromise]).then(([, allPolygons]) => {
    if (!map) {
      return
    }
    const geojson = {
      type: 'FeatureCollection',
      features: _.compact(allPolygons),
    } as FeatureCollection

    if (geojson.features.length > 0) {
      map.resize()
      map.fitBounds(new LngLatBounds(bbox(geojson) as [number, number, number, number]), { maxZoom: 20, padding: 50, animate: false })
    }

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
  }).catch(() => {
    // polygon fetches failed, map is already visible
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
    <div v-show="showMap !== false" class="map-wrapper">
      <div v-if="!mapLoaded" class="map-skeleton" />
      <div ref="mapContainer" class="map" :class="{ 'map-hidden': !mapLoaded }" />
    </div>
    <el-table :data="groups" border size="small" style="width: 100%">
      <!-- Group name -->
      <el-table-column :label="$t('project.user_group_label')" min-width="180">
        <template #default="{ row }">
          <span class="group-name-cell">
            <el-tooltip :content="useI18nHash(row.title)" placement="top" :show-after="300">
              <span class="group-dot" :style="{ background: row.color }" />
            </el-tooltip>
            {{ useI18nHash(row.title) }}
          </span>
        </template>
      </el-table-column>

      <!-- Users -->
      <el-table-column :label="$t('project.user_group_users')" min-width="220">
        <template #default="{ row }">
          <div class="chips-cell">
            <a
              v-for="user in row.users"
              :key="user"
              :href="`https://www.openstreetmap.org/user/${user}`"
              target="_blank"
              class="user-chip"
            >{{ user }}</a>
          </div>
        </template>
      </el-table-column>
    </el-table>
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

.group-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.group-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chips-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.user-chip {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 0.75rem;
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
  background: #f2efe9;
}
</style>
