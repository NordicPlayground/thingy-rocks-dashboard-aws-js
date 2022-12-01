import { formatDistanceToNow } from 'date-fns'
import { BatteryMedium, Locate, MapPin, MapPinOff, Radio } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { locationSourceColors } from './colors'
import { GeoLocation, GeoLocationSource, useDevices } from './context/Devices'
import { LocationSourceLabels } from './context/LocationSourceLabels'
import { useMap } from './context/Map'

const DeviceState = styled.section`
	color: var(--color-nordic-blue);
	position: absolute;
	right: 0;
	top: 0;
	font-size: 14px;
	padding: 0.5rem;
	@media (min-width: 600px) {
		padding: 1rem 1rem 8rem 8rem;
		font-size: 16px;
	}
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
			dl {
				display: grid;
				grid-template-columns: auto auto;
				grid-template-rows: 1fr;
				grid-auto-rows: auto;
				grid-column-gap: 0px;
				grid-row-gap: 0px;
				dd {
					margin-bottom: 0;
				}
			}
		}
	}
	background: transparent;
	background: linear-gradient(
		220deg,
		var(--color-nordic-dark-grey) 0%,
		#333f4800 50%,
		#333f4800 100%
	);
`

const LocationSourceLabel = styled.span`
	font-size: 90%;
	font-weight: var(--monospace-font-weight-bold);
	& + & {
		margin-left: 0.25rem;
	}
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
					.sort(([, { ts: ts1 }], [, { ts: ts2 }]) => ts2.localeCompare(ts1))
					.map(([k, { ts, location, state }]) => {
						const rankedLocations = Object.values(location ?? []).sort(
							sortLocations,
						)
						const deviceLocation = rankedLocations[0]
						const batteryVoltage = state?.bat?.v
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
										<dl>
											<dt>
												<Radio strokeWidth={1} />
											</dt>
											<dd>
												<abbr title="Last update">
													<RelativeTime time={new Date(ts)} />
												</abbr>
											</dd>
											{batteryVoltage !== undefined && (
												<>
													<dt>
														<BatteryMedium strokeWidth={1} />
													</dt>
													<dt>{batteryVoltage / 1000} V</dt>
												</>
											)}
											{rankedLocations.length > 0 && (
												<>
													<dt>
														<Locate strokeWidth={1} />
													</dt>
													<dd>
														{rankedLocations.map(({ source }) => (
															<LocationSourceLabel
																style={{ color: locationSourceColors[source] }}
															>
																{LocationSourceLabels[source]}
															</LocationSourceLabel>
														))}
													</dd>
												</>
											)}
										</dl>
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
