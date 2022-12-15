import { Sun, UploadCloud, Wifi } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress'
import { locationSourceColors } from './colors'
import { GeoLocationSource, useDevices } from './context/Devices'
import { useMap } from './context/Map'
import { useHistoryChart } from './context/showHistoryChart'
import { DisconnectedWarning } from './DisconnectedWarning'
import { DKIcon } from './DKIcon'
import { EnvironmentInfo } from './EnvironmentInfo'
import { LocationInfo } from './LocationInfo'
import { PowerInfo } from './PowerInfo'
import { RelativeTime } from './RelativeTime'
import { SignalQuality } from './SignalQuality'
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
				dt {
					display: flex;
					align-items: center;
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

const LastUpdate = styled.abbr`
	margin-left: 0.5rem;
	opacity: 0.8;
	font-size: 80%;
	svg {
		margin-right: 0.5rem;
	}
`

const TitleButton = styled.button`
	display: flex;
	width: 100%;
	justify-content: space-between;
	align-items: center;
`

export const DeviceList = () => {
	const { devices, lastUpdateTs } = useDevices()
	const map = useMap()
	const { toggle: toggleHistoryChart } = useHistoryChart()

	return (
		<DeviceState>
			<DisconnectedWarning />
			<ul>
				{Object.entries(devices)
					.filter(([deviceId]) => {
						const ts = lastUpdateTs(deviceId)
						if (ts === null) return false
						if (ts < Date.now() - 60 * 60 * 1000) return false
						return true
					})
					.sort(
						([id1], [id2]) =>
							(lastUpdateTs(id2) ?? 0) - (lastUpdateTs(id1) ?? 0),
					)
					.map(([deviceId, device]) => {
						const { location, state } = device
						const rankedLocations = Object.values(location ?? []).sort(
							sortLocations,
						)
						const deviceLocation = rankedLocations[0]

						const buttonPress = state?.btn
						const { brdV, appV } = state?.dev?.v ?? {}

						const shortenedDeviceId = deviceId.replace(
							/^[\d]+\d{4}$/,
							(match) => `…${match.slice(-4)}`,
						)

						const lastUpdateTime = lastUpdateTs(deviceId) as number

						const BoardIcon = brdV === 'nrf9160dk_nrf9160' ? DKIcon : ThingyIcon

						return (
							<li>
								<TitleButton
									type={'button'}
									onClick={() => {
										if (deviceLocation !== undefined) {
											map?.center(deviceLocation)
										}
									}}
								>
									<span>
										<BoardName>
											<BoardIcon />
											{appV?.includes('wifi') === true && (
												<ShieldIcon>
													<Wifi
														style={{
															color:
																locationSourceColors[GeoLocationSource.WIFI],
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
									</span>
									{lastUpdateTime !== undefined && (
										<LastUpdate title="Last update">
											<UploadCloud strokeWidth={1} />
											<RelativeTime time={new Date(lastUpdateTime)} />
										</LastUpdate>
									)}
								</TitleButton>
								<dl>
									<SignalQuality device={device} />
									{buttonPress !== undefined && (
										<ButtonPress
											key={`${deviceId}-press-${buttonPress.ts}`}
											buttonPress={buttonPress}
										/>
									)}
									<EnvironmentInfo device={device} />
									{state !== undefined && (
										<PowerInfo
											state={state}
											onClick={() => {
												toggleHistoryChart(deviceId)
											}}
										/>
									)}
									<LocationInfo device={device} />
								</dl>
							</li>
						)
					})}
			</ul>
		</DeviceState>
	)
}
