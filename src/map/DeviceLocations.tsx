import { useEffect } from 'preact/hooks'
import { useDevices } from '../context/Devices.js'
import { useMap } from '../context/Map.js'
import { useSettings } from '../context/Settings.js'

export const DeviceLocations = () => {
	const { devices, alias } = useDevices()
	const {
		settings: { showFavorites, favorites },
	} = useSettings()
	const map = useMap()

	useEffect(() => {
		if (map === undefined) return
		const hiddenDevices = Object.keys(devices).filter((deviceId) => {
			if (!showFavorites) return false
			return !favorites.includes(deviceId)
		})
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
					hidden:
						hiddenDevices.includes(deviceId) ||
						(hiddenLocations?.[l.source] ?? false),
				})
			}
		}
	}, [devices, map, showFavorites, favorites])

	return null
}
