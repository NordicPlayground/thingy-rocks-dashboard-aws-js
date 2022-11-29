import { Signer } from '@aws-amplify/core'
import type { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity'
import { Ulid } from 'id128'
import {
	GeoJSONSourceSpecification,
	Map as MapLibreGlMap,
	RequestTransformFunction,
} from 'maplibre-gl'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { colors } from './colors'
import { useCredentials } from './context/credentials'
import { LocationSource, useDevices } from './context/Devices'

const region = COGNITO_IDENTITY_POOL_ID.split(':')[0] as string

const StyledMap = styled.div`
	position: absolute;
	height: 100vh;
	width: 100vw;
	top: 0;
	left: 0;
	z-index: -1000;
`

/**
 * GeoJSON has no support for circles, so they have to be expressed as polygons.
 */
const geoJSONPolygonFromCircle = (
	center: [lng: number, lat: number],
	radiusMeters: number,
	corners = 6,
	rotation = 0,
): GeoJSONSourceSpecification => {
	const coords = {
		latitude: center[1],
		longitude: center[0],
	}

	const km = radiusMeters / 1000

	const ret = []
	const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180))
	const distanceY = km / 110.574

	let theta, x, y
	for (let i = 0; i < corners; i++) {
		theta = (i / corners) * (2 * Math.PI) + rotation
		x = distanceX * Math.cos(theta)
		y = distanceY * Math.sin(theta)

		ret.push([coords.longitude + x, coords.latitude + y])
	}
	ret.push(ret[0])

	return {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: {
						type: 'Polygon',
						coordinates: [ret],
					},
				},
			],
		},
	}
}

const transformRequest = (
	credentials: CognitoIdentityCredentials,
): RequestTransformFunction => {
	return (url: string, resourceType?: string) => {
		if (resourceType === 'Style' && !url.includes('://')) {
			url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`
		} else if (resourceType === 'Glyphs' && !url.includes('://')) {
			url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${url}`
		}

		if (url.includes('amazonaws.com')) {
			// only sign AWS requests (with the signature as part of the query string)
			return {
				url: Signer.signUrl(url, {
					access_key: credentials.accessKeyId,
					secret_key: credentials.secretAccessKey,
					session_token: credentials.sessionToken,
				}),
			}
		}

		return { url }
	}
}

const locationSourceColors = {
	[LocationSource.GNSS]: colors['nordic-grass'],
	[LocationSource.SINGLE_CELL]: colors['nordic-sun'],
	[LocationSource.MULTI_CELL]: colors['nordic-fall'],
	[LocationSource.WIFI]: colors['nordic-power'],
} as const

export const Map = () => {
	const { credentials } = useCredentials()
	const [id] = useState<string>(Ulid.generate().toCanonical())
	const { devices } = useDevices()
	const [map, setMap] = useState<MapLibreGlMap>()

	useEffect(() => {
		if (credentials === undefined) return

		const map = new MapLibreGlMap({
			container: id,
			style: MAP_NAME,
			center: [10.437581513483195, 63.42148461054351], // starting position [lng, lat]
			zoom: 12, // starting zoom
			transformRequest: transformRequest(credentials),
		})

		map.on('load', () => {
			setMap(map)
		})

		return () => {
			//map.remove()
			setMap(undefined)
		}
	}, [credentials, id])

	// Render device locations
	useEffect(() => {
		if (map === undefined) return

		const sources: string[] = []
		const layers: string[] = []

		for (const [deviceId, { location }] of Object.entries(devices)) {
			if (location === undefined) continue
			for (const { lat, lng, accuracy, source } of Object.values(location)) {
				const areaSourceId = `${deviceId}-location-${source}-area`
				sources.push(areaSourceId)
				map.addSource(
					areaSourceId,
					geoJSONPolygonFromCircle([lng, lat], accuracy, 6, Math.PI / 2),
				)
				// Render hexagon
				const areaLayerId = areaSourceId
				layers.push(areaLayerId)
				map.addLayer({
					id: areaLayerId,
					type: 'line',
					source: areaSourceId,
					layout: {},
					paint: {
						'line-color': locationSourceColors[source],
						'line-opacity': 1,
						'line-width': 2,
					},
				})
				// Render label on Hexagon
				const areaLayerLabelId = `${deviceId}-label-source-${source}`
				layers.push(areaLayerLabelId)
				map.addLayer({
					id: areaLayerLabelId,
					type: 'symbol',
					source: areaSourceId,
					layout: {
						'symbol-placement': 'line',
						'text-field': source,
						'text-font': ['Ubuntu Medium'],
					},
					paint: {
						'text-color': locationSourceColors[source],
						'text-halo-color': colors['nordic-dark-grey'],
						'text-halo-width': 2,
						'text-halo-blur': 1,
					},
				})
				// Render deviceID in center
				const centerSourceId = `${deviceId}-location-${source}-center`
				sources.push(centerSourceId)
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
				const centerLabelId = `${deviceId}-deviceId-${source}`
				layers.push(centerLabelId)
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
			}
		}

		return () => {
			layers.map((source) => map.removeLayer(source))
			sources.map((source) => map.removeSource(source))
		}
	}, [devices, id, map])

	return <StyledMap id={id} />
}
