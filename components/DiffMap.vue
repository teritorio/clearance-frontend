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
const mapContainer = shallowRef(null)

//
// Hooks
//
onMounted(() => {
  const noChanges = props.baseGeom && props.changeGeom
    ? (
        props.baseGeom.length === 1 && props.changeGeom.length === 1
        && (
          props.baseGeom[0] === props.changeGeom[0]
          || (props.baseGeom && props.changeGeom && booleanEqual(props.baseGeom[0], props.changeGeom[0]))
        )
      )
    : false

  let geometries = (props.baseGeom || props.changeGeom)!

  if (props.baseGeom && props.changeGeom) {
    geometries = geometries.concat(props.changeGeom)
  }

  const bounds = new LngLatBounds(bbox({
    type: 'GeometryCollection',
    geometries,
  }) as unknown as LngLatLike)

  const map = new Map({
    container: mapContainer.value!,
    style:
      'https://vecto.teritorio.xyz/styles/teritorio-basic/style.json?key=teritorio_clearance-1-ahNoohaepohy9iexoo3qua',
    bounds,
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

    if (props.changeGeom && !noChanges) {
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
})
</script>

<template>
  <div ref="mapContainer" class="map" style="width: 100%; height: 200px" />
</template>

<style>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>
