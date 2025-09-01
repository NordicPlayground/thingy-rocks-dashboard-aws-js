import type { LwM2MObjectInstance } from '@hello.nrfcloud.com/proto-map/lwm2m'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import type { Reboot } from '../memfault/Context.js'
import {
	DeviceType,
	GeoLocationSource,
	useDevices,
	type GeoLocation,
	type Reported,
	type Summary,
} from './Devices.js'

export const WebsocketContext = createContext<{
	connected: boolean
	send: (message: any) => void
	onMessage: (listener: Listener) => void
	removeMessageListener: (listener: Listener) => void
}>({
	connected: false,
	send: () => undefined,
	onMessage: () => undefined,
	removeMessageListener: () => undefined,
})

export enum MessageContext {
	DeviceShadow = 'https://thingy.rocks/device-shadow',
	DeviceMessage = 'https://thingy.rocks/device-message',
	DeviceLocation = 'https://thingy.rocks/device-location',
	DeviceHistory = 'https://thingy.rocks/device-history',
	LwM2MShadows = 'https://thingy.rocks/lwm2m-shadows',
	MemfaultReboot = 'https://thingy.rocks/memfault-reboot',
	LwM2MUpdate = 'https://thingy.rocks/lwm2m-update',
}

type Message = {
	'@context': MessageContext
	deviceId: string
	deviceAlias?: string
	// Fixed location for the device
	deviceLocation?: string // e.g. 63.42115901688979,10.437200141182338
	deviceType?: string
} & (
	| {
			'@context': MessageContext.DeviceLocation
			location: GeoLocation
			ts: number
	  }
	| {
			'@context': MessageContext.DeviceShadow
			reported: Reported
	  }
	| {
			'@context': MessageContext.DeviceMessage
			message: Reported
	  }
	| {
			'@context': MessageContext.DeviceHistory
			history: Summary
	  }
	| {
			'@context': MessageContext.LwM2MShadows
	  }
	| {
			'@context': MessageContext.MemfaultReboot
			reboot: Reboot
	  }
	| {
			'@context': MessageContext.LwM2MUpdate
			deviceId: string
			objects: Array<LwM2MObjectInstance>
	  }
)

type Listener = (message: Record<string, unknown>) => void

// Nordic NR+ object IDs
const NETWORK_NEIGHBOR_OBJECT_ID = 14502
const DECT_NR_PLUS_CONNECTION_PROFILE_OBJECT_ID = 14503  
const BUTTON_PRESS_OBJECT_ID = 14220

/**
 * Process nordic-nrplus device shadow messages that contain LwM2M objects
 * in the format "objectId:version": {instanceId: {resourceId: value}}
 */
