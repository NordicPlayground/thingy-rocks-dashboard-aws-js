import { identifyIssuer } from 'e118-iin-list'
import { Sun, UploadCloud, Wifi } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress'
import { locationSourceColors } from './colors'
import { GeoLocationSource, useDevices } from './context/Devices'
import { useMap } from './context/Map'
import { useSettings } from './context/Settings'
import { useHistoryChart } from './context/showHistoryChart'
import { DisconnectedWarning } from './DisconnectedWarning'
import { EnvironmentInfo } from './EnvironmentInfo'
import { DKIcon } from './icons/DKIcon'
import { SIMIcon } from './icons/SIMIcon'
import { ThingyIcon } from './icons/ThingyIcon'
import { LocationInfo } from './LocationInfo'
import { PowerInfo } from './PowerInfo'
import { RelativeTime } from './RelativeTime'
import { SignalQuality } from './SignalQuality'
import { sortLocations } from './sortLocations'

const DeviceState = styled.section`
	color: var(--color-nordic-light-grey);
	position: absolute;
	right: 0;
	top: 0;
	user-select: none;
	overflow: hidden;
	max-height: 100vh;
	overflow-y: scroll;
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		li {
			margin: 2px 2px 2px 0;
			padding: 0.5rem;
			text-align: left;
			border: 0;
			background-color: var(--color-panel-bg);
			color: inherit;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			button {
				border: 0;
				background: transparent;
				color: inherit;
				padding: 0;
			}
		}
	}
`

const Properties = styled.dl`
	margin: 0;
	display: grid;
	grid-template-columns: auto auto;
	grid-template-rows: 1fr;
	grid-auto-rows: auto;
	grid-column-gap: 0px;
	grid-row-gap: 0px;
	font-size: 85%;
	dd {
		margin-bottom: 0;
		white-space: nowrap;
	}
	dt {
		display: flex;
		align-items: center;
		margin-right: 0.5rem;
		.lucide {
			margin-right: 4px;
			margin-left: 4px;
		}
	}
`

const StyledSIMIcon = styled(SIMIcon)`
	width: 20px;
	height: 18px;
	margin: 0 0 0 4px;
`

const SolarColor = styled.span`
	color: var(--color-nordic-sun);
`

const ShieldIcon = styled.span`
	margin-right: 0.25rem;
`

const LastUpdate = styled.abbr`
	margin-left: 0.5rem;
	opacity: 0.8;
	font-size: 85%;
	svg {
		margin-right: 0.5rem;
	}
`

const Title = styled.button`
	display: flex;
	width: 100%;
	align-items: center;
	.icon {
		width: 32px;
		height: 32px;
		margin-right: 0.5rem;
	}
	.info {
		flex-grow: 1;
		text-align: left;
	}
`

const IssuerName = styled.dd`
	max-width: 20vw;
	overflow: hidden;
	text-overflow: ellipsis;
`

export const DeviceList = () => {
	const { devices, lastUpdateTs, alias } = useDevices()
	const map = useMap()
	const { toggle: toggleHistoryChart } = useHistoryChart()
	const {
		settings: { showFavorites, favorites },
	} = useSettings()

	return (
		<DeviceState>
			<DisconnectedWarning />
			<ul>
				{Object.entries(devices)
					.filter(([deviceId]) => {
						if (!showFavorites) return true
						return favorites.includes(deviceId)
					})
					.filter(([deviceId]) => {
						const ts = lastUpdateTs(deviceId)
						if (ts === null) return false
						if (ts < Date.now() - 60 * 60 * 1000) return false
						return true
					})
					.sort(([id1], [id2]) => {
						if (!showFavorites)
							return (lastUpdateTs(id2) ?? 0) - (lastUpdateTs(id1) ?? 0)
						return favorites.indexOf(id1) - favorites.indexOf(id2)
					})
					.map(([deviceId, device]) => {
						const { location, state } = device
						const rankedLocations = Object.values(location ?? []).sort(
							sortLocations,
						)
						const deviceLocation = rankedLocations[0]

						const buttonPress = state?.btn
						const { brdV, appV, iccid } = state?.dev?.v ?? {}

						const shortenedDeviceId =
							alias(deviceId) ??
							deviceId.replace(/^[\d]+\d{4}$/, (match) => `…${match.slice(-4)}`)

						const lastUpdateTime = lastUpdateTs(deviceId) as number

						const BoardIcon = brdV === 'nrf9160dk_nrf9160' ? DKIcon : ThingyIcon

						return (
							<li>
								<Title
									type={'button'}
									onClick={() => {
										if (deviceLocation !== undefined) {
											map?.center(deviceLocation)
										}
									}}
								>
									<BoardIcon class="icon" />
									<span class="info">
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
								</Title>
								<Properties>
									<SignalQuality device={device} />
									{iccid !== undefined && (
										<>
											<dt>
												<StyledSIMIcon />
											</dt>
											<IssuerName>
												{identifyIssuer(iccid)?.companyName ?? '?'}
											</IssuerName>
										</>
									)}
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
								</Properties>
							</li>
						)
					})}
			</ul>
		</DeviceState>
	)
}
