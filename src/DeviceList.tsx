import { formatDistanceToNow } from 'date-fns'
import { MapPin, MapPinOff, Radio } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { GeoLocation, GeoLocationSource, useDevices } from './context/Devices'
import { useMap } from './context/Map'

const DeviceState = styled.section`
	color: var(--color-nordic-grass);
	font-family: var(--monospace-font);
	position: absolute;
	right: 0;
	top: 0;
	padding: 1rem 1rem 8rem 8rem;
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		li button {
			text-align: left;
			border: 0;
			background: transparent;
			color: inherit;
			display: flex;
			.lucide {
				margin-right: 0.5rem;
			}
			small {
				opacity: 0.8;
			}
		}
	}
	background: transparent;
	background: linear-gradient(
		200deg,
		var(--color-nordic-dark-grey) 0%,
		#333f4800 40%,
		#333f4800 100%
	);
`

const weighSource = (source: GeoLocationSource): number => {
	switch (source) {
		case GeoLocationSource.GNSS:
			return 1
		case GeoLocationSource.WIFI:
			return 2
		case GeoLocationSource.MULTI_CELL:
			return 3
		case GeoLocationSource.SINGLE_CELL:
			return 4
		default:
			return Number.MAX_SAFE_INTEGER
	}
}

const sortLocations = (
	{ source: source1 }: GeoLocation,
	{ source: source2 }: GeoLocation,
): number => weighSource(source1) - weighSource(source2)

export const DeviceList = () => {
	const { devices } = useDevices()
	const { map } = useMap()

	return (
		<DeviceState>
			<ul>
				{Object.entries(devices)
					.sort(([, { ts: ts1 }], [, { ts: ts2 }]) => ts1.localeCompare(ts2))
					.map(([k, { ts, location }]) => {
						const deviceLocation = Object.values(location ?? []).sort(
							sortLocations,
						)[0]
						return (
							<li>
								<button
									type={'button'}
									onClick={() => {
										if (deviceLocation !== undefined) {
											map?.center(deviceLocation)
										}
									}}
								>
									{deviceLocation !== undefined ? <MapPin /> : <MapPinOff />}
									<span>
										{k}
										<br />
										<small>
											<Radio strokeWidth={1} />
											<RelativeTime time={new Date(ts)} />
										</small>
									</span>
								</button>
							</li>
						)
					})}
			</ul>
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
