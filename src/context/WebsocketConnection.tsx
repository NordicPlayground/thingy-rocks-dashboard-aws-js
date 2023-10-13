import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import {
	useDevices,
	type GeoLocation,
	type Reported,
	type Summary,
} from './Devices.js'

export const WebsocketContext = createContext<{
	connected: boolean
	send: (message: any) => void
}>({
	connected: false,
	send: () => undefined,
})

enum MessageContext {
	DeviceShadow = 'https://thingy.rocks/device-shadow',
	DeviceMessage = 'https://thingy.rocks/device-message',
	DeviceLocation = 'https://thingy.rocks/device-location',
	DeviceHistory = 'https://thingy.rocks/device-history',
}

type Message = {
	'@context': MessageContext
	deviceId: string
	deviceAlias?: string
} & (
	| {
			'@context': MessageContext.DeviceLocation
			location: GeoLocation
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
)

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const connection = useRef<WebSocket>()
	const deviceMessages = useDevices()
	const [connected, setConnected] = useState<boolean>(false)
	const [connectionAttempt, setConnectionAttempt] = useState<number>(1)

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
					deviceMessages.updateState(message.deviceId, message.reported)
					break
				case MessageContext.DeviceMessage:
					deviceMessages.updateState(message.deviceId, message.message)
					break
				case MessageContext.DeviceLocation:
					deviceMessages.updateLocation(
						message.deviceId,
						message.location,
						message.location.source,
					)
					break
				case MessageContext.DeviceHistory:
					deviceMessages.updateHistory(message.deviceId, message.history)
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

		const pingInterval = setInterval(
			() => {
				connection.current?.send(
					JSON.stringify({ message: 'sendmessage', data: 'PING' }),
				)
			},
			1000 * 60 * 9,
		) // every 9 minutes

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
				send: (message) => {
					console.debug(`[WS]`, { message })
					connection?.current?.send(
						JSON.stringify({
							message: 'sendmessage',
							data: message,
						}),
					)
				},
			}}
		>
			{children}
		</WebsocketContext.Provider>
	)
}

export const Consumer = WebsocketContext.Consumer

export const useWebsocket = () => useContext(WebsocketContext)
