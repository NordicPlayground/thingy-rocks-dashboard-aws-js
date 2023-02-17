import { useEffect } from 'preact/hooks'
import { GeoLocationSource, useDevices } from '../context/Devices'
import { useMap } from '../context/Map'

export const DeviceLocations = () => {
	const { devices, alias } = useDevices()
	const map = useMap()

	useEffect(() => {
		if (map === undefined) return
		for (const [deviceId, { location, hiddenLocations }] of Object.entries(
			devices,
		)) {
			if (location === undefined) continue
			for (const l of Object.values(location)) {
				const deviceAlias = alias(deviceId)
				map.showDeviceLocation({
					deviceId,
					deviceAlias: deviceAlias ?? deviceId,
					location: l,
					hidden: hiddenLocations?.[l.source] ?? false,
				})
			}
		}

		map.showDeviceLocation({
			deviceId: 'demo5Gmesh_gw01',
			deviceAlias: 'Wirepas5GMeshGateway',
			location: {
				accuracy: 5,
				lat: 41.35454978519988,
				lng: 2.1280827507972053,
				source: GeoLocationSource.FIXED,
			},
		})
	}, [devices, map])

	return null
}
