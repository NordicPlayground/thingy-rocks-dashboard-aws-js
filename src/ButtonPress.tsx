import { Focus } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import type { ButtonPress as ButtonPressData } from './context/Devices'

const diff = (ts: ButtonPressData['ts']): number =>
	Math.floor((Date.now() - ts) / 1000)

const HotDt = styled.dt`
	color: var(--color-nordic-pink);
`
const HotDd = styled.dd`
	color: var(--color-nordic-pink);
`

/**
 * Display a button press for a given period
 */
export const ButtonPress = ({
	buttonPress: { ts },
	untilSeconds,
}: {
	buttonPress: ButtonPressData
	untilSeconds?: number
}) => {
	const [diffSeconds, setDiffSeconds] = useState<number>(diff(ts))

	useEffect(() => {
		const i = setInterval(() => {
			const diffSeconds = diff(ts)
			setDiffSeconds(diffSeconds)
			if (diffSeconds > (untilSeconds ?? 30)) clearInterval(i)
		}, 1000)
		return () => {
			clearInterval(i)
		}
	}, [ts])

	if (diffSeconds > (untilSeconds ?? 30)) return null

	return (
		<>
			<HotDt>
				<Focus strokeWidth={2} />
			</HotDt>
			<HotDd>{diffSeconds} seconds ago</HotDd>
		</>
	)
}
