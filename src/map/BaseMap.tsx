import { Map as MapLibreGlMap } from 'maplibre-gl'
import type { ComponentChildren } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { useCredentials } from '../context/credentials'
import { deviceMap, MapContext } from '../context/Map'
import { StyledMap } from './Map'
import { transformRequest } from './transformRequest'

export const BaseMap = ({ children }: { children?: ComponentChildren }) => {
	const { credentials } = useCredentials()
	const mapRef = useRef<MapLibreGlMap>()

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
		})

		return () => {
			mapRef.current?.remove()
		}
	}, [credentials])

	if (mapRef.current === undefined) return <StyledMap id={'map'} />

	return (
		<StyledMap id={'map'}>
			<MapContext.Provider value={deviceMap(mapRef.current)}>
				{children}
			</MapContext.Provider>
		</StyledMap>
	)
}
