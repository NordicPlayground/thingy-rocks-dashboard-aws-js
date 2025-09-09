import {
	timestampResources,
	type BatteryAndPower_14202,
	type ButtonPress_14220,
	type ConnectionInformation_14203,
	type DECTNR_ConnectionProfile_14503,
	type DeviceInformation_14204,
	type Environment_14205,
	type Geolocation_14201,
	type LwM2MObjectInstance,
	type NetworkNeighbor_14502,
} from '@hello.nrfcloud.com/proto-map/lwm2m'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import {
	DeviceType,
	GeoLocationSource,
	useDevices,
	type GeoLocation,
	type Reported,
} from './Devices.js'
import { MessageContext, useWebsocket } from './WebsocketConnection.js'

// Nordic NR+ object IDs
const NETWORK_NEIGHBOR_OBJECT_ID = 14502
const DECT_NR_PLUS_CONNECTION_PROFILE_OBJECT_ID = 14503
const BUTTON_PRESS_OBJECT_ID = 14220

const LwM2MContext = createContext<{
	objects: Record<string, LwM2MObjectInstance[]>
}>({
	objects: {},
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const { send, onMessage, removeMessageListener, connected } = useWebsocket()
	const [objects, setObjects] = useState<
		Record<string, Array<LwM2MObjectInstance>>
	>({})
	const deviceMessages = useDevices()

	useEffect(() => {
		if (!connected) return
		send('LWM2M-shadows')
		const listener = (message: Record<string, unknown>) => {
			if (isLwM2MShadows(message)) {
				setObjects(
					Object.values(message.shadows).reduce(
						(objects, { objects: o, deviceId }) => ({
							...objects,
							[deviceId]: o,
						}),
						{},
					),
				)
				for (const { deviceId, alias, objects } of message.shadows) {
					if (alias !== undefined) deviceMessages.updateAlias(deviceId, alias)
					const { locations, reported, isNordicNrplus } =
						processObjects(objects)
					deviceMessages.updateState(deviceId, reported)
					for (const [src, location] of locations) {
						deviceMessages.updateLocation(deviceId, location, src)
					}
					// Set device type if it's a nordic-nrplus device
					if (isNordicNrplus) {
						deviceMessages.updateType(deviceId, DeviceType.NORDIC_NRPLUS)
					}
				}
			} else if (isLwM2MUpdate(message)) {
				setObjects((objects) => ({
					...objects,
					[message.deviceId]: [
						...message.objects,
						...(objects[message.deviceId] ?? []),
					]
						.filter((object) => {
							const tsId = timestampResources.get(object.ObjectID)!
							return (
								(object.Resources[tsId]! as number) >
								(Date.now() - 60 * 60 * 1000) / 1000
							)
						})
						.sort((a, b) => {
							const tsAId = timestampResources.get(a.ObjectID)!
							const tsBId = timestampResources.get(b.ObjectID)!
							return (
								(b.Resources[tsBId]! as number) -
								(a.Resources[tsAId]! as number)
							)
						}),
				}))
				if (message.alias !== undefined)
					deviceMessages.updateAlias(message.deviceId, message.alias)
				const { locations, reported, isNordicNrplus } = processObjects(
					message.objects,
				)
				deviceMessages.updateState(message.deviceId, reported)
				for (const [src, location] of locations) {
					deviceMessages.updateLocation(message.deviceId, location, src)
				}
				// Set device type if it's a nordic-nrplus device
				if (isNordicNrplus) {
					deviceMessages.updateType(message.deviceId, DeviceType.NORDIC_NRPLUS)
				}
			}
		}
		onMessage(listener)
		return () => {
			removeMessageListener(listener)
		}
	}, [connected])

	return (
		<LwM2MContext.Provider value={{ objects }}>
			{children}
		</LwM2MContext.Provider>
	)
}

const isLwM2MShadows = (
	message: unknown,
): message is {
	'@context': MessageContext.LwM2MShadows
	shadows: Array<{
		deviceId: string
		alias?: string
		objects: Array<LwM2MObjectInstance>
	}>
} =>
	message !== null &&
	typeof message === 'object' &&
	'@context' in message &&
	message['@context'] === MessageContext.LwM2MShadows

const isLwM2MObjectInstance = (
	ObjectID: number,
	object: unknown,
): object is LwM2MObjectInstance =>
	object !== null &&
	typeof object === 'object' &&
	'ObjectID' in object &&
	object.ObjectID === ObjectID

const isGeolocation = (
	object: unknown,
): object is LwM2MObjectInstance<Geolocation_14201> =>
	isLwM2MObjectInstance(14201, object)
const isConnectionInformation = (
	object: unknown,
): object is LwM2MObjectInstance<ConnectionInformation_14203> =>
	isLwM2MObjectInstance(14203, object)
const isDeviceInformation = (
	object: unknown,
): object is LwM2MObjectInstance<DeviceInformation_14204> =>
	isLwM2MObjectInstance(14204, object)
const isEnvironment = (
	object: unknown,
): object is LwM2MObjectInstance<Environment_14205> =>
	isLwM2MObjectInstance(14205, object)
const isBatteryAndPower = (
	object: unknown,
): object is LwM2MObjectInstance<BatteryAndPower_14202> =>
	isLwM2MObjectInstance(14202, object)

const isNetworkNeighbor = (
	object: unknown,
): object is LwM2MObjectInstance<NetworkNeighbor_14502> =>
	isLwM2MObjectInstance(NETWORK_NEIGHBOR_OBJECT_ID, object)

const isDECTNRPlusConnectionProfile = (
	object: unknown,
): object is LwM2MObjectInstance<DECTNR_ConnectionProfile_14503> =>
	isLwM2MObjectInstance(DECT_NR_PLUS_CONNECTION_PROFILE_OBJECT_ID, object)

const isButtonPress = (
	object: unknown,
): object is LwM2MObjectInstance<ButtonPress_14220> =>
	isLwM2MObjectInstance(BUTTON_PRESS_OBJECT_ID, object)

const isLwM2MUpdate = (
	message: unknown,
): message is {
	'@context': MessageContext.LwM2MUpdate
	deviceId: string
	alias?: string
	objects: Array<LwM2MObjectInstance>
} =>
	message !== null &&
	typeof message === 'object' &&
	'@context' in message &&
	message['@context'] === MessageContext.LwM2MUpdate

const processObjects = (
	objects: Array<LwM2MObjectInstance>,
): {
	reported: Reported
	locations: Map<string, GeoLocation>
	isNordicNrplus: boolean
} => {
	const reported: Reported = {}
	const locations: Map<string, GeoLocation> = new Map()
	let isNordicNrplus = false

	// Check if any nordic-nrplus specific objects are present
	const hasNordicNrplusObjects = objects.some(
		(obj) =>
			obj.ObjectID === (NETWORK_NEIGHBOR_OBJECT_ID as any) ||
			obj.ObjectID === (DECT_NR_PLUS_CONNECTION_PROFILE_OBJECT_ID as any) ||
			obj.ObjectID === (BUTTON_PRESS_OBJECT_ID as any),
	)

	if (hasNordicNrplusObjects) {
		isNordicNrplus = true
		// Initialize nordic-nrplus specific state
		reported.nordicNrplus = {
			neighbors: {},
			connectionProfile: undefined,
			buttonPresses: {},
		}
	}

	for (const object of objects) {
		if (isDeviceInformation(object)) {
			const {
				0: imei,
				1: iccid,
				2: modV,
				4: brdV,
				3: appV,
				5: bat,
			} = object.Resources
			reported.dev = {
				v: {
					imei,
					iccid,
					modV,
					brdV,
					appV,
					bat,
				},
				ts: new Date(object.Resources['99'] * 1000).getTime(),
			}
		} else if (isConnectionInformation(object)) {
			const {
				1: band,
				0: nw,
				2: rsrp,
				3: area,
				5: mccmnc,
				4: cell,
				6: ip,
				11: eest,
			} = object.Resources
			reported.roam = {
				v: { band, nw, rsrp, area, mccmnc, cell, ip, eest },
				ts: new Date(object.Resources['99'] * 1000).getTime(),
			}
		} else if (isEnvironment(object)) {
			const { 0: temp, 1: hum, 2: atmp, 10: bsec_iaq } = object.Resources
			reported.env = {
				v: {
					temp,
					hum,
					atmp,
					bsec_iaq,
				},
				ts: new Date(object.Resources['99'] * 1000).getTime(),
			}
		} else if (isBatteryAndPower(object)) {
			const { 1: V, 2: I, 3: T, 0: SoC, 4: TTF, 5: TTE } = object.Resources
			reported.fg = {
				v: {
					V: V !== undefined ? V * 1000 : undefined,
					I,
					T,
					SoC,
					TTF,
					TTE,
				},
				ts: new Date(object.Resources['99'] * 1000).getTime(),
			}
		} else if (isGeolocation(object)) {
			const {
				1: lng,
				0: lat,
				3: acc,
				2: alt,
				4: spd,
				5: hdg,
				6: src,
			} = object.Resources
			if ((object.ObjectInstanceID ?? 0) === 0) {
				// GNSS fix
				reported.gnss = {
					v: {
						lng,
						lat,
						acc,
						alt,
						spd,
						hdg,
					},
					ts: new Date(object.Resources['99'] * 1000).getTime(),
				}
				locations.set('GNSS', {
					lng,
					lat,
					accuracy: acc,
					source: GeoLocationSource.GNSS,
					ts: new Date(object.Resources['99'] * 1000),
				})
			} else if (object.ObjectInstanceID === 1) {
				// Network scan
				locations.set(src, {
					lng,
					lat,
					accuracy: acc,
					source: src as GeoLocationSource,
					ts: new Date(object.Resources['99'] * 1000),
				})
			} else if (object.ObjectInstanceID === 2) {
				// Single cell geo location
				locations.set(src, {
					lng,
					lat,
					accuracy: acc,
					source: GeoLocationSource.SCELL,
					ts: new Date(object.Resources['99'] * 1000),
				})
			} else if (object.ObjectInstanceID === 3) {
				// LPL fix
				reported.lpl = {
					v: {
						lng,
						lat,
						acc,
						alt,
						spd,
						hdg,
					},
					ts: new Date(object.Resources['99'] * 1000).getTime(),
				}
				locations.set('LPL', {
					lng,
					lat,
					accuracy: acc,
					source: GeoLocationSource.LPL,
					ts: new Date(object.Resources['99'] * 1000),
				})
			}
		} else if (isNetworkNeighbor(object)) {
			// Process 14502 Network Neighbor object
			const { 0: neighborId, 1: rssi } = object.Resources
			const instanceId = object.ObjectInstanceID?.toString() ?? '0'
			if (reported.nordicNrplus) {
				reported.nordicNrplus.neighbors[instanceId] = {
					neighborId,
					rssi,
					ts: new Date(object.Resources['99'] * 1000).getTime(),
				}
			}
		} else if (isDECTNRPlusConnectionProfile(object)) {
			// Process 14503 DECT NR+ Connection Profile object
			const { 0: longRdId, 1: networkId, 2: operationalMode } = object.Resources
			if (reported.nordicNrplus) {
				reported.nordicNrplus.connectionProfile = {
					longRdId,
					networkId,
					operationalMode,
					ts: new Date(object.Resources['99'] * 1000).getTime(),
				}
			}
		} else if (isButtonPress(object)) {
			// Process 14220 Button Press object
			const buttonId = object.ObjectInstanceID ?? 0
			const instanceKey = buttonId.toString()
			if (reported.nordicNrplus) {
				reported.nordicNrplus.buttonPresses[instanceKey] = {
					buttonId,
					ts: new Date(object.Resources['99'] * 1000).getTime(),
				}
			}
		}
	}
	return { reported, locations, isNordicNrplus }
}

export const useLwM2MObjects = () => useContext(LwM2MContext)
