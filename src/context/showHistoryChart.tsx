import { createContext, type ComponentChildren } from 'preact'
import { useContext, useState } from 'preact/hooks'

export const HistoryChartContext = createContext<{
	deviceId?: string | undefined
	show: (deviceId: string) => void
	hide: () => void
	toggle: (deviceId: string) => void
}>({
	show: () => undefined,
	hide: () => undefined,
	toggle: () => undefined,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [deviceId, setDeviceId] = useState<string>()

	return (
		<HistoryChartContext.Provider
			value={{
				deviceId,
				show: (deviceId) => {
					setDeviceId(deviceId)
				},
				hide: () => {
					setDeviceId(undefined)
				},
				toggle: (showDeviceId) => {
					deviceId === undefined
						? setDeviceId(showDeviceId)
						: showDeviceId === deviceId
						? setDeviceId(undefined)
						: setDeviceId(showDeviceId)
				},
			}}
		>
			{children}
		</HistoryChartContext.Provider>
	)
}

export const Consumer = HistoryChartContext.Consumer

export const useHistoryChart = () => useContext(HistoryChartContext)
