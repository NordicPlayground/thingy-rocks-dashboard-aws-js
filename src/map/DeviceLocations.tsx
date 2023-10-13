import { useEffect } from 'preact/hooks'
import { useDevices } from '../context/Devices.js'
import { useMap } from '../context/Map.js'

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
	}, [devices, map])

	return null
}
