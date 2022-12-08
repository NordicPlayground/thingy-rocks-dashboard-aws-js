import type { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity'
import type { GeoJSONSource, LngLatLike } from 'maplibre-gl'
import { Map as MapLibreGlMap } from 'maplibre-gl'
import { ComponentChildren, createContext } from 'preact'
import { useContext } from 'preact/hooks'
import { locationSourceColors } from '../colors'
import { geoJSONPolygonFromCircle } from '../map/geoJSONPolygonFromCircle'
import { mapStyle } from '../map/style'
import { transformRequest } from '../map/transformRequest'
import { captureMessage } from '../sentry'
import type { GeoLocation } from './Devices'
import { LocationSourceLabels } from './LocationSourceLabels'

export const MapContext = createContext<DeviceMap>(undefined as any)

export const Consumer = MapContext.Consumer

export const useMap = () => useContext(MapContext)

type DeviceMap = {
	showDeviceLocation: (args: {
		deviceId: string
		location: GeoLocation
		hidden?: boolean
	}) => void
	center: (center: GeoLocation) => void
	// Show a large view of the entire world
	showWorld: () => void
}

// See https://docs.aws.amazon.com/location/latest/developerguide/esri.html for available fonts
const glyphFonts = {
	regular: 'Ubuntu Regular',
	bold: 'Ubuntu Medium',
} as const

/**
 * The `map` parameter is potentially undefined,
 * because it sometimes happens that the map instance is no longer available
 */
const deviceMap = (map: MapLibreGlMap | undefined): DeviceMap => {
	const isLoaded = new Promise((resolve) => map?.on('load', resolve))
	const centerOnDeviceZoomLevel = 12
	return {
		showDeviceLocation: async ({
			deviceId,
			location: { source, lat, lng, accuracy },
			hidden,
		}) => {
			if (map === undefined) {
				captureMessage(`Map is not available.`)
				return
			}

			await isLoaded

			const locationAreaBaseId = `${deviceId}-location-${source}-area`

			const locationAreaSourceId = `${locationAreaBaseId}-source`
			const centerSourceId = `${locationAreaBaseId}-center`
			const areaSource = map.getSource(locationAreaSourceId)

			const areaLayerId = `${locationAreaBaseId}-circle`
			const areaLayerLabelId = `${locationAreaBaseId}-label`
			const centerLabelId = `${locationAreaBaseId}-deviceId-label`

			if (areaSource === undefined) {
				if (hidden === true) {
					// Don't add
					return
				}
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

				// Center the map on the coordinates of any clicked symbol from the layer.
				map.on('click', centerLabelId, (e) => {
					const center = (
						e.features?.[0]?.geometry as { coordinates: LngLatLike } | undefined
					)?.coordinates

					if (center === undefined) return

					map.flyTo({
						center,
						zoom: centerOnDeviceZoomLevel,
					})
				})

				// Change the cursor to a pointer when the it enters a feature in the layer.
				map.on('mouseenter', centerLabelId, () => {
					map.getCanvas().style.cursor = 'pointer'
				})

				// Change it back to a pointer when it leaves.
				map.on('mouseleave', centerLabelId, () => {
					map.getCanvas().style.cursor = ''
				})
			} else {
				if (hidden === true) {
					// Remove
					if (map.getLayer(areaLayerId) !== undefined)
						map.removeLayer(areaLayerId)
					if (map.getLayer(areaLayerLabelId) !== undefined)
						map.removeLayer(areaLayerLabelId)
					if (map.getLayer(centerLabelId) !== undefined)
						map.removeLayer(centerLabelId)
					map.removeSource(locationAreaSourceId)
					if (map.getSource(centerSourceId) !== undefined)
						map.removeSource(centerSourceId)

					return
				}
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
		center: (center) =>
			map?.flyTo({ center: center, zoom: centerOnDeviceZoomLevel }),
		showWorld: () =>
			map?.flyTo({ center: [-33.96763064206279, 55.051422964953545], zoom: 2 }),
	}
}

export const Provider = ({
	children,
	credentials,
}: {
	children: ComponentChildren
	credentials: CognitoIdentityCredentials
}) => {
	const map = new MapLibreGlMap({
		container: 'map',
		style: mapStyle({
			region: REGION,
			mapName: MAP_NAME,
		}),
		center: [10.437581513483195, 63.42148461054351],
		zoom: 12,
		transformRequest: transformRequest(credentials),
	})

	return (
		<MapContext.Provider value={deviceMap(map)}>{children}</MapContext.Provider>
	)
}
