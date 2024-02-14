import { createContext, type ComponentChildren } from 'preact'
import { useContext, useState } from 'preact/hooks'

export const WirepasTopologyContext = createContext<{
	deviceId?: string | undefined
	show: (deviceId: string) => void
	hide: () => void
}>({
	show: () => undefined,
	hide: () => undefined,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [deviceId, setDeviceId] = useState<string>()

	return (
		<WirepasTopologyContext.Provider
			value={{
				deviceId,
				show: (deviceId) => {
					setDeviceId(deviceId)
				},
				hide: () => {
					setDeviceId(undefined)
				},
			}}
		>
			{children}
		</WirepasTopologyContext.Provider>
	)
}

export const Consumer = WirepasTopologyContext.Consumer

export const useWirepasTopology = () => useContext(WirepasTopologyContext)
