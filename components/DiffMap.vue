<script setup lang="ts">
import type { Geometry } from 'geojson'
import type {
  CircleLayerSpecification,
  LineLayerSpecification,
  LngLatLike,
} from 'maplibre-gl'
import bbox from '@turf/bbox'
import booleanEqual from '@turf/boolean-equal'
import {
  FullscreenControl,
  LngLatBounds,
  Map,
} from 'maplibre-gl'

const props = defineProps<{
  baseGeom?: Geometry[]
  changeGeom?: Geometry[]
}>()

//
// Data
//
const mapContainerRef = shallowRef<InstanceType<typeof HTMLDivElement>>()
const noChanges = ref(false)
const bounds = ref<LngLatBounds>()
const geometries = ref<Geometry[]>()

//
// Hooks
//
onMounted(() => {
  if (mapContainerRef.value) {
    const map = new Map({
      container: mapContainerRef.value,
      style:
      'https://vecto.teritorio.xyz/styles/teritorio-basic/style.json?key=teritorio_clearance-1-ahNoohaepohy9iexoo3qua',
      bounds: bounds.value,
      fitBoundsOptions: { maxZoom: 17, padding: 50 },
      cooperativeGestures: true,
      attributionControl: false,
    })

    map.addControl(new FullscreenControl())

    map.on('load', () => {
      if (props.baseGeom) {
        map.addSource('baseGeom', {
          type: 'geojson',
          data: {
            type: 'GeometryCollection',
            geometries: props.baseGeom,
          },
        })
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
            'circle-color': noChanges.value ? '#F0F0F0' : '#FF0000',
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
            'line-color': noChanges.value ? '#F0F0F0' : '#FF0000',
            'line-width': 3,
          },
        } as LineLayerSpecification)
      }

      if (props.changeGeom && !noChanges.value) {
        map.addSource('changeGeom', {
          type: 'geojson',
          data: {
            type: 'GeometryCollection',
            geometries: props.changeGeom,
          },
        })
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
  }
})

if (props.baseGeom?.length && props.changeGeom?.length) {
  noChanges.value = (props.baseGeom.length === 1 && props.changeGeom.length === 1)
  && (
    props.baseGeom[0] === props.changeGeom[0]
    || booleanEqual(props.baseGeom[0], props.changeGeom[0])
  )

  geometries.value = (props.baseGeom || props.changeGeom).concat(props.changeGeom)

  bounds.value = new LngLatBounds(bbox({
    type: 'GeometryCollection',
    geometries: geometries.value,
  }) as unknown as LngLatLike)
}
</script>

<template>
  <div ref="mapContainerRef" class="map" style="width: 100%; height: 200px" />
</template>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>
