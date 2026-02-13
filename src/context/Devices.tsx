import { merge } from 'lodash-es'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useMemo, useState } from 'preact/hooks'
import {
	GeoLocationSource,
	isNordicNrplus,
	isNRPlusGateway,
	isWirepasGateway,
	type Device,
	type Devices,
	type DeviceType,
	type GeoLocation,
	type Reported,
	type Summary,
	type WirepasGateway,
} from '../DeviceType.ts'

export const DevicesContext = createContext<{
	devices: Devices
	updateState: (deviceId: string, reported: Reported) => void
	updateLocation: (
		deviceId: string,
		location: GeoLocation,
		originalSource: string,
	) => void
	updateHistory: (deviceId: string, history: Summary) => void
	updateAlias: (deviceId: string, alias: string) => void
	updateType: (deviceId: string, type: DeviceType) => void
	updateVideoStream: (deviceId: string, stream: string) => void
	lastUpdateTs: Record<string, Date | undefined>
	alias: (deviceId: string) => string | undefined
	type: (deviceId: string) => DeviceType | undefined
	videoStream: (deviceId: string) => string | undefined
}>({
	updateState: () => undefined,
	updateLocation: () => undefined,
	updateHistory: () => undefined,
	updateAlias: () => undefined,
	updateVideoStream: () => undefined,
	alias: () => undefined,
	updateType: () => undefined,
	type: () => undefined,
	videoStream: () => undefined,
	lastUpdateTs: {},
	devices: {},
})

const deviceAliases: Record<string, string> = {}
const deviceTypes: Record<string, DeviceType> = {}
const deviceVideoStreams: Record<string, string> = {}

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [knownDevices, updateDevices] = useState<Devices>({})
	const [lastUpdateTs, setLastUpdateTs] = useState<
		Record<string, Date | undefined>
	>({})

	const knownDevicesWithType = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(knownDevices).map(([id, device]) => [
					id,
					{
						...device,
						type: deviceTypes[id],
					},
				]),
			),
		[knownDevices],
	)

	return (
		<DevicesContext.Provider
			value={{
				devices: knownDevicesWithType,
				updateState: (deviceId, reported) => {
					updateDevices((devices) => {
						const updated: Device = {
							...devices[deviceId],
							id: deviceId,
							state: merge(devices[deviceId]?.state ?? {}, reported),
						}
						// Use GNSS location from shadow
						if (
							reported.gnss !== undefined &&
							reported.gnss.ts > Date.now() - 60 * 60 * 1000
						) {
							updated.location = {
								...(updated.location ?? {}),
								[GeoLocationSource.GNSS]: {
									lat: reported.gnss.v.lat,
									lng: reported.gnss.v.lng,
									accuracy: reported.gnss.v.acc,
									source: GeoLocationSource.GNSS,
									ts: new Date(reported.gnss.ts),
								},
							}
						}
						// Use LPL location from shadow
						if (
							reported.lpl !== undefined &&
							reported.lpl.ts > Date.now() - 60 * 60 * 1000
						) {
							updated.location = {
								...(updated.location ?? {}),
								[GeoLocationSource.LPL]: {
									lat: reported.lpl.v.lat,
									lng: reported.lpl.v.lng,
									accuracy: reported.lpl.v.acc,
									source: GeoLocationSource.LPL,
									ts: new Date(reported.lpl.ts),
								},
							}
						}
						// Use fixed location from shadow
						if (reported.geo !== undefined) {
							updated.location = {
								...(updated.location ?? {}),
								[GeoLocationSource.fixed]: {
									lat: reported.geo.lat,
									lng: reported.geo.lng,
									accuracy: 1,
									source: GeoLocationSource.fixed,
									ts: new Date(),
								},
							}
						}
						// Remove values not sent by the device (merge only adds new values)
						if (reported.fg !== undefined && updated.state?.fg !== undefined) {
							updated.state = {
								...updated.state,
								fg: reported.fg,
							}
						}
						// Convert legacy battery info to fuel gauge
						if (reported.bat !== undefined) {
							if ((reported.fg?.ts ?? 0) < reported.bat.ts) {
								reported.fg = {
									v: {
										...(reported.fg?.v ?? {}),
										V: reported.bat.v,
									},
									ts: reported.bat.ts,
								}
							}
						}
						return {
							...devices,
							[deviceId]: updated,
						}
					})

					const maybeUpdated = getDeviceLastUpdateTime(
						knownDevices[deviceId] ?? { id: deviceId },
						reported,
					)
					if (maybeUpdated !== null) {
						setLastUpdateTs((u) => ({
							...u,
							[deviceId]: newer(new Date(maybeUpdated), u[deviceId]),
						}))
					}
				},
				updateLocation: (deviceId, location) => {
					updateDevices((devices) => ({
						...devices,
						[deviceId]: {
							...devices[deviceId],
							id: deviceId,
							location: {
								...(devices[deviceId]?.location ?? {}),
								[location.source]: location,
							},
						},
					}))
					setLastUpdateTs((u) => ({
						...u,
						[deviceId]: newer(location.ts, u[deviceId]),
					}))
				},
				updateHistory: (deviceId, history) => {
					updateDevices((devices) => ({
						...devices,
						[deviceId]: {
							...devices[deviceId],
							id: deviceId,
							history: {
								...history,
								base: new Date(history.base),
							},
						},
					}))
				},
				lastUpdateTs,
				updateAlias: (deviceId, alias) => {
					deviceAliases[deviceId] = alias
				},
				alias: (deviceId) => deviceAliases[deviceId],
				updateType: (deviceId, type) => {
					deviceTypes[deviceId] = type
				},
				type: (deviceId) => deviceTypes[deviceId],
				updateVideoStream: (deviceId, stream) => {
					deviceVideoStreams[deviceId] = stream
				},
				videoStream: (deviceId) => deviceVideoStreams[deviceId],
			}}
		>
			{children}
		</DevicesContext.Provider>
	)
}

