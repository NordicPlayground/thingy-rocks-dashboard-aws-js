import { formatDistanceToNow } from 'date-fns'
import { Radio } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { useDevices } from './context/Devices'

const DeviceState = styled.section`
	color: var(--color-nordic-grass);
	font-family: var(--monospace-font);
	position: absolute;
	right: 0;
	top: 0;
	padding: 1rem;
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		li {
			display: flex;
			.lucide {
				margin-right: 0.5rem;
			}
			small {
				opacity: 0.8;
			}
		}
	}
`

export const DeviceList = () => {
	const { devices: messages } = useDevices()

	return (
		<DeviceState>
			{Object.entries(messages)
				.sort(([, { ts: ts1 }], [, { ts: ts2 }]) => ts1.localeCompare(ts2))
				.map(([k, { ts }]) => (
					<ul>
						<li>
							<Radio />
							<span>
								{k}
								<br />
								<small>
									<RelativeTime time={new Date(ts)} />
								</small>
							</span>
						</li>
					</ul>
				))}
		</DeviceState>
	)
}

const RelativeTime = ({ time }: { time: Date }) => {
	const format = () =>
		formatDistanceToNow(time, { includeSeconds: true, addSuffix: true })
	const [formatted, setFormatted] = useState<string>(format())

	useEffect(() => {
		const i = setInterval(() => {
			setFormatted(format())
		}, 1000)

		return () => {
			clearInterval(i)
		}
	}, [time])

	return <time dateTime={time.toISOString()}>{formatted}</time>
}
