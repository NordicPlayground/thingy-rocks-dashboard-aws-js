import { ComponentChildren, createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

export const HistoryChartContext = createContext<{
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
		<HistoryChartContext.Provider
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
		</HistoryChartContext.Provider>
	)
}

export const Consumer = HistoryChartContext.Consumer

export const useHistoryChart = () => useContext(HistoryChartContext)
