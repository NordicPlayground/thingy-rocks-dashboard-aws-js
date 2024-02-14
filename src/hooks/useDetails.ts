import { useEffect, useState } from 'preact/hooks'

export const showDetails = (deviceId: string): void =>
	document.location.assign(new URL(`/#${deviceId}`, document.location.href))

export const hideDetails = (): void =>
	document.location.assign(new URL('/#', document.location.href))

export const useDetails = (): string | undefined => {
	const [deviceId, setDeviceId] = useState<string>()

	useEffect(() => {
		const listener = (ev: HashChangeEvent) => {
			try {
				setDeviceId(new URL(ev.newURL).hash.slice(1))
			} catch (err) {
				console.debug(`[useDetails]`, err)
			}
		}
		window.addEventListener('hashchange', listener)

		return () => {
			window.removeEventListener('hashchange', listener)
		}
	}, [])

	return deviceId
}
