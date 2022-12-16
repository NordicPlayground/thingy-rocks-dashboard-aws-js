import { ComponentChildren, createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

type Settings = {
	/**
	 * Above this value, charge is considered sufficiently high enough so device does not use battery.
	 */
	consumptionThreshold: number
	enableTestDevice: boolean
	showSettings: boolean
	/**
	 * Configure the reference lines shown in the Gain chart
	 */
	gainReferenceEveryMinute: number
	gainReferenceEveryHour: number
}

const defaultSettings: Settings = {
	consumptionThreshold: 3.6,
	enableTestDevice: false,
	showSettings: false,
	gainReferenceEveryMinute: 3.4,
	gainReferenceEveryHour: 2.3,
}

const loadDefaults = () => {
	const stored = localStorage.getItem('settings')
	if (stored !== null) {
		try {
			return {
				...defaultSettings,
				...JSON.parse(stored),
			}
		} catch {
			console.debug(`[Settings]`, `Failed to parse`, stored)
			return defaultSettings
		}
	}
}

export const SettingsContext = createContext<{
	settings: Settings
	update: (newSettings: Partial<Settings>) => void
	reset: () => void
}>({
	settings: defaultSettings,
	update: () => undefined,
	reset: () => undefined,
})

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [settings, updateSettings] = useState<Settings>(loadDefaults())

	console.debug(`[Settings]`, settings)

	return (
		<SettingsContext.Provider
			value={{
				settings: settings,
				update: (newSettings) => {
					updateSettings((settings) => {
						const merged = { ...settings, ...newSettings }
						localStorage.setItem('settings', JSON.stringify(merged))
						return merged
					})
				},
				reset: () => {
					localStorage.removeItem('settings')
					updateSettings(defaultSettings)
				},
			}}
		>
			{children}
		</SettingsContext.Provider>
	)
}

export const Consumer = SettingsContext.Consumer

export const useSettings = () => useContext(SettingsContext)
