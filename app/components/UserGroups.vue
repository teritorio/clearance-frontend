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
  showMap?: boolean
  showSelectors?: boolean
}>()

const runtimeConfig = useRuntimeConfig()
const colors = ['#2364AA', '#EA7317', '#73BFB8', '#FEC601', '#3DA5D9']

const mapContainer = useTemplateRef<HTMLDivElement>('mapContainer')
const mapLoaded = ref(false)

onMounted(() => {
  if (props.showMap === false) {
    return
  }

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
    <div v-show="showMap !== false" class="map-wrapper">
      <div v-if="!mapLoaded && showMap !== false" class="map-skeleton" />
      <div ref="mapContainer" class="map" :class="{ 'map-hidden': !mapLoaded }" />
    </div>
    <el-table :data="groups" stripe size="small" style="width: 100%">
      <!-- Group name -->
      <el-table-column :label="$t('project.user_group_label')" min-width="180">
        <template #default="{ row }">
          <span class="group-name-cell">
            <span class="group-dot" :style="{ background: row.color }" />
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

      <!-- Selectors -->
      <el-table-column v-if="showSelectors" :label="$t('validators.osmTags')" min-width="220">
        <template #default="{ row }">
          <div class="chips-cell">
            <code
              v-for="sel in (row.select ?? [])"
              :key="sel"
              class="selector-chip"
            >{{ sel }}</code>
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

.selector-chip {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--el-fill-color-dark);
  color: var(--el-text-color-regular);
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  white-space: nowrap;
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
