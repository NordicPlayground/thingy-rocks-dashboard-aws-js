import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import {
	GeoLocationSource,
	MeshNodeInfo,
	Reported,
	Summary,
	useDevices,
} from './Devices'

export const WebsocketContext = createContext({
	connected: false,
})

enum MessageContext {
	DeviceShadow = 'https://thingy.rocks/device-shadow',
	DeviceMessage = 'https://thingy.rocks/device-message',
	DeviceLocation = 'https://thingy.rocks/device-location',
	DeviceHistory = 'https://thingy.rocks/device-history',
	MeshNodeEvent = 'https://thingy.rocks/wirepas-5g-mesh-node-event',
}

type MeshNodeEventMessage = {
	'@context': MessageContext.MeshNodeEvent
	meshNodeEvent: {
		meta: MeshNodeInfo
		message:
			| { counter: number }
			| { button: number }
			| { led: Record<number, number> }
	}
}

type Message = {
	'@context': MessageContext
	deviceId: string
	deviceAlias?: string
} & (
	| {
			'@context': MessageContext.DeviceLocation
			location: {
				lat: number // 63.419001
				lng: number // 10.437035
				accuracy: number // 500
				source: GeoLocationSource // 'single-cell'
			}
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
	| MeshNodeEventMessage
)

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const connection = useRef<WebSocket>()
	const deviceMessages = useDevices()
	const [connected, setConnected] = useState<boolean>(false)
	const [connectionAttempt, setConnectionAttempt] = useState<number>(1)

	const updateMeshNode = (message: MeshNodeEventMessage) => {
		const state: Reported = {
			meshNode: message.meshNodeEvent.meta,
			geo: {
				// Hardcoded location for MWC
				lat: 41.3545596807965,
				lng: 2.128132954068601,
			},
		}
		const nodeId = `${message.meshNodeEvent.meta.node}@${message.meshNodeEvent.meta.gateway}`
		if ('button' in message.meshNodeEvent.message) {
			state.btn = {
				v: message.meshNodeEvent.message.button,
				ts: new Date(message.meshNodeEvent.meta.rxTime).getTime(),
			}
		}
		deviceMessages.updateState(nodeId, state)
	}

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
				console.log(`[WS]`, message['@context'], message)
			} catch (err) {
				console.error(`[WS]`, `Failed to parse message as JSON`, msg.data)
				return
			}
			switch (message['@context']) {
				case 'https://thingy.rocks/device-shadow':
					deviceMessages.updateState(message.deviceId, message.reported)
					break
				case 'https://thingy.rocks/device-message':
					deviceMessages.updateState(message.deviceId, message.message)
					break
				case 'https://thingy.rocks/device-location':
					deviceMessages.updateLocation(message.deviceId, message.location)
					break
				case 'https://thingy.rocks/device-history':
					deviceMessages.updateHistory(message.deviceId, message.history)
					break
				case 'https://thingy.rocks/wirepas-5g-mesh-node-event':
					updateMeshNode(message)
					break
				default:
					console.error(`[WS]`, 'Unknown message', message)
			}
			if ('deviceAlias' in message) {
				deviceMessages.updateAlias(message.deviceId, message.deviceAlias)
			}
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

		const pingInterval = setInterval(() => {
			connection.current?.send(
				JSON.stringify({ message: 'sendmessage', data: 'PING' }),
			)
		}, 1000 * 60 * 9) // every 9 minutes

		// Initial greeting
		connection.current.send(
			JSON.stringify({ message: 'sendmessage', data: 'HELLO' }),
		)

		return () => {
			clearInterval(pingInterval)
		}
	}, [connected, connection])

	return (
		<WebsocketContext.Provider
			value={{
				connected,
			}}
		>
			{children}
		</WebsocketContext.Provider>
	)
}

export const Consumer = WebsocketContext.Consumer

export const useWebsocket = () => useContext(WebsocketContext)
