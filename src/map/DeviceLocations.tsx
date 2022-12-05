import { useEffect } from 'preact/hooks'
import { useDevices } from '../context/Devices'
import { useMap } from '../context/Map'

export const DeviceLocations = () => {
	const { devices } = useDevices()
	const map = useMap()

	useEffect(() => {
		if (map === undefined) return
		for (const [deviceId, { location, hiddenLocations }] of Object.entries(
			devices,
		)) {
			if (location === undefined) continue
			for (const l of Object.values(location)) {
				map.showDeviceLocation({
					deviceId,
					location: l,
					hidden: hiddenLocations?.[l.source] ?? false,
				})
			}
		}
	}, [devices, map])

	return null
}
