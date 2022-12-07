import styled from 'styled-components'
import { ChartData, chartMath } from '../chart/chartMath'
import { generateLabels } from '../chart/generateLabels'

const SVG = styled.svg`
	position: absolute;
	bottom: 1rem;
	left: 1rem;
`

export const HistoryChart = ({
	data,
	padding,
	height,
	width,
}: {
	data: ChartData
	padding?: number
	height?: number
	width?: number
}) => {
	const h = height ?? 300
	const w = width ?? 600
	const p = padding ?? 25

	const m = chartMath({
		width: w,
		height: h,
		padding: p,
		startDate: new Date(),
		minutes: data.xAxis.minutes,
		labelEvery: data.xAxis.labelEvery,
	})

	const labels = generateLabels(m, data.xAxis)

	return (
		<SVG
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			{/* x axis labels and lines */}
			<g>
				{labels.map((label, index) => (
					<>
						<path
							style={`stroke:${data.xAxis.color};stroke-width:0.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;fill:none`}
							d={`M ${
								m.padding * 2 + m.xSpacing * data.xAxis.labelEvery * index
							},${p} v ${m.yAxisHeight}`}
						/>
						<text
							style={`fill:${data.xAxis.color}`}
							x={m.padding * 2 + m.xSpacing * data.xAxis.labelEvery * index}
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
		</SVG>
	)
}
