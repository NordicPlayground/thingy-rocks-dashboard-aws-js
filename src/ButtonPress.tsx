import { Focus } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import type { ButtonPress as ButtonPressData } from './context/Devices'

const diff = (press: ButtonPressData): number =>
	Math.round((Date.now() - press.ts) / 1000)

/**
 * Display a button press for a given period
 */
export const ButtonPress = ({
	buttonPress,
	untilSeconds,
}: {
	buttonPress: ButtonPressData
	untilSeconds?: number
}) => {
	const [diffSeconds, setDiffSeconds] = useState<number>(diff(buttonPress))

	useEffect(() => {
		const i = setInterval(() => {
			const diffSeconds = diff(buttonPress)
			setDiffSeconds(diffSeconds)
			if (diffSeconds > (untilSeconds ?? 30)) clearInterval(i)
		}, 1000)
		return () => {
			clearInterval(i)
		}
	}, [buttonPress])

	if (diffSeconds > (untilSeconds ?? 30)) return null

	const HotDt = styled.dt`
		color: var(--color-nordic-pink);
	`
	const HotDl = styled.dt`
		color: var(--color-nordic-pink);
	`
	return (
		<>
			<HotDt>
				<Focus strokeWidth={2} />
			</HotDt>
			<HotDl>{diffSeconds} seconds ago</HotDl>
		</>
	)
}
