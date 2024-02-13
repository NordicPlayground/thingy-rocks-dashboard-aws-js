import { createContext, type ComponentChildren } from 'preact'
import { useContext } from 'preact/hooks'
import { useDevices, type Device, DeviceType } from './Devices.js'
import { useSettings } from './Settings.js'

export const VisibleDevicesContext = createContext<Array<Device>>([])

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const { devices, lastUpdateTs, type } = useDevices()
	const {
		settings: { showFavorites, favorites },
	} = useSettings()

	const devicesToShow = [
		...Object.values(devices).filter(
			(device) => type(device.id) !== DeviceType.WIREPAS_5G_MESH_GW,
		),
		...Object.values(devices)
			.filter((device) => type(device.id) === DeviceType.WIREPAS_5G_MESH_GW)
			.map((gw) => ({ ...gw, type: DeviceType.WIREPAS_5G_MESH_GW })),
	]
		.filter((device) => {
			if (!showFavorites) return true
			return favorites.includes(device.id)
		})
		.filter((device) => {
			const ts = lastUpdateTs(device.id)
			if (ts === null) return device.history !== undefined // show devices that have history available (history will have a cut-off of 60 minutes)
			if (ts < Date.now() - 60 * 60 * 1000) return false
			return true
		})
		.sort(({ id: id1 }, { id: id2 }) => {
			if (!showFavorites)
				return (lastUpdateTs(id2) ?? 0) - (lastUpdateTs(id1) ?? 0)
			return favorites.indexOf(id1) - favorites.indexOf(id2)
		})

	return (
		<VisibleDevicesContext.Provider value={devicesToShow}>
			{children}
		</VisibleDevicesContext.Provider>
	)
}

export const useVisibleDevices = () => useContext(VisibleDevicesContext)
