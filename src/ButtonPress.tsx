import { Focus } from 'lucide-preact'
import { styled } from 'styled-components'
import type { ButtonPress as ButtonPressData } from './context/Devices.js'
import { ShowWhenHot } from './ShowWhenHot.js'

export const diff = (ts: ButtonPressData['ts']): number =>
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
export const ButtonPress = (props: { buttonPress: ButtonPressData }) => {
	return (
		<ShowWhenHot ts={new Date(props.buttonPress.ts)}>
			{(diffSeconds) => (
				<>
					<HotDt>
						<Focus strokeWidth={2} />
					</HotDt>
					<HotDd>{diffSeconds} seconds ago</HotDd>
				</>
			)}
		</ShowWhenHot>
	)
}
