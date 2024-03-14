import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'
import { isEqual } from 'lodash-es'

export type Reboot = {
	reason: number // e.g. 7
	type: 'memfault'
	software_version: {
		software_type: {
			id: number // e.g. 32069;
			name: string // e.g. 'thingy_world'
		}
		archived: boolean
		version: string // e.g. '1.11.1+thingy91.low-power.memfault'
		id: number //e.g. 504765
	}
	time: string // e.g. '2024-03-14T07:26:37.270000+00:00'
}
const Context =
	'https://github.com/NordicPlayground/thingy-rocks-cloud-aws-js/Memfault/reboots'

const MemfaultContext = createContext<{
	reboots: Record<string, Reboot[]>
}>({
	reboots: {},
})

export const Consumer = MemfaultContext.Consumer
export const useMemfault = () => useContext(MemfaultContext)

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [reboots, setReboots] = useState<Record<string, Reboot[]>>({})

	const fetchReboots = async () => {
		void fetch(
			'https://thingy-rocks-backend-memfaultbucket5f3ac6a2-xx9odkwa8f89.s3.eu-central-1.amazonaws.com/device-reboots.json',
		)
			.then(async (res) => res.json())
			.then((data) => {
				if (data['@context'] === Context)
					setReboots((current) => {
						if (isEqual(current, data.reboots)) {
							return current
						}
						console.log(`[Memfault]`, data.reboots)
						return data.reboots
					})
			})
			.catch((err) => {
				console.error('[Memfault]', err)
			})
	}

	useEffect(() => {
		const i = setInterval(fetchReboots, 5 * 60 * 1000)

		void fetchReboots()

		return () => {
			clearInterval(i)
		}
	}, [])

	return (
		<MemfaultContext.Provider
			value={{
				reboots,
			}}
		>
			{children}
		</MemfaultContext.Provider>
	)
}
