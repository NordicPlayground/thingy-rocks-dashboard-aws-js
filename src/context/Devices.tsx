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

export type NoData = 'gnss' | 'ncell'

/**
 * @see https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/coneval_set.html
 */
export enum EnergyEstimate {
	/**
	 * Bad conditions. Difficulties in setting up connections.
	 * Maximum number of repetitions might be needed for data.
	 */
	Bad = 5,
	/**
	 * Poor conditions.
	 * Setting up a connection might require retries and a higher number of
	 * repetitions for data.
	 */
	Poor = 6,
	/**
	 * Normal conditions for cIoT device.
	 * No repetitions for data or only a few repetitions in the worst case.
	 */
	Normal = 7,
	/**
	 * Good conditions. Possibly very good conditions for small amounts of data.
	 */
	Good = 8,
	/**
	 * Excellent conditions.
	 * Efficient data transfer estimated also for larger amounts of data.
	 */
	Excellent = 9,
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
		nod: NoData[]
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
			eest?: EnergyEstimate // 8
		}
		ts: number // 1669741244010
	}
	env: {
		v: {
			temp: number // 27.75
			hum: number // 13.257
			atmp: number // 101.497
			/*
			 * @see https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme680-ds001.pdf
			 */
			bsec_iaq?: number // 137
		}
		ts: number //1669741243982
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
	// LED lights
	led: {
		v: {
			type: 'rgb' | 'on/off'
			color?: [number, number, number] // [0, 169, 206]
		}
		ts: number // 1670245539000
	}
	// Device has a fixed geo location
	geo: {
		lng: number // 10.4383147713927
		lat: number // 63.42503380159108
	}
	// 5G Mesh Node details
	meshNode: MeshNodeInfo
}>

export type MeshNodeInfo = {
	node: number // 1078800338
	gateway: string // 'demo5Gmesh_gw01'
	rxTime: string // '2023-02-08T13:27:46.304Z'
	travelTimeMs: number // 39
	hops?: number // 1
}

export enum GeoLocationSource {
	SINGLE_CELL = 'single-cell',
	MULTI_CELL = 'multi-cell',
	WIFI = 'wifi',
	GNSS = 'gnss',
	FIXED = 'fixed',
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

export type Reading = [
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
	/**
	 * Contains one or more significant readings to display as guides.
	 *
	 * Used for example to visualize that the battery level did not change for Thingys with Solar shield.
	 */
	guides?: [
		type: 'bat' | 'temp' | 'solGain',
		v: number,
		// Delta to the base date in seconds
		d: number,
	][]
}

export const isTracker = (device: Device): boolean => {
	const { appV, brdV } = device.state?.dev?.v ?? {}
	return appV !== undefined && brdV !== undefined
}
export const isLightBulb = (device: Device): boolean =>
	device.state?.led !== undefined && device.state.meshNode === undefined
export const isMeshNode = (device: Device): boolean =>
	device.state?.meshNode !== undefined

export const DevicesContext = createContext<{
	devices: Devices
	updateState: (deviceId: string, reported: Reported) => void
	updateLocation: (deviceId: string, location: GeoLocation) => void
	updateHistory: (deviceId: string, history: Summary) => void
	updateAlias: (deviceId: string, alias: string) => void
	toggleHiddenLocation: (deviceId: string, location: GeoLocationSource) => void
	lastUpdateTs: (deviceId: string) => number | null
	alias: (deviceId: string) => string | undefined
}>({
	updateState: () => undefined,
	updateLocation: () => undefined,
	updateHistory: () => undefined,
	updateAlias: () => undefined,
	alias: () => undefined,
	toggleHiddenLocation: () => undefined,
	lastUpdateTs: () => null,
	devices: {},
})

const deviceAliases: Record<string, string> = {}

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [devices, updateDevices] = useState<Devices>({})

	return (
		<DevicesContext.Provider
			value={{
				devices,
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
							updated.location = merge(updated.location ?? {}, {
								[GeoLocationSource.GNSS]: {
									lat: reported.gnss.v.lat,
									lng: reported.gnss.v.lng,
									accuracy: reported.gnss.v.acc,
									source: GeoLocationSource.GNSS,
								},
							}) as Record<GeoLocationSource, GeoLocation>
						}
						// Use fixed location from shadow
						if (reported.geo !== undefined) {
							updated.location = merge(updated.location ?? {}, {
								[GeoLocationSource.FIXED]: {
									lat: reported.geo.lat,
									lng: reported.geo.lng,
									accuracy: 1,
									source: GeoLocationSource.FIXED,
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
						state?.led?.ts,
						state?.roam?.ts,
						state?.sol?.ts,
						state?.meshNode?.rxTime !== undefined
							? new Date(state.meshNode.rxTime).getTime()
							: undefined,
					].filter((s) => s !== undefined) as number[]

					return lastUpdateTimeStamps.length > 0
						? Math.max(...lastUpdateTimeStamps)
						: null
				},
				updateAlias: (deviceId, alias) => {
					deviceAliases[deviceId] = alias
				},
				alias: (deviceId) => deviceAliases[deviceId],
			}}
		>
			{children}
		</DevicesContext.Provider>
	)
}

export const Consumer = DevicesContext.Consumer

export const useDevices = () => useContext(DevicesContext)
