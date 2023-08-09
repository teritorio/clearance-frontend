<template>
  <div ref="mapContainer" class="map" style="width: 100%; height: 200px"></div>
</template>

<script lang="ts">
import { PropType, shallowRef } from 'vue'
import GeoJSON from 'geojson'
import { CircleLayerSpecification, LngLatBounds, Map } from 'maplibre-gl'
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
    createdAtBase: {
      type: String as PropType<string>,
      required: true,
    },
    createdAtChange: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup() {
    const mapContainer = shallowRef(null)
    return { mapContainer }
  },

  mounted() {
    fetch(
      'https://overpass-api.de/api/interpreter?' +
        new URLSearchParams({
          data: `[out:xml][diff:"${this.createdAtBase}","${this.createdAtChange}"];node(${this.id});out geom;`,
        })
    ).then((data) => {
      if (data.ok) {
        return data.text().then((text) => {
          const allCoordinates: [number, number][] = []
          const doc = new DOMParser().parseFromString(text, 'application/xml')
          const [baseGeom, changeGeom] = ['old', 'new'].map((action) => {
            const object = doc.evaluate(
              `/osm/action/${action}/node`,
              doc,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE
            ).singleNodeValue as Element | null
            if (object) {
              const coordinates: [number, number] = [
                Number(object.attributes.getNamedItem('lon')!.value),
                Number(object.attributes.getNamedItem('lat')!.value),
              ]
              allCoordinates.push(coordinates)
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates,
                },
                properties: {},
              } as GeoJSON.Feature
            } else {
              return [undefined, undefined]
            }
          })

          let bounds: LngLatBounds | undefined
          if (allCoordinates.length > 0) {
            bounds = allCoordinates.reduce((bounds, coord) => {
              return bounds.extend(coord)
            }, new LngLatBounds(allCoordinates[0], allCoordinates[0]))
          }

          const map = new Map({
            container: this.mapContainer,
            style:
              'https://vecto.teritorio.xyz/styles/teritorio-tourism-latest/style.json',
            bounds,
            fitBoundsOptions: { maxZoom: 20, padding: 50 },
          })

          const layout = {}
          const paint = {
            'circle-opacity': 1,
          }

          map.on('load', () => {
            map.addSource('baseGeom', { type: 'geojson', data: baseGeom })
            map.addSource('changeGeom', { type: 'geojson', data: changeGeom })
            map.addLayer({
              id: 'baseGeom',
              type: 'circle',
              source: 'baseGeom',
              layout,
              paint: {
                ...paint,
                'circle-color': '#FF0000',
                'circle-radius': 8,
              },
            } as CircleLayerSpecification)
            map.addLayer({
              id: 'changeGeom',
              type: 'circle',
              source: 'changeGeom',
              layout,
              paint: {
                ...paint,
                'circle-color': '#007700',
                'circle-radius': 10,
              },
            } as CircleLayerSpecification)
          })
        })
      }
    })
  },
})
</script>

<style scoped>
@import url('maplibre-gl/dist/maplibre-gl.css');
</style>
