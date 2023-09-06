import { identifyIssuer } from 'e118-iin-list'
import { Sun, UploadCloud, Wifi } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress.js'
import { CountryFlag } from './CountryFlag.js'
import {
	IssuerName,
	LastUpdate,
	Properties,
	ShieldIcon,
	SolarColor,
	Title,
} from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import { EnvironmentInfo } from './EnvironmentInfo.js'
import { LocationInfo } from './LocationInfo.js'
import { PowerInfo } from './PowerInfo.js'
import { RelativeTime } from './RelativeTime.js'
import { SignalQuality } from './SignalQuality.js'
import { UpdateWarning } from './UpdateWarning.js'
import { wifiColor } from './colors.js'
import { hasSoftSIM, useDevices, type Device } from './context/Devices.js'
import { useMap } from './context/Map.js'
import { useSettings } from './context/Settings.js'
import { useHistoryChart } from './context/showHistoryChart.js'
import { DKIcon } from './icons/DKIcon.js'
import { SIMIcon } from './icons/SIMIcon.js'
import { SoftSIMIcon } from './icons/SoftSIMIcon.js'
import { ThingyIcon } from './icons/ThingyIcon.js'
import { sortLocations } from './sortLocations.js'

const StyledSIMIcon = styled(SIMIcon)`
	width: 20px;
	height: 18px;
	margin: 0 0 0 4px;
`
const StyledSoftSIMIcon = styled(SoftSIMIcon)`
	width: 20px;
	height: 18px;
	margin: 0 0 0 4px;
`

export const Tracker = ({ device }: { device: Device }) => {
	const { lastUpdateTs } = useDevices()
	const map = useMap()
	const { toggle: toggleHistoryChart } = useHistoryChart()
	const {
		settings: { showUpdateWarning },
	} = useSettings()

	const { location, state } = device
	const rankedLocations = Object.values(location ?? []).sort(sortLocations)
	const deviceLocation = rankedLocations[0]

	const buttonPress = state?.btn
	const { brdV, appV, iccid } = state?.dev?.v ?? {}

	const lastUpdateTime = lastUpdateTs(device.id) as number

	const BoardIcon = brdV === 'nrf9160dk_nrf9160' ? DKIcon : ThingyIcon

	return (
		<>
			<Title
				type={'button'}
				onClick={() => {
					if (deviceLocation !== undefined) {
						map?.center(deviceLocation)
					}
					toggleHistoryChart(device.id)
				}}
			>
				<BoardIcon class="icon" />
				<span class="info">
					{appV?.includes('wifi') === true && (
						<ShieldIcon>
							<Wifi
								style={{
									color: wifiColor,
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
					<DeviceName device={device} />
				</span>
				<CountryFlag device={device} />
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
							{hasSoftSIM(device) ? (
								<abbr title="SoftSIM">
									<StyledSoftSIMIcon />
								</abbr>
							) : (
								<StyledSIMIcon />
							)}
						</dt>
						<IssuerName>{identifyIssuer(iccid)?.companyName ?? '?'}</IssuerName>
					</>
				)}
				{buttonPress !== undefined && (
					<ButtonPress
						key={`${device.id}-press-${buttonPress.ts}`}
						buttonPress={buttonPress}
					/>
				)}
				<EnvironmentInfo
					device={device}
					onClick={() => {
						toggleHistoryChart(device.id)
					}}
				/>
				{state !== undefined && (
					<PowerInfo
						state={state}
						onClick={() => {
							toggleHistoryChart(device.id)
						}}
					/>
				)}
				<LocationInfo device={device} />
				{showUpdateWarning && device.state !== undefined && (
					<UpdateWarning reported={device.state} />
				)}
			</Properties>
		</>
	)
}
