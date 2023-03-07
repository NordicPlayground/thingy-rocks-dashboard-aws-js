import { identifyIssuer } from 'e118-iin-list'
import { Sun, UploadCloud, Wifi } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress'
import { locationSourceColors } from './colors'
import {
	Device,
	GeoLocationSource,
	hasSoftSIM,
	useDevices,
} from './context/Devices'
import { useMap } from './context/Map'
import { useSettings } from './context/Settings'
import { useHistoryChart } from './context/showHistoryChart'
import { useMeshTopology } from './context/showMeshTopology'
import { CountryFlag } from './CountryFlag'
import {
	IssuerName,
	LastUpdate,
	Properties,
	ShieldIcon,
	SolarColor,
	Title,
} from './DeviceList'
import { DeviceName } from './DeviceName'
import { EnvironmentInfo } from './EnvironmentInfo'
import { DKIcon } from './icons/DKIcon'
import { SIMIcon } from './icons/SIMIcon'
import { SoftSIMIcon } from './icons/SoftSIMIcon'
import { ThingyIcon } from './icons/ThingyIcon'
import { LocationInfo } from './LocationInfo'
import { PowerInfo } from './PowerInfo'
import { RelativeTime } from './RelativeTime'
import { SignalQuality } from './SignalQuality'
import { sortLocations } from './sortLocations'
import { UpdateWarning } from './UpdateWarning'

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
	const { hide: hideMeshTopology } = useMeshTopology()
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
					hideMeshTopology()
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
						hideMeshTopology()
					}}
				/>
				{state !== undefined && (
					<PowerInfo
						state={state}
						onClick={() => {
							toggleHistoryChart(device.id)
							hideMeshTopology()
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
