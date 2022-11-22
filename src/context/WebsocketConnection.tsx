import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import { useDeviceMessages } from './DeviceMessage'

export const WebsocketContext = createContext({
	connected: false,
})

export const Provider = ({
	children,
	websocketEndpoint,
}: {
	children: ComponentChildren
	websocketEndpoint: URL
}) => {
	const [connection, setConnection] = useState<WebSocket>()
	const deviceMessages = useDeviceMessages()

	useEffect(() => {
		const socket = new WebSocket(websocketEndpoint.toString())

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
				const message = JSON.parse(msg.data)
				console.log(`[WS]`, message)
				switch (message['@context']) {
					case 'https://thingy.rocks/device-event':
						deviceMessages.addDeviceMessage(message.deviceId, message.reported)
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
	}, [websocketEndpoint])

	useEffect(() => {
		if (connection === undefined) return

		const pingInterval = setInterval(() => {
			connection.send(JSON.stringify({ message: 'sendmessage', data: 'PING' }))
		}, 1000 * 60 * 9) // every 9 minutes

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
