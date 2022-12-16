import { addMinutes } from 'date-fns'

export type Dataset = {
	min: number
	max: number
	values: [value: number, ts: Date][]
	color: string
	format: (v: number) => string
}
export type XAxis = {
	minutes: number
	color: string
	labelEvery: number
	format: (d: Date) => string
	hideLabels: boolean
}
export type ChartData = {
	xAxis: XAxis
	datasets: Dataset[]
}

export const chartMath = ({
	width,
	height,
	padding,
	startDate,
	minutes,
	labelEvery,
	hideXAxisLabels,
}: {
	width: number
	height: number
	padding: number
	startDate: Date
	/**
	 * Number of Minutes to display in the chart
	 */
	minutes: number
	labelEvery: number
	hideXAxisLabels: boolean
}): {
	yPosition: (dataset: Dataset, value: number) => number
	xPosition: (dataset: Dataset, ts: Date) => number | null
	yAxisHeight: number
	xAxisWidth: number
	padding: number
	startDate: Date
	endDate: Date
	xSpacing: number
	paddingLeft: number
} => {
	const numPaddingLeft = 3
	const numPaddingRight = 2
	const yAxisHeight =
		height - padding - (hideXAxisLabels ? padding : 2 * padding) // 1 padding at top, two at bottom (if labels are not hidden, otherwise one)
	const xAxisWidth = width - padding * (numPaddingLeft + numPaddingRight) // 2 padding left and right
	const xSpacing = xAxisWidth / ((minutes / labelEvery + 1) * labelEvery)
	const nextTenMinutes = addMinutes(
		startDate,
		10 - (startDate.getMinutes() % 10),
	)
	nextTenMinutes.setSeconds(0)

	const prevTenMinutes = addMinutes(
		startDate,
		10 - (startDate.getMinutes() % 10) - minutes,
	)
	prevTenMinutes.setSeconds(0)

	const startTs = nextTenMinutes.getTime()
	const endTs = prevTenMinutes.getTime()

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
			return numPaddingLeft * padding + timeAsPercent * xAxisWidth
		},
		yAxisHeight,
		xAxisWidth,
		padding,
		startDate: nextTenMinutes,
		endDate: prevTenMinutes,
		xSpacing,
		paddingLeft: padding * numPaddingLeft,
	}
}
