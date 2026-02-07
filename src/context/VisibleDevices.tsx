import { createContext, type ComponentChildren } from 'preact'
import { useContext } from 'preact/hooks'
import type { Device } from '../DeviceType.ts'
import { DeviceType } from '../DeviceType.ts'
import { useDevices } from './Devices.js'
import { useSettings } from './Settings.js'

export const VisibleDevicesContext = createContext<Array<Device>>([])

const one_hour_in_ms = 60 * 60 * 1000
const one_day_in_ms = 24 * one_hour_in_ms

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
			const ts = lastUpdateTs[device.id]?.getTime() ?? null
			if (ts === null) return device.history !== undefined // show devices that have history available (history will have a cut-off of 24 hours)
			if (ts < Date.now() - one_day_in_ms) return false
			return true
		})
		.sort(({ id: id1 }, { id: id2 }) => {
			if (!showFavorites)
				return (
					(lastUpdateTs[id2]?.getTime() ?? 0) -
					(lastUpdateTs[id1]?.getTime() ?? 0)
				)
			return favorites.indexOf(id1) - favorites.indexOf(id2)
		})

	return (
		<VisibleDevicesContext.Provider value={devicesToShow}>
			{children}
		</VisibleDevicesContext.Provider>
	)
}

export const useVisibleDevices = () => useContext(VisibleDevicesContext)
