import { RSRP, SignalQualityTriangle } from '@nordicsemiconductor/rsrp-bar'
import { MapPin, Radio, SignalZero, Sun, Wifi } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress'
import { locationSourceColors } from './colors'
import { GeoLocationSource, useDevices } from './context/Devices'
import { useMap } from './context/Map'
import { useHistoryChart } from './context/showHistoryChart'
import { DisconnectedWarning } from './DisconnectedWarning'
import { DKIcon } from './DKIcon'
import { LocationSourceButton } from './LocationSourceButton'
import { PowerInfo } from './PowerInfo'
import { RelativeTime } from './RelativeTime'
import { sortLocations } from './sortLocations'
import { ThingyIcon } from './ThingyIcon'

const DeviceState = styled.section`
	color: var(--color-nordic-light-grey);
	position: absolute;
	right: 0;
	top: 0;
	user-select: none;
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		li {
			margin: 2px 2px 2px 0;
			padding: 1rem;
			text-align: left;
			border: 0;
			background-color: var(--color-panel-bg);
			color: inherit;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			dl {
				margin: 0;
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
				.lucide,
				.rsrp {
					margin-right: calc(1rem + 4px);
					margin-left: 4px;
				}
				.rsrp {
					width: 20px;
					height: 20px;
				}
			}
			button {
				border: 0;
				background: transparent;
				color: inherit;
				padding: 0;
			}
		}
	}
`

const SolarColor = styled.span`
	color: var(--color-nordic-sun);
`

const BoardName = styled.span`
	margin-right: 0.75rem;
	svg {
		margin-right: 0.25rem;
		width: 32px;
		height: 32px;
		margin-bottom: 0.5rem;
	}
`

const ShieldIcon = styled.span`
	margin-right: 0.25rem;
`

export const DeviceList = () => {
	const { devices } = useDevices()
	const map = useMap()
	const { toggle: toggleHistoryChart } = useHistoryChart()

	return (
		<DeviceState>
			<DisconnectedWarning />
			<ul>
				{Object.entries(devices)
					.sort(([, { ts: ts1 }], [, { ts: ts2 }]) => ts2.localeCompare(ts1))
					.map(([deviceId, device]) => {
						const { ts, location, state } = device
						const rankedLocations = Object.values(location ?? []).sort(
							sortLocations,
						)
						const deviceLocation = rankedLocations[0]

						const buttonPress = state?.btn
						const rsrpDbm = state?.roam?.v.rsrp
						const { brdV, appV } = state?.dev?.v ?? {}

						const shortenedDeviceId = deviceId.replace(
							/^[\d]+\d{4}$/,
							(match) => `…${match.slice(-4)}`,
						)

						const BoardIcon = brdV === 'nrf9160dk_nrf9160' ? DKIcon : ThingyIcon

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
									<BoardName>
										<BoardIcon />
										{appV?.includes('wifi') === true && (
											<ShieldIcon>
												<Wifi
													style={{
														color: locationSourceColors[GeoLocationSource.WIFI],
													}}
												/>
											</ShieldIcon>
										)}
										{appV?.includes('solar') === true && (
											<ShieldIcon>
												<SolarColor>
													<Sun />
												</SolarColor>
											</ShieldIcon>
										)}
									</BoardName>

									{shortenedDeviceId !== deviceId && (
										<abbr title={deviceId}>{shortenedDeviceId}</abbr>
									)}
									{shortenedDeviceId === deviceId && <>{deviceId}</>}
								</button>
								<dl>
									<dt>
										<Radio strokeWidth={1} />
									</dt>
									<dd>
										<abbr title="Last update">
											<RelativeTime time={new Date(ts)} />
										</abbr>
									</dd>
									{rsrpDbm !== undefined && (
										<>
											<dt>
												{
													<RSRP
														dbm={rsrpDbm}
														renderBar={({ quality }) => (
															<SignalQualityTriangle
																quality={quality}
																color={'inherit'}
																class="rsrp"
															/>
														)}
														renderInvalid={() => <SignalZero strokeWidth={1} />}
													/>
												}
											</dt>
											<dd>{rsrpDbm} dBm</dd>
										</>
									)}
									{buttonPress !== undefined && (
										<ButtonPress buttonPress={buttonPress} />
									)}
									{state !== undefined && (
										<PowerInfo
											state={state}
											onClick={() => {
												toggleHistoryChart(deviceId)
											}}
										/>
									)}
									{rankedLocations.length > 0 && (
										<>
											<dt>
												<MapPin strokeWidth={1} />
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
							</li>
						)
					})}
			</ul>
		</DeviceState>
	)
}
