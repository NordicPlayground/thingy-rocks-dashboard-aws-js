import { subMinutes } from 'date-fns'
import type { chartMath, XAxis } from './chartMath'

export const generateLabels = (
	{ startDate }: ReturnType<typeof chartMath>,
	xAxis: XAxis,
): string[] => {
	let labelTime: Date = startDate
	const labels: string[] = [xAxis.format(labelTime)]
	for (let i = 0; i <= xAxis.minutes / xAxis.labelEvery; i++) {
		labelTime = subMinutes(labelTime, xAxis.labelEvery)
		labels.unshift(xAxis.format(labelTime))
	}
	return labels
}
