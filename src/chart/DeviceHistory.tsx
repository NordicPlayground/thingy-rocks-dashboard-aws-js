import { format, subSeconds } from 'date-fns'
import { colors } from '../colors'
import { useDevices } from '../context/Devices'
import { HistoryChart } from '../context/HistoryChart'
import { useHistoryChart } from '../context/showHistoryChart'
import type { ChartData, Dataset } from './chartMath'

/**
 * Displays the history chart
 */
export const DeviceHistory = () => {
	const { devices } = useDevices()
	const { deviceId } = useHistoryChart()

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

	return <HistoryChart data={data} />
}
