import { useEffect } from 'preact/hooks'
import { GeoLocationSource, useDevices } from '../context/Devices'
import { useMap } from '../context/Map'
import { Wirepas5GMeshGatewayLocation } from './fixed-locations'

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
			deviceAlias: 'GW01',
			location: {
				...Wirepas5GMeshGatewayLocation,
				accuracy: 5,
				source: GeoLocationSource.FIXED,
			},
		})
	}, [devices, map])

	return null
}
