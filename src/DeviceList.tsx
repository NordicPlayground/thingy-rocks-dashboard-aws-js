import { RSRP, SignalQualityTriangle } from '@nordicsemiconductor/rsrp-bar'
import { Locate, MapPin, MapPinOff, Radio, SignalZero } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress'
import { useDevices } from './context/Devices'
import { useMap } from './context/Map'
import { useHistoryChart } from './context/showHistoryChart'
import { DisconnectedWarning } from './DisconnectedWarning'
import { LocationSourceButton } from './LocationSourceButton'
import { outerGlow } from './outerGlow'
import { PowerInfo } from './PowerInfo'
import { RelativeTime } from './RelativeTime'
import { sortLocations } from './sortLocations'

const DeviceState = styled.section`
	color: var(--color-nordic-sky);
	position: absolute;
	right: 0;
	top: 0;
	user-select: none;
	font-size: 14px;
	padding: 0.5rem 0.5rem 0 0;
	@media (min-width: 600px) {
		padding: 1rem 1rem 0 0;
		font-size: 16px;
	}
	ul {
		list-style: none;
		margin: 0;
		li {
			text-align: left;
			border: 0;
			background: transparent;
			color: inherit;
			text-shadow: ${outerGlow('#222', 2, 2)}, ${outerGlow('#222', 4, 4)};
			display: flex;
			.lucide,
			.rsrp {
				margin-right: 0.5rem;
				filter: ${outerGlow(
					'#22222266',
					1,
					2,
					(s) => `drop-shadow(${s})`,
					' ',
				)};
			}
			.rsrp {
				width: 20px;
				height: 20px;
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

export const DeviceList = () => {
	const { devices } = useDevices()
	const map = useMap()
	const { show: showHistoryChart } = useHistoryChart()

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
															renderInvalid={() => (
																<SignalZero strokeWidth={1} />
															)}
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
													showHistoryChart(deviceId)
												}}
											/>
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
