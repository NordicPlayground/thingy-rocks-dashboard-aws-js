import type { GeoJSONSource } from 'maplibre-gl'
import { Map as MapLibreGlMap } from 'maplibre-gl'
import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { locationSourceColors } from '../colors'
import { geoJSONPolygonFromCircle } from '../map/geoJSONPolygonFromCircle'
import { transformRequest } from '../map/transformRequest'
import { useCredentials } from './credentials'
import type { GeoLocation } from './Devices'
import { LocationSourceLabels } from './LocationSourceLabels'

export const MapContext = createContext<{
	map?: DeviceMap
}>({})

export const Consumer = MapContext.Consumer

export const useMap = () => useContext(MapContext)

type DeviceMap = {
	showDeviceLocation: (args: {
		deviceId: string
		location: GeoLocation
	}) => void
	center: (center: GeoLocation) => void
}

// See https://docs.aws.amazon.com/location/latest/developerguide/esri.html for available fonts
const glyphFonts = {
	regular: 'Ubuntu Regular',
	bold: 'Ubuntu Medium',
} as const

const deviceMap = (map: MapLibreGlMap): DeviceMap => {
	return {
		showDeviceLocation: ({
			deviceId,
			location: { source, lat, lng, accuracy },
		}: {
			deviceId: string
			location: GeoLocation
		}) => {
			const locationAreaBaseId = `${deviceId}-location-${source}-area`

			const locationAreaSourceId = `${locationAreaBaseId}-source`
			const centerSourceId = `${locationAreaBaseId}-center`
			const areaSource = map.getSource(locationAreaSourceId)
			if (areaSource === undefined) {
				// Create new sources and layers
				// For properties, see https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/
				// Data for Hexagon
				map.addSource(
					locationAreaSourceId,
					geoJSONPolygonFromCircle([lng, lat], accuracy, 6, Math.PI / 2),
				)
				// Center point
				map.addSource(centerSourceId, {
					type: 'geojson',
					data: {
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: [lng, lat],
						},
					},
				})
				// Render Hexagon
				const areaLayerId = `${locationAreaBaseId}-circle`
				map.addLayer({
					id: areaLayerId,
					type: 'line',
					source: locationAreaSourceId,
					layout: {},
					paint: {
						'line-color': locationSourceColors[source],
						'line-opacity': 1,
						'line-width': 2,
					},
				})
				// Render label on Hexagon
				const areaLayerLabelId = `${locationAreaBaseId}-label`
				map.addLayer({
					id: areaLayerLabelId,
					type: 'symbol',
					source: locationAreaSourceId,
					layout: {
						'symbol-placement': 'line',
						'text-field': `${deviceId} (${LocationSourceLabels[source]})`,
						'text-font': [glyphFonts.regular],
						'text-offset': [0, -1],
						'text-size': 14,
					},
					paint: {
						'text-color': locationSourceColors[source],
						'text-halo-color': '#222222',
						'text-halo-width': 1,
						'text-halo-blur': 1,
					},
				})
				// Render deviceID in center
				const centerLabelId = `${locationAreaBaseId}-deviceId-label`
				map.addLayer({
					id: centerLabelId,
					type: 'symbol',
					source: centerSourceId,
					layout: {
						'symbol-placement': 'point',
						'text-field': deviceId,
						'text-font': [glyphFonts.bold],
					},
					paint: {
						'text-color': locationSourceColors[source],
					},
				})
			} else {
				// Update existing sources
				;(areaSource as GeoJSONSource).setData(
					geoJSONPolygonFromCircle([lng, lat], accuracy, 6, Math.PI / 2)
						.data as GeoJSON.FeatureCollection,
				)
				;(map.getSource(centerSourceId) as GeoJSONSource)?.setData({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [lng, lat],
					},
				} as GeoJSON.Feature)
			}
		},
		center: (center) => map.flyTo({ center: center, zoom: 12 }),
	}
}

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const { credentials } = useCredentials()
	const mapRef = useRef<MapLibreGlMap>()
	const [map, setMap] = useState<DeviceMap>()

	useEffect(() => {
		if (credentials === undefined) return
		const map = new MapLibreGlMap({
			container: 'map',
			style: MAP_NAME,
			center: [10.437581513483195, 63.42148461054351],
			zoom: 12,
			transformRequest: transformRequest(credentials),
		})

		map.on('load', () => {
			mapRef.current = map
			setMap(deviceMap(map))
		})

		return () => {
			mapRef.current?.remove()
			setMap(undefined)
		}
	}, [credentials])

	const v: {
		map?: DeviceMap
	} = {}
	if (map !== undefined) v.map = map

	return <MapContext.Provider value={v}>{children}</MapContext.Provider>
}
