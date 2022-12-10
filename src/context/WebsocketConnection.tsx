import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import { GeoLocationSource, Reported, Summary, useDevices } from './Devices'

export const WebsocketContext = createContext({
	connected: false,
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
)

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [connection, setConnection] = useState<WebSocket>()
	const deviceMessages = useDevices()

	useEffect(() => {
		const socket = new WebSocket(WEBSOCKET_ENDPOINT)

		socket.addEventListener('open', () => {
			console.debug(`[WS]`, 'connected')
			setConnection(socket)
		})

		socket.addEventListener('close', () => {
			console.debug(`[WS]`, 'disconnected')
			setConnection(undefined)
		})

		socket.addEventListener('error', (err) => {
			console.error(`[WS]`, err)
		})
		socket.addEventListener('message', (msg) => {
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
				default:
					console.error(`[WS]`, 'Unknown message', message)
			}
		})

		return () => {
			console.debug(`[WS]`, 'closing ...')
			socket.close()
		}
	}, [])

	useEffect(() => {
		if (connection === undefined) return

		const pingInterval = setInterval(() => {
			connection.send(JSON.stringify({ message: 'sendmessage', data: 'PING' }))
		}, 1000 * 60 * 9) // every 9 minutes

		// Initial greeting
		connection.send(JSON.stringify({ message: 'sendmessage', data: 'HELLO' }))

		return () => {
			clearInterval(pingInterval)
		}
	}, [connection])

	return (
		<WebsocketContext.Provider
			value={{
				connected: connection !== undefined,
			}}
		>
			{children}
		</WebsocketContext.Provider>
	)
}

export const Consumer = WebsocketContext.Consumer

export const useWebsocket = () => useContext(WebsocketContext)
