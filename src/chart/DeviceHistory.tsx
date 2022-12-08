import { format, subSeconds } from 'date-fns'
import { X } from 'lucide-preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import styled from 'styled-components'
import { colors } from '../colors'
import { useDevices } from '../context/Devices'
import { HistoryChart } from '../context/HistoryChart'
import { useHistoryChart } from '../context/showHistoryChart'
import type { ChartData, Dataset } from './chartMath'

const Button = styled.button`
	color: var(--color-nordic-middle-grey);
	background-color: transparent;
	padding: 0;
	border: 0;
`

const ChartContainer = styled.aside`
	background-color: var(--color-panel-bg);
	position: absolute;
	bottom: 0;
	left: 0;
	width: 65vw;
	height: 30vw;
	svg {
		width: 100%;
		font-size: 16px;
	}
	${Button} {
		position: absolute;
		right: 0;
		top: 0;
		padding: 1rem;
	}
`

/**
 * Displays the history chart
 */
export const DeviceHistory = () => {
	const { devices } = useDevices()
	const { deviceId, hide } = useHistoryChart()
	const containerRef = useRef<HTMLDivElement>()
	const [size, setSize] = useState<[width: number, height: number]>([600, 300])

	useEffect(() => {
		if (containerRef.current === undefined || containerRef.current === null)
			return
		setSize([
			containerRef.current.clientWidth,
			containerRef.current.clientHeight,
		])
	}, [containerRef.current])

	if (deviceId === undefined) return null

	const history = devices[deviceId]?.history

	const datasets: Dataset[] = []

	if (history?.bat !== undefined) {
		datasets.push({
			min: 2.5,
			max: 5.5,
			values: history.bat.map(([v, d]) => [v, subSeconds(history.base, d)]),
			color: colors['nordic-blue'],
			format: (v) => `${v} V`,
		})
	}
	if (history?.temp !== undefined) {
		datasets.push({
			min: 0,
			max: Math.ceil(
				(history.temp
					.map(([v]) => v)
					.sort((v1, v2) => v1 - v2)
					.pop() as number) * 1.1,
			),
			values: history.temp.map(([v, d]) => [v, subSeconds(history.base, d)]),
			color: colors['nordic-red'],
			format: (v) => `${v} °C`,
		})
	}
	if (history?.solGain !== undefined) {
		datasets.push({
			min: 0,
			max: 30,
			values: history.solGain.map(([v, d]) => [v, subSeconds(history.base, d)]),
			color: colors['nordic-sun'],
			format: (v) => `${v} mA`,
		})
	}

	const data: ChartData = {
		xAxis: {
			color: colors['nordic-light-grey'],
			labelEvery: 10,
			minutes: 60,
			format: (d) => format(d, 'HH:mm'),
		},
		datasets,
	}

	return (
		<ChartContainer ref={containerRef}>
			<HistoryChart data={data} width={size[0]} height={size[1]} />
			<Button type={'button'} onClick={() => hide()}>
				<X />
			</Button>
		</ChartContainer>
	)
}
