import { identifyIssuer } from 'e118-iin-list'
import { UploadCloud, Wifi } from 'lucide-preact'
import type { JSX } from 'preact/jsx-runtime'
import { styled } from 'styled-components'
import { ButtonPress } from './ButtonPress.js'
import { ConnectionQuality } from './ConnectionQuality.tsx'
import { CountryFlag } from './CountryFlag.js'
import {
	IssuerName,
	LastUpdate,
	Properties,
	ShieldIcon,
	Title,
} from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import { EnvironmentInfo } from './EnvironmentInfo.js'
import { FuelGauge } from './FuelGauge.js'
import { LocationInfo } from './LocationInfo.js'
import { PinTile } from './PinTile.js'
import { RelativeTime } from './RelativeTime.js'
import { SignalQuality } from './SignalQuality.js'
import { UpdateWarning } from './UpdateWarning.js'
import { wifiColor } from './colors.js'
import {
	hasNUSIM,
	hasSoftSIM,
	useDevices,
	type Device,
	type GeoLocation,
} from './context/Devices.js'
import { useSettings } from './context/Settings.js'
import { showDetails } from './hooks/useDetails.js'
import { DKIcon } from './icons/DKIcon.js'
import { KeysightIcon } from './icons/Keysight.tsx'
import { MyriotaIcon } from './icons/Myriota.tsx'
import { NuSIMIcon } from './icons/NuSIMIcon.tsx'
import { SIMIcon } from './icons/SIMIcon.js'
import { SkyloIcon } from './icons/Skylo.tsx'
import { SoftSIMIcon } from './icons/SoftSIMIcon.js'
import { ThingyIcon } from './icons/ThingyIcon.js'
import { ThingyXIcon } from './icons/ThingyXIcon.js'
import { Reboots } from './memfault/Reboots.js'
import { removeOldLocation } from './removeOldLocation.js'
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

const StyledNuSIMIcon = styled(NuSIMIcon)`
	width: 20px;
	height: 16px;
	margin: 0 0 0 4px;
	color: var(--color-nordic-blue);
`

const BoardIcon = ({ device }: { device: Device }) => {
	const brdV = device.state?.dev?.v?.brdV
	if (brdV?.includes('keysight') ?? false) return <KeysightIcon class="icon" />
	if (brdV?.includes('skylo') ?? false)
		return <SkyloIcon class="icon" style={{ padding: '2px 0' }} />
	if (brdV?.includes('myriota') ?? false) return <MyriotaIcon class="icon" />
	if (brdV?.includes('nrf9160dk') ?? false) return <DKIcon class="icon" />
	if (brdV?.includes('thingy91x') ?? false) return <ThingyXIcon class="icon" />
	return <ThingyIcon class="icon" />
}

export const Tracker = ({
	device,
	onCenter,
}: {
	device: Device
	onCenter: (location: GeoLocation) => void
}) => {
	const { lastUpdateTs } = useDevices()
	const {
		settings: { showUpdateWarning },
	} = useSettings()

	const { location, state } = device
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const deviceLocation = rankedLocations[0]

	const buttonPress = state?.btn
	const { appV, iccid } = state?.dev?.v ?? {}

	const maybeLastUpdateTime = lastUpdateTs[device.id]

	return (
		<>
			<Title
				onClick={() => {
					if (deviceLocation !== undefined) {
						onCenter(deviceLocation)
					}
					showDetails(device.id)
				}}
			>
				<BoardIcon device={device} />
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
					<DeviceName device={device} />
				</span>
				<CountryFlag device={device} />
				{maybeLastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={maybeLastUpdateTime} />
					</LastUpdate>
				)}
				<PinTile device={device} />
			</Title>
			<Properties>
				<SignalQuality device={device} />
				<ConnectionQuality
					device={device}
					onClick={() => {
						showDetails(device.id)
					}}
				/>
				{iccid !== undefined && (
					<>
						<dt>
							<SIMTechnology device={device} />
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
						showDetails(device.id)
					}}
				/>
				{state?.fg !== undefined && (
					<FuelGauge
						fg={state.fg}
						onClick={() => {
							showDetails(device.id)
						}}
					/>
				)}
				<LocationInfo device={device} />
				{showUpdateWarning && device.state !== undefined && (
					<UpdateWarning reported={device.state} />
				)}
				<Reboots device={device} />
			</Properties>
		</>
	)
}

const SIMTechnology = ({ device }: { device: Device }): JSX.Element => {
	if (hasSoftSIM(device))
		return (
			<abbr title="SoftSIM">
				<StyledSoftSIMIcon />
			</abbr>
		)
	if (hasNUSIM(device))
		return (
			<abbr title="nuSIM">
				<StyledNuSIMIcon />
			</abbr>
		)
	return <StyledSIMIcon />
}
