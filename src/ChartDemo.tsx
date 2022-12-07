import { addMinutes, subMinutes } from 'date-fns'
import { colors } from './colors'

type Dataset = {
	min: number
	max: number
	values: [value: number, ts: Date][]
	color: string
	format: (v: number) => string
}
type XAxis = {
	minutes: number
	color: string
	labelEvery: number
	format: (d: Date) => string
}
type ChartData = {
	xAxis: XAxis
	datasets: Dataset[]
}

const chartMath = ({
	height,
	padding,
	startDate,
	minutes,
	labelEvery,
	xSpacing,
}: {
	height: number
	padding: number
	startDate: Date
	/**
	 * Number of Minutes to display in the chart
	 */
	minutes: number
	labelEvery: number
	xSpacing: number
}) => {
	const yAxisHeight = height - padding * 3 // 1 padding at top, two at bottom
	const xAxisWidth = (minutes / labelEvery - 1) * labelEvery * xSpacing
	const toTheNextFullTenMinutes = addMinutes(
		startDate,
		10 - (startDate.getMinutes() % 10),
	)
	toTheNextFullTenMinutes.setSeconds(0)
	const endDate = subMinutes(toTheNextFullTenMinutes, minutes)

	const startTs = toTheNextFullTenMinutes.getTime()
	const endTs = endDate.getTime()

	return {
		yPosition: (dataset: Dataset, value: number): number => {
			const valueAsPercent = Math.max(
				0,
				Math.min(1, ((value ?? 0) - dataset.min) / (dataset.max - dataset.min)),
			)
			return padding + yAxisHeight - valueAsPercent * yAxisHeight
		},
		xPosition: (dataset: Dataset, ts: Date): number | null => {
			const tsInt = ts.getTime()
			if (tsInt < endTs) return null
			if (tsInt > startTs) return null
			const timeAsPercent = Math.max(
				0,
				Math.min(1, (tsInt - endTs) / (startTs - endTs)),
			)
			return 2 * padding + timeAsPercent * xAxisWidth
		},
		yAxisHeight,
		xAxisWidth,
		padding,
		startDate: toTheNextFullTenMinutes,
		endDate,
	}
}

const generateLabels = (
	{ startDate: start }: ReturnType<typeof chartMath>,
	xAxis: XAxis,
): string[] => {
	const labels: string[] = []
	let labelTime = subMinutes(start, xAxis.minutes)
	for (let i = 0; i < xAxis.minutes / xAxis.labelEvery; i++) {
		labelTime = addMinutes(labelTime, xAxis.labelEvery)
		labels.push(xAxis.format(labelTime))
	}
	return labels
}

export const ChartDemo = ({
	padding,
	height,
	xSpacing,
}: {
	padding?: number
	height?: number
	xSpacing?: number
}) => {
	const data: ChartData = {
		xAxis: {
			color: colors['nordic-light-grey'],
			labelEvery: 10,
			minutes: 60,
			format: (d) => d.toISOString().slice(11, 16),
		},
		datasets: [
			{
				min: 2.5,
				max: 5.5,
				values: [
					[5.5, subMinutes(new Date(), 0)],
					[3.872, subMinutes(new Date(), 1)],
					[3.871, subMinutes(new Date(), 2)],
					[3.87, subMinutes(new Date(), 3)],
					[3.8, subMinutes(new Date(), 4)],
					[3.7, subMinutes(new Date(), 5)],
					[3.7, subMinutes(new Date(), 6)],
					[3.7, subMinutes(new Date(), 7)],
					[3.6, subMinutes(new Date(), 8)],
					[3.6, subMinutes(new Date(), 9)],
					[3.6, subMinutes(new Date(), 10)],
					[3.6, subMinutes(new Date(), 11)],
					[3.6, subMinutes(new Date(), 12)],
					[3.5, subMinutes(new Date(), 13)],
					[3.5, subMinutes(new Date(), 14)],
					[3.5, subMinutes(new Date(), 15)],
					[3.5, subMinutes(new Date(), 16)],
					[3.5, subMinutes(new Date(), 17)],
					[2.5, subMinutes(new Date(), 18)],
				],
				color: colors['nordic-blue'],
				format: (v) => `${v} V`,
			},
		],
	}

	const m = chartMath({
		height: height ?? 400,
		padding: padding ?? 25,
		startDate: new Date(),
		minutes: data.xAxis.minutes,
		labelEvery: data.xAxis.labelEvery,
		xSpacing: xSpacing ?? 10,
	})

	const labels = generateLabels(m, data.xAxis)

	const p = padding ?? 25
	const p2 = p * 2
	const h = height ?? 400
	const s = xSpacing ?? 10
	const chartWidth = m.xAxisWidth + 4 * p

	return (
		<svg
			width={chartWidth}
			height={h}
			viewBox={`0 0 ${chartWidth} ${h}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* x axis labels and lines */}
			<g>
				{labels.map((label, index) => (
					<>
						<path
							style={`stroke:${data.xAxis.color};stroke-width:0.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;fill:none`}
							d={`M ${p2 + s * data.xAxis.labelEvery * index},${p} v ${
								m.yAxisHeight
							}`}
						/>
						<text
							style={`fill:${data.xAxis.color}`}
							x={p2 + s * data.xAxis.labelEvery * index}
							y={h - p}
							text-anchor="middle"
						>
							{label}
						</text>
					</>
				))}
			</g>
			{/* datasets lines */}
			{data.datasets.map((dataset) => {
				const lineDefinition: string[] = []
				for (let i = 0; i < dataset.values.length; i++) {
					const [v, ts] = dataset.values[i] as [number, Date]
					const x = m.xPosition(dataset, ts)
					if (x === null) continue
					if (i === 0) {
						lineDefinition.push(`M ${x},${m.yPosition(dataset, v)}`)
					} else {
						lineDefinition.push(`L ${x},${m.yPosition(dataset, v)}`)
					}
				}
				return (
					<path
						style={`stroke:${dataset.color};stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;fill:none`}
						d={lineDefinition.join(' ')}
					/>
				)
			})}
			{/* dataset labels */}
			{data.datasets.map((dataset) => {
				const labels = []
				for (let i = 0; i < dataset.values.length; i++) {
					if (i % data.xAxis.labelEvery === 0) {
						const [v, ts] = dataset.values[i] as [number, Date]
						const x = m.xPosition(dataset, ts)
						if (x === null) continue
						labels.push(
							<circle
								style={`fill:none;stroke:${dataset.color};stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;paint-order:markers fill stroke`}
								cy={m.yPosition(dataset, v)}
								cx={x}
								r="6"
							/>,
						)
						labels.push(
							<text
								style={`fill:${dataset.color};font-weight:700;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers`}
								y={m.yPosition(dataset, v) - m.padding / 2}
								x={x}
								text-anchor="middle"
							>
								{dataset.format(v)}
							</text>,
						)
					}
				}
				return labels
			})}
		</svg>
	)
}
