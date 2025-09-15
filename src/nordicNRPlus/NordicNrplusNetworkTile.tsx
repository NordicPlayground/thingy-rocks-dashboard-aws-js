import { Cpu, Leaf, Network, Signal, UploadCloud } from 'lucide-preact'
import { useMemo } from 'preact/hooks'
import { styled } from 'styled-components'
import { ButtonPress } from '../ButtonPress.tsx'
import type { GeoLocation, NordicNrplusDevice } from '../context/Devices.tsx'
import { useDevices } from '../context/Devices.tsx'
import { LastUpdate, Properties, Title } from '../DeviceList.tsx'
import { DeviceName } from '../DeviceName.tsx'
import { hideDetails } from '../hooks/useDetails.ts'
import { LocationInfo } from '../LocationInfo.tsx'
import { withCancel } from '../nrplus/cancelEvent.ts'
import { NRPlus } from '../nrplus/NRPlusIcon.tsx'
import { PinTile } from '../PinTile.tsx'
import { RelativeTime } from '../RelativeTime.tsx'

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

const LocationWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 0.25rem;
`

const TopologyContainer = styled.div`
	width: 100%;
	height: 200px;
	margin: 1rem 0;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	background: rgba(255, 255, 255, 0.02);
`

const SimpleTopologyVisualization = ({
	sinkDevice,
	leafDevices,
	width = 300,
	height = 180,
}: {
	sinkDevice: NordicNrplusDevice | undefined
	leafDevices: NordicNrplusDevice[]
	width?: number
	height?: number
}) => {
	if (!sinkDevice) return null

	const sinkX = width / 2
	const sinkY = height / 2
	const nodeSize = 16

	// Position leaf devices in a circle around the sink
	const radius = Math.min(width, height) * 0.3
	const angleStep =
		leafDevices.length > 0 ? (2 * Math.PI) / leafDevices.length : 0

	return (
		<svg
			width={width}
			height={height}
			style={{ width: '100%', height: '100%' }}
		>
			{/* Draw connections from sink to each leaf */}
			{leafDevices.map((device, index) => {
				const angle = index * angleStep
				const leafX = sinkX + radius * Math.cos(angle)
				const leafY = sinkY + radius * Math.sin(angle)

				return (
					<g key={device.id}>
						{/* Connection line */}
						<line
							x1={sinkX}
							y1={sinkY}
							x2={leafX}
							y2={leafY}
							stroke="#00a8c8"
							strokeWidth={1}
							strokeDasharray="2 2"
							opacity={0.7}
						/>
						{/* Leaf node */}
						<circle
							cx={leafX}
							cy={leafY}
							r={nodeSize / 2}
							fill="#4ade80"
							stroke="#22c55e"
							strokeWidth={1}
						/>
						<text
							x={leafX}
							y={leafY + 3}
							textAnchor="middle"
							fontSize="9"
							fill="white"
						>
							{device.id.slice(-2)}
						</text>
					</g>
				)
			})}

			{/* Sink node (drawn on top) */}
			<circle
				cx={sinkX}
				cy={sinkY}
				r={nodeSize / 2 + 2}
				fill="#0891b2"
				stroke="#00a8c8"
				strokeWidth={2}
			/>
			<text
				x={sinkX}
				y={sinkY + 3}
				textAnchor="middle"
				fontSize="10"
				fill="white"
				fontWeight="bold"
			>
				{sinkDevice.id.slice(-2)}
			</text>
		</svg>
	)
}

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
	const { lastUpdateTs } = useDevices()

	// Get the most recently updated device for the network title
	const mostRecentDevice = devices.reduce(
		(latest, device) => {
			if (!latest) return device
			const deviceTime = lastUpdateTs[device.id]?.getTime() ?? 0
			const latestTime = lastUpdateTs[latest.id]?.getTime() ?? 0
			return deviceTime > latestTime ? device : latest
		},
		devices[0] as NordicNrplusDevice | undefined,
	)

	const lastUpdateTime = mostRecentDevice
		? lastUpdateTs[mostRecentDevice.id]
		: undefined

	// Collect all neighbors from all devices in the network
	const allNeighbors = devices
		.flatMap((device) => {
			const neighbors = device.state?.nordicNrplus?.neighbors ?? {}
			return Object.entries(neighbors).map(([instanceId, neighbor]) => ({
				...neighbor,
				deviceId: device.id,
				instanceId,
			}))
		})
		.sort((a, b) => b.ts - a.ts)

	const allUniqueDevices = new Map<string, (typeof allNeighbors)[number]>()
	allNeighbors.forEach((neighbor) => {
		const key = `${neighbor.deviceId}-${neighbor.instanceId}`
		if (!allUniqueDevices.has(key)) {
			allUniqueDevices.set(key, neighbor)
		}
	})

	const sinkDevice = devices.find(
		(device) =>
			device.state?.nordicNrplus?.connectionProfile?.operationalMode === 'FT',
	)
	const leafDevices = devices.filter((device) => device !== sinkDevice)

	const handleClick = withCancel(() => {
		// Center on the most recent device location if available
		const deviceLocation = Object.values(mostRecentDevice?.location ?? {})[0]
		if (deviceLocation) {
			onCenter(deviceLocation)
		}
		hideDetails()
	})

	const networkSinkRSSI = useMemo(
		() =>
			new Map(
				leafDevices.map((device) => {
					const nordicData = device.state?.nordicNrplus
					return [
						device.id,
						nordicData?.neighbors[0]?.neighborId ===
						sinkDevice?.state?.nordicNrplus.connectionProfile?.longRdId
							? nordicData?.neighbors[0]?.rssi
							: null,
					]
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
				<span>Sink {sinkDevice?.id.slice(-4)}</span>
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
				{allUniqueDevices.size} device{allUniqueDevices.size !== 1 ? 's' : ''}
				<dt>
					<Network size={16} />
				</dt>
				{`NR+ Network ${networkId}`}
				{sinkDevice && <LocationInfo device={sinkDevice} />}
			</Properties>
			<TopologyContainer>
				<SimpleTopologyVisualization
					sinkDevice={sinkDevice}
					leafDevices={leafDevices}
				/>
			</TopologyContainer>
			<DevicesList>
				{leafDevices.map((device) => {
					const sinkRssi = networkSinkRSSI.get(device.id)
					const buttonPressList = deviceButtonPresses.get(device.id)
					const connectionProfile = connectionProfiles.get(device.id)
					return (
						<DeviceItem key={device.id}>
							<DeviceInfo>
								<DeviceNameWrapper>
									<Leaf size={16} />
									<DeviceName device={device} />
								</DeviceNameWrapper>
								{connectionProfile && (
									<Properties>
										{/* Show signal strength to sink */}
										{sinkRssi != null && (
											<>
												<dt>
													<Signal size={16} />
													<dd>{sinkRssi} dBm</dd>
												</dt>
											</>
										)}
										<dd>
											{buttonPressList &&
												Object.entries(buttonPressList).map(([, press]) => (
													<ButtonPress
														key={`${device.id}-press-${press.ts}`}
														buttonPress={press}
													/>
												))}
										</dd>
										<LocationWrapper>
											<LocationInfo device={device} />
										</LocationWrapper>
									</Properties>
								)}
							</DeviceInfo>
							<PinTile device={device} />
						</DeviceItem>
					)
				})}
			</DevicesList>
		</>
	)
}
