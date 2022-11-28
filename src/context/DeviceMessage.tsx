import { merge } from 'lodash'
import { ComponentChildren, createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

type ShadowUpdate = Record<string, any>
type DeviceMessage = ShadowUpdate

export const DeviceMessagesContext = createContext<{
	messages: Record<
		string,
		{
			ts: string
			state: DeviceMessage
		}
	>
	addDeviceMessage: (deviceId: string, message: DeviceMessage) => void
}>({
	addDeviceMessage: () => undefined,
	messages: {},
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [messages, setMessages] = useState<
		Record<
			string,
			{
				ts: string
				state: DeviceMessage
			}
		>
	>({})

	return (
		<DeviceMessagesContext.Provider
			value={{
				messages,
				addDeviceMessage: (deviceId, message) => {
					setMessages((messages) => ({
						...messages,
						[deviceId]: merge(messages[deviceId] ?? {}, {
							ts: new Date().toISOString(),
							state: message,
						}),
					}))
				},
			}}
		>
			{children}
		</DeviceMessagesContext.Provider>
	)
}

export const Consumer = DeviceMessagesContext.Consumer

export const useDeviceMessages = () => useContext(DeviceMessagesContext)
