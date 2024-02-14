import { format, subSeconds } from 'date-fns'
import { Battery, Thermometer, X, Zap } from 'lucide-preact'
import { useRef } from 'preact/hooks'
import styled from 'styled-components'
import { colors } from '../colors.js'
import { useDevices, type Reading } from '../context/Devices.js'
import { useHistoryChart } from '../context/showHistoryChart.js'
import { HistoryChart } from './HistoryChart.js'
import type { Dataset } from './chartMath.js'
import type { LucideProps } from '../icons/lucide.js'
import type { Ref } from 'preact'

const chartBaseWidth = 0.6 // percent of window width
const chartBaseHeight = 0.5 // percent of window width

export const Button = styled.button`
	color: var(--color-nordic-middle-grey);
	background-color: transparent;
	padding: 0;
	border: 0;
`

export const ChartContainer = styled.aside`
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
	datasets: Dataset[]
	title: string
	Icon: (props: LucideProps) => JSX.Element | null
	color: string
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

	if (deviceId === undefined) return null

	const history = devices[deviceId]?.history

	const charts: ChartInfo[] = []

	if (history?.bat !== undefined) {
		charts.push({
			Icon: Battery,
			title: 'Batt.',
			color: colors['nordic-blue'],
			datasets: [
				{
					min: 3.0,
					max: 5.5,
					values: history.bat.map(([v, d]) => [v, subSeconds(history.base, d)]),
					color: colors['nordic-blue'],
					format: (v) => `${v.toFixed(1)}V`,
				},
			],
		})
	}
	if (history?.temp !== undefined) {
		charts.push({
			Icon: Thermometer,
			title: 'Temp.',
			color: colors['nordic-red'],
			datasets: [
				{
					min: findLowerLimit(history.temp),
					max: findUpperLimit(history.temp),
					values: history.temp.map(([v, d]) => [
						v,
						subSeconds(history.base, d),
					]),
					color: colors['nordic-red'],
					format: (v) => `${v.toFixed(1)}°C`,
				},
			],
		})
	}

	// Fuel gauge data
	const fgData: Dataset[] = []
	if (history?.fgI !== undefined) {
		fgData.push({
			min: -450, //-500,
			max: 100, //1000,
			values: history.fgI.map(([v, d]) => [v, subSeconds(history.base, d)]),
			color: colors['nordic-sun'],
			format: (v) => `${Math.round(v)} mA`,
		})
	}
	if (history?.fgSoC !== undefined) {
		fgData.push({
			min: 0,
			max: 100,
			values: history.fgSoC.map(([v, d]) => [v, subSeconds(history.base, d)]),
			color: colors['nordic-blue'],
			format: (v) => `${Math.round(v)}%`,
		})
	}
	if (fgData.length > 0) {
		charts.push({
			Icon: Zap,
			title: 'PMIC\nnPM1300',
			color: colors['nordic-sun'],
			datasets: fgData,
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
	white-space: break-spaces;
    text-align: center;
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
			ref={containerRef as Ref<HTMLElement>}
			style={{ height: `${height}px`, width: `${width}px` }}
		>
			{charts.map(({ datasets, color, Icon, title }, i) => (
				<ChartWithIcon>
					<IconWithText
						style={{
							color,
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
							datasets,
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
