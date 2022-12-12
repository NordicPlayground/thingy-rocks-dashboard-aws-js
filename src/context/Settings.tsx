import { ComponentChildren, createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

type Settings = {
	/**
	 * Above this value, charge is considered sufficiently high enough so device does not use battery.
	 */
	consumptionThreshold: number
}

const defaultSettings: Settings = {
	consumptionThreshold: 3.6,
}

export const SettingsContext = createContext<{
	settings: Settings
}>({
	settings: defaultSettings,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [settings] = useState<Settings>(defaultSettings)

	return (
		<SettingsContext.Provider
			value={{
				settings: settings,
			}}
		>
			{children}
		</SettingsContext.Provider>
	)
}

export const Consumer = SettingsContext.Consumer

export const useSettings = () => useContext(SettingsContext)
