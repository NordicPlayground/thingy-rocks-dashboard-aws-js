import { createContext, type ComponentChildren } from 'preact'
import { useContext, useState } from 'preact/hooks'

type Settings = {
	enableTestDevice: boolean
	enableWirepas5GMeshGateways: boolean
	showFavorites: boolean
	showSettings: boolean
	favorites: string[]
	showUpdateWarning: boolean
	managementCodes: Record<string, string>
}

const defaultSettings: Settings = {
	enableTestDevice: false,
	enableWirepas5GMeshGateways: false,
	showFavorites: false,
	showSettings: false,
	favorites: [],
	showUpdateWarning: true,
	managementCodes: {},
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
	return defaultSettings
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
				settings,
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
