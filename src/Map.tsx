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
import { useCredentials } from './context/credentials'

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

export const Map = () => {
	const { credentials } = useCredentials()
	const [id] = useState<string>(Ulid.generate().toCanonical())

	const deviceLocations = {
		'351358815341265': {
			lat: 63.42148461054351,
			lng: 10.437581513483195,
			accuracy: 2000,
			source: 'GNSS',
		},
	}

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
			for (const [deviceId, { lat, lng, accuracy }] of Object.entries(
				deviceLocations,
			)) {
				map.addSource(
					deviceId,
					geoJSONPolygonFromCircle([lng, lat], accuracy, 6, Math.PI / 2),
				)
				map.addLayer({
					id: deviceId,
					type: 'line',
					source: deviceId,
					layout: {},
					paint: {
						'line-color': '#cfdd49',
						'line-opacity': 1,
						'line-width': 2,
					},
				})
				map.addLayer({
					id: 'device-label',
					type: 'symbol',
					source: deviceId,
					layout: {
						'symbol-placement': 'point',
						'text-field': deviceId,
						'text-font': ['Ubuntu Medium'],
					},
					paint: {
						'text-color': '#cfdd49',
					},
				})
			}
		})

		return () => {
			//map.remove()
		}
	}, [credentials, id])

	return <StyledMap id={id} />
}
