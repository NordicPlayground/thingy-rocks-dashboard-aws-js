import { Chart } from 'chart.js/auto'
import { Ulid } from 'id128'
import { useEffect, useRef } from 'preact/hooks'
import styled from 'styled-components'
import { colors } from './colors'

const Wrapper = styled.div`
	width: 50vw;
	height: 25vw;
	position: absolute;
	bottom: 50px;
	left: 0;
`

export const DeviceChart = () => {
	const id = useRef<string>(Ulid.generate().toCanonical())

	useEffect(() => {
		const ctx = document.getElementById(id.current)

		if (ctx === null) return

		const labels = [
			'13:10',
			'13:15',
			'13:20',
			'13:25',
			'13:30',
			'13:35',
			'13:40',
			'13:45',
		]
		const chart = new Chart(ctx as HTMLCanvasElement, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Voltage',
						data: [3.618, 3.6, 3.55, 3.5, 3.45, 3.4, 3.35, 3.3, 3.25],
						borderColor: colors['nordic-blue'],
						backgroundColor: `${colors['nordic-blue']}88`,
						yAxisID: 'v',
						tension: 0.4,
					},
					{
						label: 'Temperature',
						data: [19, 21, 22.5, 23, 23, 23, 22.5, 21, 20],
						yAxisID: 't',
						borderColor: colors['nordic-red'],
						backgroundColor: `${colors['nordic-red']}88`,
						tension: 0.4,
					},
					{
						label: 'Gain',
						data: [10, 0, 0, 5, 5, 5, 5, 10, 10],
						yAxisID: 'gain',
						borderColor: colors['nordic-grass'],
						backgroundColor: `${colors['nordic-grass']}88`,
					},
				],
			},
			options: {
				responsive: true,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				plugins: {
					legend: {
						display: false,
					},
				},
				scales: {
					v: {
						type: 'linear',
						display: false,
						position: 'left',
						suggestedMin: 0,
						suggestedMax: 5.5,
						// grid line settings
						grid: {
							drawOnChartArea: false, // only want the grid lines for one axis to show up
						},
					},
					t: {
						type: 'linear',
						display: false,
						position: 'right',
						// grid line settings
						grid: {
							drawOnChartArea: false, // only want the grid lines for one axis to show up
						},
						suggestedMin: 10,
						suggestedMax: 23,
					},
					gain: {
						type: 'linear',
						display: false,
						position: 'right',
						// grid line settings
						grid: {
							drawOnChartArea: false, // only want the grid lines for one axis to show up
						},
						suggestedMin: 0,
						suggestedMax: 100,
					},
				},
			},
		})

		return () => {
			chart.destroy()
		}
	}, [])

	return (
		<Wrapper>
			<canvas id={id.current}></canvas>
		</Wrapper>
	)
}
