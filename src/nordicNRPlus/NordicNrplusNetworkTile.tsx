import { Cpu, Leaf, Network, Radio, Signal, UploadCloud } from 'lucide-preact'
import { useEffect, useMemo } from 'preact/hooks'
import { styled } from 'styled-components'
import { ButtonPress } from '../ButtonPress.tsx'
import { useDevices } from '../context/Devices.js'
import { useMap } from '../context/Map.js'
import { LastUpdate, Properties, Title } from '../DeviceList.tsx'
import { DeviceName } from '../DeviceName.tsx'
import type {
	GeoLocation,
	NordicNrplusButtonPress,
	NordicNrplusDevice,
} from '../DeviceType.ts'
import { EnvironmentInfo } from '../EnvironmentInfo.tsx'
import { FuelGauge } from '../FuelGauge.tsx'
import { hideDetails, showDetails } from '../hooks/useDetails.ts'
import { LocationInfo } from '../LocationInfo.tsx'
import { withCancel } from '../nrplus/cancelEvent.ts'
import { NRPlus } from '../nrplus/NRPlusIcon.tsx'
import { PinTile } from '../PinTile.tsx'
import { RelativeTime } from '../RelativeTime.tsx'
import { LedIndicator } from './LedIndicator.tsx'
import { addressDetails, linkDetails } from './linkDetails.ts'

const DevicesList = styled.div`
	margin-top: 0.5rem;
	font-size: 85%;
	width: 100%;
`
const DeviceItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem;
	margin: 0.25rem 0;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 0.25rem;
	border-left: 3px solid #00a8c8;
	width: 100%;
	box-sizing: border-box;
`
const DeviceInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
	width: 100%;
`

// Keep the values next to their icons instead of spreading the columns.
// Do not use styled(Properties): DeviceList imports this file, so Properties is
// not initialized yet when this module is evaluated.
const LeafProperties = styled.div`
	> dl {
		grid-template-columns: auto 1fr;
		align-items: center;
	}
`

// The pin button is centered, the LED sits on the same vertical axis at the
// height of the device name
const RightColumn = styled.div`
	position: relative;
	display: flex;
	align-self: stretch;
	align-items: center;
	justify-content: center;
`

const LedSlot = styled.div`
	position: absolute;
	top: 0.35rem;
	left: 50%;
	transform: translateX(-50%);
`

const SignalRow = styled.div`
	display: flex;
	align-items: center;
`

// The button press as it was before: icon above the time, next to the signal
const ButtonSlot = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-left: 1.5rem;
`

const DeviceNameWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 0.25rem;
	color: #00a8c8;
`

const SinkInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-left: auto;
`

export const NordicNrplusNetworkTile = ({
	devices,
	networkId,
	onCenter,
}: {
	devices: NordicNrplusDevice[]
	networkId: number
	onCenter: (location: GeoLocation) => void
}) => {
	const { showTopologyConnection, removeTopologyConnection } = useMap()

	const sinkDevice = devices.find(
		(device) =>
			device.state?.nordicNrplus?.connectionProfile?.operationalMode === 'FT',
	)
	const leafDevices = devices.filter((device) => device !== sinkDevice)

	// Add effect to show topology connections
	useEffect(() => {
		const connections: string[] = []

		// Show connections from sink to all leaf devices
		leafDevices.forEach((leafDevice) => {
			if (sinkDevice && leafDevice.location && sinkDevice.location) {
				const sinkLocation = Object.values(sinkDevice.location)[0]
				const leafLocation = Object.values(leafDevice.location)[0]

				if (sinkLocation && leafLocation) {
					const connectionId = `nrplus-${networkId}-${sinkDevice.id}-${leafDevice.id}`
					connections.push(connectionId)

					void showTopologyConnection({
						connectionId,
						from: sinkLocation,
						to: leafLocation,
						color: '#00a8c8', // Match your accent color
						width: 2,
						dashArray: [4, 2],
						opacity: 0.7,
						minZoom: 10, // Lines only visible at zoom level 10 and above
					})
				}
			}
		})

		// Cleanup function to remove connections
		return () => {
			connections.forEach((connectionId) => {
				removeTopologyConnection(connectionId)
			})
		}
	}, [devices, networkId, showTopologyConnection, removeTopologyConnection])

	const { lastUpdateTs } = useDevices()

	// Get the most recently updated device for the network title
	const mostRecentDevice = devices.reduce((latest, device) => {
		if (!latest) return device
		const deviceTime = lastUpdateTs[device.id]?.getTime() ?? 0
		const latestTime = lastUpdateTs[latest.id]?.getTime() ?? 0
		return deviceTime > latestTime ? device : latest
	}, devices[0])

	// Band and channel are the same for the whole network
	const { band, channel } =
		devices
			.map((device) => device.state?.nordicNrplus?.connectionProfile)
			.find((profile) => profile?.band !== undefined) ?? {}

	const lastUpdateTime = mostRecentDevice
		? lastUpdateTs[mostRecentDevice.id]
		: undefined

	// Collect all neighbors from all devices in the network
	const totalDevices = devices.length

	const handleClick = withCancel(() => {
		// Center on the most recent device location if available
		const deviceLocation = Object.values(mostRecentDevice?.location ?? {})[0]
		if (deviceLocation) {
			onCenter(deviceLocation)
		}
		hideDetails()
	})

	const networkSinkSignal = useMemo(
		() =>
			new Map(
				leafDevices.map((device) => {
					const nordicData = device.state?.nordicNrplus
					const toSink =
						nordicData?.neighbors[0]?.neighborId ===
						sinkDevice?.state?.nordicNrplus.connectionProfile?.longRdId
					return [device.id, toSink ? nordicData?.neighbors[0] : undefined]
				}),
			),
		[leafDevices],
	)

	const deviceButtonPresses = useMemo(
		() =>
			new Map(
				devices.map((device) => [
					device.id,
					device.state?.nordicNrplus?.buttonPresses,
				]),
			),
		[devices],
	)

	const connectionProfiles = useMemo(
		() =>
			new Map(
				devices.map((device) => [
					device.id,
					device.state?.nordicNrplus?.connectionProfile,
				]),
			),
		[devices],
	)

	return (
		<>
			<Title onClick={handleClick}>
				<NRPlus class="icon" />
				{sinkDevice && (
					<DeviceName
						device={sinkDevice}
						details={addressDetails(
							sinkDevice.state?.nordicNrplus.connectionProfile,
						)}
					/>
				)}
				<SinkInfo>
					{lastUpdateTime !== undefined && (
						<LastUpdate title="Last update">
							<UploadCloud strokeWidth={1} />
							<RelativeTime time={new Date(lastUpdateTime)} />
						</LastUpdate>
					)}
					{sinkDevice && <PinTile device={sinkDevice} />}
				</SinkInfo>
			</Title>
			<Properties>
				<dt>
					<Cpu size={16} />
				</dt>
				{totalDevices} device{totalDevices !== 1 ? 's' : ''}
				<dt>
					<Network size={16} />
				</dt>
				{`NR+ Network ${networkId}`}
				{band !== undefined && channel !== undefined && (
					<>
						<dt>
							<Radio size={16} />
						</dt>
						{`Channel ${channel} (Band ${band})`}
					</>
				)}
				{sinkDevice && <LocationInfo device={sinkDevice} />}
			</Properties>
			<DevicesList>
				{leafDevices.map((device) => {
					const sinkSignal = networkSinkSignal.get(device.id)
					const sinkRssi = sinkSignal?.rssi
					const buttonPressList = deviceButtonPresses.get(device.id)
					const connectionProfile = connectionProfiles.get(device.id)
					const buttonPresses = buttonPressList !== undefined && (
						<ButtonSlot>
							{Object.entries(buttonPressList).map(
								([, press]: [string, NordicNrplusButtonPress]) => (
									<ButtonPress
										key={`${device.id}-press-${press.ts}`}
										buttonPress={press}
									/>
								),
							)}
						</ButtonSlot>
					)
					return (
						<DeviceItem key={device.id}>
							<DeviceInfo>
								<DeviceNameWrapper>
									<Leaf size={16} />
									<DeviceName
										device={device}
										details={addressDetails(connectionProfile)}
									/>
								</DeviceNameWrapper>
								{connectionProfile && (
									<LeafProperties>
										<Properties>
											{/* Show signal strength to sink, and the button press next to it */}
											{sinkRssi != null ? (
												<>
													<dt>
														<Signal size={16} />
													</dt>
													<dd>
														<SignalRow>
															<span
																title={
																	sinkSignal !== undefined
																		? linkDetails(sinkSignal)
																		: undefined
																}
															>
																{sinkRssi} dBm
																{sinkSignal?.snr !== undefined &&
																	` (SNR ${sinkSignal.snr} dB)`}
															</span>
															{buttonPresses}
														</SignalRow>
													</dd>
												</>
											) : (
												<>
													<dt />
													<dd>{buttonPresses}</dd>
												</>
											)}
											<EnvironmentInfo
												device={device}
												onClick={() => {
													showDetails(device.id)
												}}
											/>
											{device.state?.fg !== undefined && (
												<FuelGauge
													fg={device.state.fg}
													onClick={() => {
														showDetails(device.id)
													}}
												/>
											)}
											<LocationInfo device={device} />
										</Properties>
									</LeafProperties>
								)}
							</DeviceInfo>
							<RightColumn>
								<LedSlot>
									<LedIndicator led={device.state?.led} />
								</LedSlot>
								<PinTile device={device} />
							</RightColumn>
						</DeviceItem>
					)
				})}
			</DevicesList>
		</>
	)
}
