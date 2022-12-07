import { LineChart } from 'lucide-preact'
import styled from 'styled-components'
import { useHistoryChart } from '../context/showHistoryChart'

const StackedIcons = styled.span`
	color: var(--color-nordic-red);
`

export const CloseHistoryChartButton = () => {
	const { deviceId, hide } = useHistoryChart()
	if (deviceId === undefined) return null
	return (
		<button type={'button'} class={`btn btn-link`} onClick={() => hide()}>
			<StackedIcons>
				<LineChart />
			</StackedIcons>
		</button>
	)
}
