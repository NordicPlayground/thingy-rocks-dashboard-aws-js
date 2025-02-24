import {
	type BatteryAndPower_14202,
	type ConnectionInformation_14203,
	type DeviceInformation_14204,
	type Environment_14205,
	type Geolocation_14201,
	type LwM2MObjectInstance,
} from '@hello.nrfcloud.com/proto-map/lwm2m'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import {
	GeoLocationSource,
	useDevices,
	type GeoLocation,
	type Reported,
} from './Devices.js'
import { MessageContext, useWebsocket } from './WebsocketConnection.js'

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
					const { locations, reported } = processObjects(objects)
					deviceMessages.updateState(deviceId, reported)
					for (const [src, location] of locations) {
						deviceMessages.updateLocation(deviceId, location, src)
					}
				}
			} else if (isLwM2MUpdate(message)) {
				if (message.alias !== undefined)
					deviceMessages.updateAlias(message.deviceId, message.alias)
				const { locations, reported } = processObjects(message.objects)
				deviceMessages.updateState(message.deviceId, reported)
				for (const [src, location] of locations) {
					deviceMessages.updateLocation(message.deviceId, location, src)
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
} => {
	const reported: Reported = {}
	const locations: Map<string, GeoLocation> = new Map()
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
		}
	}
	return { reported, locations }
}

export const useLwM2MObjects = () => useContext(LwM2MContext)
