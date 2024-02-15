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
				const maybeDeviceId = new URL(ev.newURL).hash.slice(1)
				if (maybeDeviceId.length > 0) {
					setDeviceId(maybeDeviceId)
				} else {
					setDeviceId(undefined)
				}
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
