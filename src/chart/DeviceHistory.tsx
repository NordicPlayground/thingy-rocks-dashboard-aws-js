import { format, subSeconds } from 'date-fns'
import { Battery, LucideProps, Sun, Thermometer, X } from 'lucide-preact'
import { useRef } from 'preact/hooks'
import styled from 'styled-components'
import { colors } from '../colors'
import { Reading, useDevices } from '../context/Devices'
import { useSettings } from '../context/Settings'
import { useHistoryChart } from '../context/showHistoryChart'
import type { Dataset } from './chartMath'
import { HistoryChart } from './HistoryChart'

const chartBaseWidth = 0.6 // percent of window width
const chartBaseHeight = 0.5 // percent of window width

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
	svg {
		width: 100%;
	}
	${Button} {
		position: absolute;
		right: 0;
		top: 0;
		padding: 1rem;
	}
`

type ChartInfo = {
	dataset: Dataset
	title: string
	Icon: (props: LucideProps) => JSX.Element
}

const findUpperLimit = (v: Array<Reading>): number =>
	Math.ceil(
		(v
			.map(([v]) => v)
			.sort((v1, v2) => v1 - v2)
			.pop() as number) * 1.05,
	)

const findLowerLimit = (v: Array<Reading>): number =>
	Math.floor(
		(v
			.map(([v]) => v)
			.sort((v1, v2) => v2 - v1)
			.pop() as number) * 0.95,
	)

/**
 * Displays the history chart
 */
export const DeviceHistory = () => {
	const { devices } = useDevices()
	const { deviceId } = useHistoryChart()
	const {
		settings: { gainReferenceEveryHour, gainReferenceEveryMinute },
	} = useSettings()

	if (deviceId === undefined) return null

	const history = devices[deviceId]?.history

	const charts: ChartInfo[] = []

	if (history?.solGain !== undefined) {
		charts.push({
			Icon: Sun,
			title: 'Solar',
			dataset: {
				min: 0,
				max: 5,
				values: history.solGain.map(([v, d]) => [
					v,
					subSeconds(history.base, d),
				]),
				color: colors['nordic-sun'],
				format: (v) => `${v.toFixed(1)}mA`,
				helperLines: [
					{
						label: '1m',
						value: gainReferenceEveryMinute,
					},
					{
						label: '60m',
						value: gainReferenceEveryHour,
					},
				],
			},
		})
	}
	if (history?.bat !== undefined) {
		charts.push({
			Icon: Battery,
			title: 'Batt.',
			dataset: {
				min: 2.5,
				max: 5.5,
				values: history.bat.map(([v, d]) => [v, subSeconds(history.base, d)]),
				color: colors['nordic-blue'],
				format: (v) => `${v.toFixed(1)}V`,
				helperLines: (history?.guides ?? [])
					.filter(([type]) => type === 'bat')
					.map(([, v, d]) => ({
						label: `${Math.floor(
							(Date.now() - subSeconds(history.base, d).getTime()) /
								1000 /
								60 /
								60,
						)}h ago`,
						value: v,
					})),
			},
		})
	}
	if (history?.temp !== undefined) {
		charts.push({
			Icon: Thermometer,
			title: 'Temp.',
			dataset: {
				min: findLowerLimit(history.temp),
				max: findUpperLimit(history.temp),
				values: history.temp.map(([v, d]) => [v, subSeconds(history.base, d)]),
				color: colors['nordic-red'],
				format: (v) => `${v.toFixed(1)}°C`,
			},
		})
	}

	return <Chart charts={charts} key={deviceId} />
}

const ChartWithIcon = styled.section`
	position: relative;
`

const IconWithText = styled.div`
	display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
	position: absolute;
	top: 0;
	left: 0;
	width: 10%;
	height: 100%;
}
`

const Chart = ({ charts: charts }: { charts: ChartInfo[] }) => {
	const containerRef = useRef<HTMLDivElement>()
	const { hide } = useHistoryChart()
	const [width, height] = [
		window.innerWidth * chartBaseWidth,
		((window.innerHeight * chartBaseHeight) / 3) * charts.length,
	]

	return (
		<ChartContainer
			ref={containerRef}
			style={{ height: `${height}px`, width: `${width}px` }}
		>
			{charts.map(({ dataset, Icon, title }, i) => (
				<ChartWithIcon>
					<IconWithText
						style={{
							color: dataset.color,
						}}
					>
						<Icon
							strokeWidth={1}
							width={(height / charts.length) * 0.2}
							height={(height / charts.length) * 0.2}
						/>
						{title}
					</IconWithText>
					<HistoryChart
						data={{
							xAxis: {
								color: colors['nordic-light-grey'],
								labelEvery: 10,
								minutes: 60,
								format: (d) => format(d, 'HH:mm'),
								hideLabels: i !== charts.length - 1,
							},
							datasets: [dataset],
						}}
						width={width}
						height={height / charts.length}
					/>
				</ChartWithIcon>
			))}
			<Button type={'button'} onClick={() => hide()}>
				<X />
			</Button>
		</ChartContainer>
	)
}
