import { merge } from 'lodash'
import { ComponentChildren, createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

export type ButtonPress = {
	v: number // 4398
	ts: number // 1669741244042
}

export type SolarInfo = {
	v: {
		gain: number // mA, 4.391489028930664
		bat: number // V, 3.872000217437744
	}
	ts: number // 1670321526312
}

export type BatteryInfo = {
	v: number // 4398
	ts: number // 1669741244042
}

export type Reported = Partial<{
	cfg: {
		act: boolean
		loct: number
		actwt: number
		mvres: number
		mvt: number
		accath: number
		accith: number
		accito: number
		nod: []
	}
	dev: {
		v: {
			imei: string // '351358815341265'
			iccid: string // '89457387300008502281'
			modV: string // 'mfw_nrf9160_1.3.2'
			brdV: string // 'thingy91_nrf9160'
			appV: string // '1.1.0-thingy91_nrf9160_ns'
		}
		ts: number // 1669731049109
	}
	roam: {
		v: {
			band: number // 20
			nw: string // 'LTE-M'
			rsrp: number // -88
			area: number // 30401
			mccmnc: number // 24201
			cell: number // 21679616
			ip: string // '100.74.127.54'
		}
		ts: number // 1669741244010
	}
	env: {
		v: {
			temp: number // 27.75
			hum: number // 13.257
			atmp: number // 101.497
		}
		ts: 1669741243982
	}
	bat: BatteryInfo
	btn: ButtonPress
	gnss: {
		v: {
			lng: number // 10.4383147713927
			lat: number // 63.42503380159108
			acc: number // 19.08224868774414
			alt: number // 117.34368896484375
			spd: number // 5.4213972091674805
			hdg: number // 170.65904235839844
		}
		ts: number // 1670245539000
	}
	sol: SolarInfo
}>

export enum GeoLocationSource {
	SINGLE_CELL = 'single-cell',
	MULTI_CELL = 'multi-cell',
	WIFI = 'wifi',
	GNSS = 'gnss',
}

export type GeoLocation = {
	lat: number
	lng: number
	accuracy: number
	source: GeoLocationSource
}
export type Device = {
	id: string
	state?: Reported
	location?: Record<GeoLocationSource, GeoLocation>
	history?: Summary
	hiddenLocations?: Record<GeoLocationSource, true>
}
export type Devices = Record<string, Device>

type Reading = [
	v: number,
	// Delta to the base date in seconds
	d: number,
]
export type Summary = {
	base: Date // '2022-12-07T12:09:59.488Z'
	bat?: Array<Reading>
	temp?: Array<Reading>
	solBat?: Array<Reading>
	solGain?: Array<Reading>
}

export const DevicesContext = createContext<{
	devices: Devices
	updateState: (deviceId: string, reported: Reported) => void
	updateLocation: (deviceId: string, location: GeoLocation) => void
	updateHistory: (deviceId: string, history: Summary) => void
	toggleHiddenLocation: (deviceId: string, location: GeoLocationSource) => void
	lastUpdateTs: (deviceId: string) => number | null
}>({
	updateState: () => undefined,
	updateLocation: () => undefined,
	updateHistory: () => undefined,
	toggleHiddenLocation: () => undefined,
	lastUpdateTs: () => null,
	devices: {},
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [devices, updateDevices] = useState<Devices>({})

	return (
		<DevicesContext.Provider
			value={{
				devices: devices,
				updateState: (deviceId, reported) => {
					updateDevices((devices) => {
						const updated: Device = {
							...devices[deviceId],
							id: deviceId,
							state: merge(devices[deviceId]?.state ?? {}, reported),
						}
						// Use GNSS location from shadow
						if (reported.gnss !== undefined) {
							updated.location = merge(updated.location ?? {}, {
								[GeoLocationSource.GNSS]: {
									lat: reported.gnss.v.lat,
									lng: reported.gnss.v.lng,
									accuracy: reported.gnss.v.acc,
									source: GeoLocationSource.GNSS,
								},
							}) as Record<GeoLocationSource, GeoLocation>
						}
						return {
							...devices,
							[deviceId]: updated,
						}
					})
				},
				updateLocation: (deviceId, location) => {
					updateDevices((devices) => ({
						...devices,
						[deviceId]: {
							...devices[deviceId],
							id: deviceId,
							location: merge(devices[deviceId]?.location ?? {}, {
								[location.source]: location,
							}) as Record<GeoLocationSource, GeoLocation>,
						},
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
				toggleHiddenLocation: (deviceId, source) => {
					let { hiddenLocations } = devices[deviceId] ?? {}
					if (hiddenLocations?.[source] === true) {
						delete hiddenLocations[source]
					} else {
						if (hiddenLocations === undefined)
							hiddenLocations = {} as Record<GeoLocationSource, true>
						hiddenLocations[source] = true
					}
					updateDevices((devices) => ({
						...devices,
						[deviceId]: {
							...devices[deviceId],
							id: deviceId,
							hiddenLocations: hiddenLocations as Record<
								GeoLocationSource,
								true
							>,
						},
					}))
				},
				lastUpdateTs: (deviceId) => {
					const state = devices[deviceId]?.state
					const lastUpdateTimeStamps: number[] = [
						state?.bat?.ts,
						state?.btn?.ts,
						state?.dev?.ts,
						state?.env?.ts,
						state?.gnss?.ts,
						state?.roam?.ts,
						state?.sol?.ts,
					].filter((s) => s !== undefined) as number[]

					return lastUpdateTimeStamps.length > 0
						? Math.max(...lastUpdateTimeStamps)
						: null
				},
			}}
		>
			{children}
		</DevicesContext.Provider>
	)
}

export const Consumer = DevicesContext.Consumer

export const useDevices = () => useContext(DevicesContext)
