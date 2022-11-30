import type { GeoJSONSource, Map as MapLibreGlMap } from 'maplibre-gl'
import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import { locationSourceColors } from '../colors'
import { geoJSONPolygonFromCircle } from '../map/geoJSONPolygonFromCircle'
import { GeoLocation, GeoLocationSource } from './Devices'

export const MapContext = createContext<DeviceMap>(undefined as any)

export const Consumer = MapContext.Consumer

export const useMap = () => useContext(MapContext)

type DeviceMap = {
	showDeviceLocation: (args: {
		deviceId: string
		location: GeoLocation
	}) => void
}

export const deviceMap = (map: MapLibreGlMap): DeviceMap => {
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
						'text-font': ['Ubuntu Regular'],
					},
					paint: {
						'text-color': locationSourceColors[source],
						'text-halo-color': '#222222',
						'text-halo-width': 2,
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
						'text-font': ['Ubuntu Medium'],
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
	}
}

const LocationSourceLabels = {
	[GeoLocationSource.GNSS]: 'GNSS',
	[GeoLocationSource.MULTI_CELL]: 'multi-cell',
	[GeoLocationSource.SINGLE_CELL]: 'single-cell',
	[GeoLocationSource.WIFI]: 'WiFi',
}