const newer = (d1: Date, d2?: Date) => (d2 === undefined || d1 > d2 ? d1 : d2)

export const Consumer = DevicesContext.Consumer

export const useDevices = () => useContext(DevicesContext)

const getDeviceLastUpdateTime = (
	device: Device,
	state: Reported,
): null | number => {
	if (isNRPlusGateway(device))
		return getLastUpdateTime(
			Object.values(device.state.nodes)
				.map((node) => [node.pccStatus?.ts, node.btn?.ts, node.env?.ts])
				.flat(),
		)

	if (isWirepasGateway(device)) {
		const nodes = (device as WirepasGateway).state.nodes
		return getLastUpdateTime(
			Object.values(nodes).map((node) => maybeDate(node.ts)?.getTime()),
		)
	}
	if (isNordicNrplus(device)) {
		return getLastUpdateTime([
			// Nordic NR+ specific
			device.state?.nordicNrplus.connectionProfile?.ts,
			...Object.values(device.state?.nordicNrplus.neighbors ?? {}).map(
				(n) => n.ts,
			),
			...Object.values(device.state?.nordicNrplus.buttonPresses ?? {}).map(
				(bp) => bp.ts,
			),
		])
	}
	return getLastUpdateTime([
		state?.btn?.ts,
		state?.dev?.ts,
		state?.env?.ts,
		state?.gnss?.ts,
		state?.roam?.ts,
		state?.fg?.ts,
		state?.nordicNrplus?.connectionProfile?.ts,
		...Object.values(state?.nordicNrplus?.neighbors ?? {}).map((n) => n.ts),
		...Object.values(state?.nordicNrplus?.buttonPresses ?? {}).map(
			(bp) => bp.ts,
		),
	])
}

export const getLastUpdateTime = (
	lastUpdateTimeStamps: (number | undefined)[],
): null | number => {
	const nonEmpty = lastUpdateTimeStamps.filter((s) => s !== undefined)
	return nonEmpty.length > 0 ? Math.max(...nonEmpty) : null
}

const maybeDate = (date: string | number): Date | null => {
	const d = new Date(date)
	if (isNaN(d.getTime())) {
		console.warn(`Failed to parse as date: ${date}`)
		return null
	}
	return d
}
