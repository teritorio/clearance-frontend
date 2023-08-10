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
} from 'maplibre-gl'
import { ObjType, objTypeFull } from '~/libs/types'

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
          data: `[out:xml][diff:"${this.createdAtBase}Z","${
            this.createdAtChange
          }Z"];${objTypeFull(this.objtype)}(${this.id});out geom;`,
        })
    ).then((data) => {
      if (data.ok) {
        return data.text().then((text) => {
          let allCoordinates: [number, number][] = []
          const doc = new DOMParser().parseFromString(text, 'application/xml')
          const [baseGeom, changeGeom] = ['old', 'new'].map((action) => {
            const object = doc.evaluate(
              `/osm/action/${action}/*`,
              doc,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE
            ).singleNodeValue as Element | null
            if (object) {
              let type: string | undefined
              let coordinates: [number, number] | [number, number][] | undefined
              if (object.nodeName === 'node') {
                type = 'Point'
                coordinates = [
                  Number(object.attributes.getNamedItem('lon')!.value),
                  Number(object.attributes.getNamedItem('lat')!.value),
                ]
                allCoordinates = allCoordinates.concat([coordinates])
              } else if (object.nodeName === 'way') {
                type = 'LineString'
                doc.evaluate(`/nd`, object, null)
                const ndsObjects = doc.evaluate(`nd`, object)
                let e = ndsObjects.iterateNext() as Element | null
                coordinates = []
                while (e) {
                  coordinates.push([
                    Number(e.attributes.getNamedItem('lon')!.value),
                    Number(e.attributes.getNamedItem('lat')!.value),
                  ])
                  e = ndsObjects.iterateNext() as Element | null
                }

                allCoordinates = allCoordinates.concat(coordinates)
              }
              if (type && coordinates) {
                return {
                  type: 'Feature',
                  geometry: {
                    type,
                    coordinates,
                  },
                  properties: {},
                } as GeoJSON.Feature
              }
            }
            return [undefined, undefined]
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
              'https://vecto.teritorio.xyz/styles/teritorio-basic/style.json?key=teritorio_clearance-1-ahNoohaepohy9iexoo3qua',
            bounds,
            fitBoundsOptions: { maxZoom: 20, padding: 50 },
            cooperativeGestures: true,
          })

          map.on('load', () => {
            map.addSource('baseGeom', { type: 'geojson', data: baseGeom })
            map.addSource('changeGeom', { type: 'geojson', data: changeGeom })

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
                'circle-color': '#FF0000',
                'circle-radius': 8,
              },
            } as CircleLayerSpecification)
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
              id: 'baseGeomLine',
              type: 'line',
              source: 'baseGeom',
              filter: ['==', '$type', 'LineString'],
              paint: {
                'line-color': '#FF0000',
                'line-width': 3,
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
