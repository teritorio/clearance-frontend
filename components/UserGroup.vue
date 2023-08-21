<template>
  <el-card style="width: 250px; margin: 7px">
    <template #header>
      <div class="card-header">
        <span>{{ userGroup.title.en || userGroup.title.fr }}</span>
      </div>
    </template>
    <span v-for="user in userGroup.users" :key="user">👤&nbsp;{{ user }}</span>
    <div
      ref="mapContainer"
      class="map"
      style="width: 200px; height: 200px"
    ></div>
  </el-card>
</template>

<script lang="ts">
import {
  FillLayerSpecification,
  LineLayerSpecification,
  LngLatBounds,
  Map,
} from 'maplibre-gl'
import GeoJSON from 'geojson'
import { UserGroup } from '~/libs/types'

export default defineNuxtComponent({
  name: 'UserGroup',

  props: {
    userGroup: {
      type: Object as PropType<UserGroup>,
      default: null,
    },
  },

  setup() {
    const mapContainer = shallowRef(null)
    return { mapContainer }
  },

  mounted() {
    if (this.userGroup.polygon) {
      fetch(this.userGroup.polygon).then((data) => {
        if (data.ok) {
          return data
            .json()
            .then((geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon) => {
              const seed = (
                geojson.type === 'Polygon'
                  ? geojson.coordinates[0][0]
                  : geojson.coordinates[0][0][0]
              ) as [number, number]
              const bounds: LngLatBounds | undefined = geojson.coordinates
                .flat(geojson.type === 'Polygon' ? 1 : 2)
                .reduce((bounds, coord) => {
                  return bounds.extend(coord as [number, number])
                }, new LngLatBounds(seed, seed))

              const map = new Map({
                container: this.mapContainer!,
                style:
                  'https://vecto.teritorio.xyz/styles/teritorio-basic/style.json?key=teritorio_clearance-1-ahNoohaepohy9iexoo3qua',
                bounds,
                fitBoundsOptions: { maxZoom: 20, padding: 50 },
                cooperativeGestures: true,
              })

              map.on('load', () => {
                map.addSource('geojson', { type: 'geojson', data: geojson })

                map.addLayer({
                  id: 'geojsonFill',
                  type: 'fill',
                  source: 'geojson',
                  filter: ['==', '$type', 'Polygon'],
                  paint: {
                    'fill-color': '#333',
                    'fill-opacity': 0.3,
                  },
                } as FillLayerSpecification)
                map.addLayer({
                  id: 'geojsonBorder',
                  type: 'line',
                  source: 'geojson',
                  filter: ['==', '$type', 'Polygon'],
                  paint: {
                    'line-color': '#777',
                    'line-width': 2,
                  },
                } as LineLayerSpecification)
              })
            })
        }
      })
    }
  },
})
</script>

<style scoped>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>
