import { UploadCloud } from 'lucide-preact'
import { styled } from 'styled-components'
import type { GeoLocation, NordicNrplusDevice } from './context/Devices.js'
import { useDevices } from './context/Devices.js'
import { DeviceName } from './DeviceName.js'
import { hideDetails } from './hooks/useDetails.js'
import { withCancel } from './nrplus/cancelEvent.js'
import { PinTile } from './PinTile.js'
import { RelativeTime } from './RelativeTime.js'

const Title = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	button.btn-link,
	& > button {
		border: 0;
		background-color: transparent;
		color: inherit;
		padding: 0.25rem;
		margin: 0;
		cursor: pointer;
	}
	& > span.info {
		font-size: 85%;
		display: flex;
		flex-direction: column;
		text-align: left;
		min-width: 0;
		flex: 1;
	}
	.icon {
		width: 24px;
		height: 24px;
		margin-right: 0.5rem;
		color: #00a8c8;
	}
`

const LastUpdate = styled.span`
	font-size: 85%;
	opacity: 0.75;
	white-space: nowrap;
	display: flex;
	align-items: center;
	gap: 0.25rem;
`

const DevicesList = styled.div`
	margin-top: 0.5rem;
	font-size: 85%;
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
`

const DeviceInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
`

const DeviceMeta = styled.div`
	font-size: 0.8em;
	opacity: 0.7;
	display: flex;
	gap: 1rem;
`

const NeighborsList = styled.div`
	margin-top: 0.5rem;
	font-size: 85%;
	max-height: 100px;
	overflow-y: auto;
	width: 100%;
`

const NeighborItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.25rem 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	&:last-child {
		border-bottom: none;
	}
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
	console.log('<NordicNrplusNetworkTile>', lastUpdateTs)

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
	console.log(
		lastUpdateTime
			? `[Tile] Rendering NordicNrplusNetworkTile for network ${networkId}, last update at ${lastUpdateTime.toISOString()}`
			: `[Tile] Rendering NordicNrplusNetworkTile for network ${networkId}, no last update time`,
		devices,
	)

	console.log(
		`[Tile] Network ${networkId} has ${devices.length} devices`,
		devices,
	)

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
	console.log(
		`[Tile] Network ${networkId} has ${allNeighbors.length} total neighbors`,
		allNeighbors,
	)

	const handleClick = withCancel(() => {
		// Center on the most recent device location if available
		const deviceLocation = Object.values(mostRecentDevice?.location ?? {})[0]
		if (deviceLocation) {
			onCenter(deviceLocation)
		}
		hideDetails()
	})

	return (
		<>
			<Title onClick={handleClick}>
				<span className="icon">🌐</span>
				<span className="info">
					<span>NR+ Network {networkId}</span>
					<small>
						{devices.length} device{devices.length !== 1 ? 's' : ''}
					</small>
				</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
			</Title>

			<DevicesList>
				{devices.map((device) => {
					const nordicData = device.state?.nordicNrplus
					const deviceNeighbors = Object.keys(
						nordicData?.neighbors ?? {},
					).length
					const buttonPresses = Object.keys(
						nordicData?.buttonPresses ?? {},
					).length

					return (
						<DeviceItem key={device.id}>
							<DeviceInfo>
								<DeviceName device={device} />
								{nordicData?.connectionProfile && (
									<DeviceMeta>
										<span>
											Mode:{' '}
											{nordicData.connectionProfile.operationalMode === 'FT'
												? 'sink'
												: 'leaf'}
										</span>
										{deviceNeighbors > 0 && (
											<span>{deviceNeighbors} neighbors</span>
										)}
										{buttonPresses > 0 && (
											<span>{buttonPresses} button presses</span>
										)}
									</DeviceMeta>
								)}
							</DeviceInfo>
							<PinTile device={device} />
						</DeviceItem>
					)
				})}
			</DevicesList>

			{allNeighbors.length > 0 && (
				<NeighborsList>
					<strong>Network Neighbors ({allNeighbors.length})</strong>
					{allNeighbors.slice(0, 5).map((neighbor) => (
						<NeighborItem key={`${neighbor.deviceId}-${neighbor.instanceId}`}>
							<span>ID: {neighbor.neighborId}</span>
							{neighbor.rssi != null && <span>{neighbor.rssi} dBm</span>}
						</NeighborItem>
					))}
					{allNeighbors.length > 5 && (
						<div
							style={{ textAlign: 'center', opacity: 0.7, marginTop: '0.5rem' }}
						>
							+{allNeighbors.length - 5} more neighbors
						</div>
					)}
				</NeighborsList>
			)}
		</>
	)
}
