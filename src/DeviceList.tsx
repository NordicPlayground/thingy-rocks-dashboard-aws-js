import { formatDistanceToNow } from 'date-fns'
import { BatteryMedium, Locate, MapPin, MapPinOff, Radio } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { locationSourceColors } from './colors'
import {
	Device,
	GeoLocation,
	GeoLocationSource,
	useDevices,
} from './context/Devices'
import { LocationSourceLabels } from './context/LocationSourceLabels'
import { useMap } from './context/Map'

const outerGlow = (
	color: string,
	distance = 1,
	blur = 0,
	wrap = (s: string): string => s,
	join = ', ',
) => {
	const glows = []
	for (const [x, y] of [
		[1, 0],
		[1, 1],
		[0, 1],
		[-1, 1],
		[-1, 0],
		[-1, -1],
		[0, -1],
		[-1, -1],
	] as [number, number][]) {
		glows.push(wrap(`${x * distance}px ${y * distance}px ${blur}px ${color}`))
	}
	return `${glows.join(join)}`
}

const DeviceState = styled.section`
	color: var(--color-nordic-sky);
	position: absolute;
	right: 0;
	top: 0;
	user-select: none;
	ul {
		font-size: 14px;
		padding: 0.5rem 0.5rem 0 0;
		@media (min-width: 600px) {
			padding: 1rem 1rem 0 0;
			font-size: 16px;
		}
		list-style: none;
		margin: 0;
		li {
			text-align: left;
			border: 0;
			background: transparent;
			color: inherit;
			text-shadow: ${outerGlow('#222', 2, 2)}, ${outerGlow('#222', 4, 4)};
			display: flex;
			.lucide {
				margin-right: 0.5rem;
				filter: ${outerGlow('#222', 1, 1, (s) => `drop-shadow(${s})`, ' ')};
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
					white-space: nowrap;
				}
			}
			button {
				border: 0;
				background: transparent;
				color: inherit;
				text-shadow: inherit;
				padding: 0;
				text-decoration: inherit;
			}
		}
	}
`

const LocationSourceSwitch = styled.span`
	font-size: 90%;
	font-weight: var(--monospace-font-weight-bold);
	& + & {
		margin-left: 0.25rem;
	}
`

const LocationSourceLabelDisabled = styled(LocationSourceSwitch)`
	color: var(--color-nordic-middle-grey);
	text-decoration: line-through;
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
					.map(([deviceId, device]) => {
						const { ts, location, state } = device
						const rankedLocations = Object.values(location ?? []).sort(
							sortLocations,
						)
						const deviceLocation = rankedLocations[0]
						const batteryVoltage = state?.bat?.v
						return (
							<li>
								{deviceLocation !== undefined ? <MapPin /> : <MapPinOff />}
								<span>
									<button
										type={'button'}
										onClick={() => {
											if (deviceLocation !== undefined) {
												map?.center(deviceLocation)
											}
										}}
									>
										{deviceId}
									</button>
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
														<LocationSourceButton
															device={device}
															source={source}
														/>
													))}
												</dd>
											</>
										)}
									</dl>
								</span>
							</li>
						)
					})}
			</ul>
		</DeviceState>
	)
}

const RelativeTime = ({ time }: { time: Date }) => {
	const format = () => formatDistanceToNow(time, { addSuffix: true })
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

const LocationSourceButton = ({
	device: { id, hiddenLocations },
	source,
}: {
	device: Device
	source: GeoLocationSource
}) => {
	const { toggleHiddenLocation } = useDevices()

	const Button = () => (
		<button
			onClick={() => {
				toggleHiddenLocation(id, source)
			}}
		>
			{LocationSourceLabels[source]}
		</button>
	)

	const isDisabled = hiddenLocations?.[source] ?? false

	if (isDisabled)
		return (
			<LocationSourceLabelDisabled>
				<Button />
			</LocationSourceLabelDisabled>
		)

	return (
		<LocationSourceSwitch style={{ color: locationSourceColors[source] }}>
			<Button />
		</LocationSourceSwitch>
	)
}
