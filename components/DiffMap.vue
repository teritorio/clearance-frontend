<template>
  <div ref="mapContainer" class="map" style="width: 100%; height: 200px"></div>
</template>

<script lang="ts">
import { PropType, shallowRef } from 'vue'
import GeoJSON from 'geojson'
import {
  CircleLayerSpecification,
  LineLayerSpecification,
  LngLatBounds,
  Map,
  FullscreenControl,
} from 'maplibre-gl'
import bbox from '@turf/bbox'
import booleanEqual from '@turf/boolean-equal'
import { ObjType } from '~/libs/types'

export default defineNuxtComponent({
  name: 'DiffMap',

  props: {
    objtype: {
      type: String as PropType<ObjType>,
      required: true,
    },
    id: {
      type: Number as PropType<number>,
      required: true,
    },
    baseGeom: {
      type: Object as PropType<GeoJSON.Geometry>,
      default: undefined,
    },
    changeGeom: {
      type: Object as PropType<GeoJSON.Geometry>,
      default: undefined,
    },
  },

  setup() {
    const mapContainer = shallowRef(null)
    return { mapContainer }
  },

  mounted() {
    const noChanges =
      this.baseGeom === this.changeGeom ||
      (this.baseGeom &&
        this.changeGeom &&
        booleanEqual(this.baseGeom, this.changeGeom))

    const bounds = new LngLatBounds(
      // @ts-ignore
      bbox({
        type: 'GeometryCollection',
        geometries: [this.baseGeom, this.changeGeom].filter(
          (e) => e !== undefined
        ),
      })
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
    map.addControl(new FullscreenControl())

    map.on('load', () => {
      if (this.baseGeom) {
        map.addSource('baseGeom', { type: 'geojson', data: this.baseGeom })
        // Point
        map.addLayer({
          id: 'baseGeomCircleBorder',
          type: 'circle',
          source: 'baseGeom',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-color': '#000',
            'circle-radius': 10,
          },
        } as CircleLayerSpecification)
        map.addLayer({
          id: 'baseGeomCircle',
          type: 'circle',
          source: 'baseGeom',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-color': noChanges ? '#F0F0F0' : '#FF0000',
            'circle-radius': 8,
          },
        } as CircleLayerSpecification)
        // Linestring
        map.addLayer({
          id: 'baseGeomLineBorder',
          type: 'line',
          source: 'baseGeom',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#000',
            'line-width': 4,
          },
        } as LineLayerSpecification)
        map.addLayer({
          id: 'baseGeomLine',
          type: 'line',
          source: 'baseGeom',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': noChanges ? '#F0F0F0' : '#FF0000',
            'line-width': 3,
          },
        } as LineLayerSpecification)
      }

      if (this.changeGeom && !noChanges) {
        map.addSource('changeGeom', { type: 'geojson', data: this.changeGeom })
        // Point
        map.addLayer({
          id: 'changeGeomCircleBorder',
          type: 'circle',
          source: 'changeGeom',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-color': '#000',
            'circle-radius': 12,
          },
        } as CircleLayerSpecification)
        map.addLayer({
          id: 'changeGeomCircle',
          type: 'circle',
          source: 'changeGeom',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-color': '#FFBB00',
            'circle-radius': 10,
          },
        } as CircleLayerSpecification)
        // Linestring
        map.addLayer({
          id: 'changeGeomLineBorder',
          type: 'line',
          source: 'changeGeom',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#000',
            'line-width': 6,
          },
        } as LineLayerSpecification)
        map.addLayer({
          id: 'changeGeomLine',
          type: 'line',
          source: 'changeGeom',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#FFBB00',
            'line-width': 5,
          },
        } as LineLayerSpecification)
      }
    })
  },
})
</script>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>
