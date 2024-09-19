<script lang="ts">
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type {
  FillLayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl'
import bbox from '@turf/bbox'
import {
  LngLatBounds,
  Map,
} from 'maplibre-gl'
import _ from 'underscore'
import type { UserGroup } from '~/libs/types'

const colors = ['#2364AA', '#EA7317', '#73BFB8', '#FEC601', '#3DA5D9']

export default defineNuxtComponent({
  name: 'UserGroup',

  props: {
    userGroups: {
      type: Object as PropType<UserGroup[]>,
      required: true,
    },
  },

  setup() {
    const mapContainer = shallowRef(null)
    return { mapContainer }
  },

  mounted() {
    const fetchAllPolygons: Promise<
      Feature<Polygon | MultiPolygon> | undefined
    >[] = this.userGroups
      .map((userGroup, index) => {
        return {
          ...userGroup,
          color: colors[index % colors.length],
        }
      })
      .filter((userGroup) => !!userGroup.polygon)
      .map((userGroup) => {
        return fetch(userGroup.polygon!).then(async (data) => {
          if (data.ok) {
            const geojson: Feature<Polygon | MultiPolygon> = {
              type: 'Feature',
              geometry: await data.json(),
              properties: { color: userGroup.color },
            }
            return Promise.resolve(geojson)
          }
        })
      })

    Promise.all(fetchAllPolygons).then((allPolygons) => {
      const geojson = {
        type: 'FeatureCollection',
        features: _.compact(allPolygons),
      } as FeatureCollection
      const bounds = new LngLatBounds(
        bbox(geojson) as [number, number, number, number],
      )

      const map = new Map({
        container: this.mapContainer!,
        style:
          'https://vecto.teritorio.xyz/styles/teritorio-basic/style.json?key=teritorio_clearance-1-ahNoohaepohy9iexoo3qua',
        bounds,
        fitBoundsOptions: { maxZoom: 20, padding: 50 },
        cooperativeGestures: true,
        attributionControl: false,
      })

      map.on('load', () => {
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
  },

  computed: {
    groups() {
      return Object.values(this.userGroups).map((userGroup, index) => {
        return {
          ...userGroup,
          color: colors[index % colors.length],
        }
      })
    },
  },
})
</script>

<template>
  <el-row>
    <el-col :span="12">
      <el-table :data="groups" stripe style="width: 100%">
        <el-table-column prop="id" width="30">
          <template #default="scope">
            <span :style="`color:${scope.row.color}`">⬤</span>
          </template>
        </el-table-column>
        <el-table-column prop="id" :label="$t('project.user_group_label')">
          <template #default="scope">
            {{ useI18nHash(scope.row.title) }}
          </template>
        </el-table-column>
        <el-table-column prop="id" :label="$t('project.user_group_users')">
          <template #default="scope">
            <span v-for="user in scope.row.users" :key="user" class="user">
              <a
                :href="`https://www.openstreetmap.org/user/${user}`"
                target="_blank"
              >👤&nbsp;{{ user }}</a>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col :span="12">
      <div
        ref="mapContainer"
        class="map"
        style="width: 400px; height: 400px; margin: 0 auto;"
      />
    </el-col>
  </el-row>
</template>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>

<style scoped>
.user + .user {
  margin-left: 0.5em;
}
</style>
