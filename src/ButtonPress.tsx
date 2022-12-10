import { Focus } from 'lucide-preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import type { ButtonPress as ButtonPressData } from './context/Devices'

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
	const diff = useCallback(
		() => Math.round((Date.now() - buttonPress.ts) / 1000),
		[buttonPress],
	)
	const [diffSeconds, setDiffSeconds] = useState<number>(diff())

	useEffect(() => {
		const i = setInterval(() => {
			const diffSeconds = diff()
			setDiffSeconds(diffSeconds)
			if (diffSeconds > (untilSeconds ?? 30)) clearInterval(i)
		}, 1000)
		return () => {
			clearInterval(i)
		}
	}, [diff])

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
