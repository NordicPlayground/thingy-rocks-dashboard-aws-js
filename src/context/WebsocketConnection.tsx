import { Ulid } from 'id128'
import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { GeoLocationSource, Reported, useDevices } from './Devices'

export const WebsocketContext = createContext({
	connected: false,
})

enum MessageContext {
	DeviceShadow = 'https://thingy.rocks/device-shadow',
	DeviceMessage = 'https://thingy.rocks/device-message',
	DeviceLocation = 'https://thingy.rocks/device-location',
}

type Message = {
	'@context': MessageContext
	deviceId: string
	receivedTimestamp: string // '2022-11-30T10:59:53.7Z'
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
			try {
				const message = JSON.parse(msg.data) as Message
				console.log(`[WS]`, message)
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
					default:
						console.error(`[WS]`, 'Unknown message', message)
				}
			} catch (err) {
				console.error(`[WS]`, `Failed to parse message as JSON`, msg.data)
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

	// Test device
	const testDeviceId = useRef<string>(
		`test-${Ulid.generate().toCanonical().slice(16)}`,
	)
	const fakeLocation = () => {
		deviceMessages.updateLocation(testDeviceId.current, {
			lat: 63.419001 + Math.random() * Date.now() * 10e-15,
			lng: 10.437035 + Math.random() * Date.now() * 10e-15,
			accuracy: 500 + Math.random() * 3000,
			source: GeoLocationSource.SINGLE_CELL,
		})

		deviceMessages.updateLocation(testDeviceId.current, {
			lat: 63.419001 + Math.random() * Date.now() * 10e-16,
			lng: 10.437035 + Math.random() * Date.now() * 10e-16,
			accuracy: 250 + Math.random() * 1500,
			source: GeoLocationSource.MULTI_CELL,
		})

		deviceMessages.updateLocation(testDeviceId.current, {
			lat: 63.419001 + Math.random() * Date.now() * 10e-17,
			lng: 10.437035 + Math.random() * Date.now() * 10e-17,
			accuracy: 25 + Math.random() * 250,
			source: GeoLocationSource.GNSS,
		})
	}

	const fakeDevice = () => {
		deviceMessages.updateState(testDeviceId.current, {
			sol: {
				v: {
					gain: 4.391489028930664,
					bat: 3.872000217437744,
				},
				ts: Date.now(),
			},
		})
	}

	useEffect(() => {
		const i = setInterval(fakeLocation, 5000)

		fakeLocation()
		fakeDevice()

		return () => {
			clearInterval(i)
		}
	}, [testDeviceId])

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
