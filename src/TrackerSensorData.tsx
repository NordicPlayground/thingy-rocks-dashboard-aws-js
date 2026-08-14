import { identifyIssuer } from 'e118-iin-list'
import type { JSX } from 'preact/jsx-runtime'
import { styled } from 'styled-components'
import { ButtonPress } from './ButtonPress.js'
import { ConnectionQuality } from './ConnectionQuality.js'
import { IssuerName } from './DeviceList.js'
import type { Device } from './DeviceType.ts'
import { hasNUSIM, hasSoftSIM } from './DeviceType.ts'
import { EnvironmentInfo } from './EnvironmentInfo.js'
import { FuelGauge } from './FuelGauge.js'
import { showDetails } from './hooks/useDetails.js'
import { NuSIMIcon } from './icons/NuSIMIcon.js'
import { SIMIcon } from './icons/SIMIcon.js'
import { SoftSIMIcon } from './icons/SoftSIMIcon.js'
import { LocationInfo } from './LocationInfo.js'
import { Reboots } from './memfault/Reboots.js'
import { NTNObservation } from './NTNObservation.tsx'
import { SignalQuality } from './SignalQuality.js'

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

export const TrackerSensorData = ({ device }: { device: Device }) => {
	const { state } = device
	const buttonPress = state?.btn
	const { iccid } = state?.dev?.v ?? {}

	return (
		<>
			<SignalQuality device={device} />
			<ConnectionQuality
				device={device}
				onClick={() => {
					showDetails(device.id)
				}}
			/>
			<NTNObservation device={device} />
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
			<Reboots device={device} />
		</>
	)
}
