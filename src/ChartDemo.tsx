import { colors } from './colors'

type Dataset = {
	min: number
	max: number
	values: number[]
	color: string
	format: (v: number) => string
}
type ChartData = {
	xAxis: { labels: string[]; color: string; labelEvery: number }
	datasets: Dataset[]
}

const chartMath = ({
	height,
	padding,
}: {
	height: number
	padding: number
}) => {
	const yAxisHeight = height - padding * 3 // 1 padding at top, two at bottom

	return {
		yPosition: (dataset: Dataset, value?: number): number => {
			const valueAsPercent = Math.max(
				0,
				Math.min(1, ((value ?? 0) - dataset.min) / (dataset.max - dataset.min)),
			)
			return padding + yAxisHeight - valueAsPercent * yAxisHeight
		},
		yAxisHeight,
		padding,
	}
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
			labels: ['12:00', '12:10', '12:20', '12:30', '12:40', '12:50', '13:00'],
			color: colors['nordic-light-grey'],
			labelEvery: 10,
		},
		datasets: [
			{
				min: 2.5,
				max: 5.5,
				values: [
					5.5, 3.872, 3.871, 3.87, 3.8, 3.7, 3.7, 3.7, 3.6, 3.6, 3.6, 3.6, 3.6,
					3.5, 3.5, 3.5, 3.5, 3.5, 2.5,
				],
				color: colors['nordic-blue'],
				format: (v) => `${v} V`,
			},
		],
	}

	const p = padding ?? 25
	const p2 = p * 2
	const h = height ?? 400
	const s = xSpacing ?? 10
	const chartWidth =
		(data.xAxis.labels.length - 1) * s * data.xAxis.labelEvery + 4 * p

	const m = chartMath({ height: height ?? 400, padding: padding ?? 25 })

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
				{data.xAxis.labels.map((label, index) => (
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
					if (i === 0) {
						lineDefinition.push(
							`M ${p2 + s * i},${m.yPosition(dataset, dataset.values[i])}`,
						)
					} else {
						lineDefinition.push(
							`L ${p2 + s * i},${m.yPosition(dataset, dataset.values[i])}`,
						)
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
						labels.push(
							<circle
								style={`fill:none;stroke:${dataset.color};stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;paint-order:markers fill stroke`}
								cy={m.yPosition(dataset, dataset.values[i])}
								cx={p2 + s * i}
								r="6"
							/>,
						)
						labels.push(
							<text
								style={`fill:${dataset.color};font-weight:700;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;paint-order:stroke fill markers`}
								y={m.yPosition(dataset, dataset.values[i]) - m.padding / 2}
								x={p2 + s * i}
								text-anchor="middle"
							>
								{dataset.format(dataset.values[i] ?? 0)}
							</text>,
						)
					}
				}
				return labels
			})}
		</svg>
	)
}