const processNordicNrplusDeviceShadow = (reported: any): Reported => {
	const processed: Reported = { ...reported }
	
	// Check if any nordic-nrplus specific objects are present
	const hasNordicNrplusObjects = Object.keys(reported).some(key => {
		const [objectIdStr] = key.split(':')
		if (!objectIdStr) return false
		const objectId = parseInt(objectIdStr, 10)
		return objectId === NETWORK_NEIGHBOR_OBJECT_ID || 
			   objectId === DECT_NR_PLUS_CONNECTION_PROFILE_OBJECT_ID || 
			   objectId === BUTTON_PRESS_OBJECT_ID
	})
	
	if (hasNordicNrplusObjects) {
		// Initialize nordic-nrplus specific state
		processed.nordicNrplus = {
			neighbors: {},
			connectionProfile: undefined,
			buttonPresses: {},
		}
		
		// Process each LwM2M object
		for (const [key, value] of Object.entries(reported)) {
			const keyParts = key.split(':')
			if (keyParts.length < 2) continue
			
			const objectIdStr = keyParts[0]
			if (!objectIdStr || objectIdStr.trim() === '') continue
			
			const objectId = parseInt(objectIdStr.trim())
			if (isNaN(objectId)) continue
			
			if (objectId === NETWORK_NEIGHBOR_OBJECT_ID && value && typeof value === 'object') {
				// Process 14502 Network Neighbor object
				for (const [instanceIdStr, instanceValue] of Object.entries(value)) {
					if (instanceValue && typeof instanceValue === 'object') {
						const resources = instanceValue as Record<string, any>
						const neighborId = resources['0']
						const rssi = resources['1']
						const timestamp = resources['99']
						
						if (neighborId !== undefined && timestamp !== undefined) {
							processed.nordicNrplus!.neighbors[instanceIdStr] = {
								neighborId,
								rssi,
								ts: new Date(timestamp * 1000).getTime(),
							}
						}
					}
				}
			} else if (objectId === DECT_NR_PLUS_CONNECTION_PROFILE_OBJECT_ID && value && typeof value === 'object') {
				// Process 14503 DECT NR+ Connection Profile object
				for (const [, instanceValue] of Object.entries(value)) {
					if (instanceValue && typeof instanceValue === 'object') {
						const resources = instanceValue as Record<string, any>
						const longRdId = resources['0']
						const networkId = resources['1']
						const operationalMode = resources['2']
						const timestamp = resources['99']
						
						if (longRdId !== undefined && networkId !== undefined && operationalMode !== undefined && timestamp !== undefined) {
							processed.nordicNrplus!.connectionProfile = {
								longRdId,
								networkId,
								operationalMode,
								ts: new Date(timestamp * 1000).getTime(),
							}
						}
					}
				}
			} else if (objectId === BUTTON_PRESS_OBJECT_ID && value && typeof value === 'object') {
				// Process 14220 Button Press object
				for (const [instanceIdStr, instanceValue] of Object.entries(value)) {
					if (instanceValue && typeof instanceValue === 'object') {
						const resources = instanceValue as Record<string, any>
						const timestamp = resources['99']
						const buttonId = parseInt(instanceIdStr)
						
						if (timestamp !== undefined && !isNaN(buttonId)) {
							processed.nordicNrplus!.buttonPresses[instanceIdStr] = {
								buttonId,
								ts: new Date(timestamp * 1000).getTime(),
							}
						}
					}
				}
			}
		}
	}
	
	return processed
}

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const connection = useRef<WebSocket>()
	const deviceMessages = useDevices()
	const [connected, setConnected] = useState<boolean>(false)
	const [connectionAttempt, setConnectionAttempt] = useState<number>(1)
	const listeners = useRef<Array<Listener>>([])

	useEffect(() => {
		if (connection.current !== undefined) return
		console.debug(`[WS]`, `connection attempt`, connectionAttempt)
		connection.current = new WebSocket(WEBSOCKET_ENDPOINT)

		let connected = false

		connection.current.addEventListener('open', () => {
			console.debug(`[WS]`, 'connected')
			connected = true
			setConnected(true)
		})

		connection.current.addEventListener('close', () => {
			// This happens automatically after 2 hours
			// See https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html#apigateway-execution-service-websocket-limits-table
			console.debug(`[WS]`, 'disconnected')
			connection.current = undefined
			setConnected(false)
			setTimeout(() => {
				setConnectionAttempt((connectionAttempt) => connectionAttempt + 1)
			}, 5000)
		})

		connection.current.addEventListener('error', (err) => {
			console.error(`[WS]`, err)
		})
		connection.current.addEventListener('message', (msg) => {
			let message: Message
			try {
				message = JSON.parse(msg.data) as Message
				console.debug(`[WS]`, message['@context'], message)
			} catch (err) {
				console.error(`[WS]`, `Failed to parse message as JSON`, msg.data)
				return
			}
			switch (message['@context']) {
				case MessageContext.DeviceShadow:
					{
						let processedReported = message.reported
						// If this is a nordic-nrplus device, process the LwM2M objects
						/*if (message.deviceType === 'nordic-nrplus') {
							processedReported = processNordicNrplusDeviceShadow(message.reported)
							console.log(`[WS]`, 'Processed nordic-nrplus reported', processedReported)
						}*/
						deviceMessages.updateState(message.deviceId, processedReported)
					}
					break
				case MessageContext.DeviceMessage:
					deviceMessages.updateState(message.deviceId, message.message)
					break
				case MessageContext.DeviceLocation:
					deviceMessages.updateLocation(
						message.deviceId,
						{
							...message.location,
							ts: new Date(message.ts),
						},
						message.location.source,
					)
					break
				case MessageContext.DeviceHistory:
					deviceMessages.updateHistory(message.deviceId, message.history)
					break
				case MessageContext.LwM2MShadows:
				case MessageContext.MemfaultReboot:
				case MessageContext.LwM2MUpdate:
					// ignore here
					break
				default:
					console.debug(`[WS]`, 'Unknown message', message)
			}
			if (message.deviceAlias !== undefined) {
				deviceMessages.updateAlias(message.deviceId, message.deviceAlias)
			}
			if (message.deviceLocation !== undefined) {
				const [lat, lng] = message.deviceLocation
					.split(',')
					.map((s) => s.trim())
					.map((s) => parseFloat(s)) as [number, number]
				deviceMessages.updateLocation(
					message.deviceId,
					{
						lat,
						lng,
						accuracy: 100,
						source: GeoLocationSource.fixed,
						ts: new Date(),
					},
					'fixed',
				)
			}
			if (message.deviceType !== undefined) {
				// Map string device types to DeviceType enum
				let deviceType: DeviceType
				if (message.deviceType === 'nordic-nrplus') {
					deviceType = DeviceType.NORDIC_NRPLUS
				} else {
					deviceType = message.deviceType as DeviceType
				}
				deviceMessages.updateType(message.deviceId, deviceType)
			}
			listeners.current.map((fn) => fn(message))
		})

		return () => {
			if (connected) {
				console.debug(`[WS]`, 'closing ...')
				connection.current?.close()
			}
		}
	}, [connectionAttempt])

	useEffect(() => {
		if (!connected) return
		if (connection.current === undefined) return

		const pingInterval = setInterval(
			() => {
				connection.current?.send(
					JSON.stringify({ message: 'sendmessage', data: 'PING' }),
				)
			},
			1000 * 60 * 9,
		) // every 9 minutes

		return () => {
			clearInterval(pingInterval)
		}
	}, [connected, connection])

	return (
		<WebsocketContext.Provider
			value={{
				connected,
				send: (message) => {
					console.debug(`[WS]`, message)
					connection?.current?.send(
						JSON.stringify({
							message: 'sendmessage',
							data: message,
						}),
					)
				},
				onMessage: (listener) => {
					listeners.current.push(listener)
				},
				removeMessageListener: (listener) => {
					listeners.current = listeners.current.filter((l) => l !== listener)
				},
			}}
		>
			{children}
		</WebsocketContext.Provider>
	)
}

export const Consumer = WebsocketContext.Consumer

export const useWebsocket = () => useContext(WebsocketContext)
