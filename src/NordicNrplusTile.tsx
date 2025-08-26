import { UploadCloud } from 'lucide-preact'
import { styled } from 'styled-components'
import type { GeoLocation, NordicNrplusDevice } from './context/Devices.js'
import { useDevices } from './context/Devices.js'
import { DeviceName } from './DeviceName.js'
import { hideDetails } from './hooks/useDetails.js'
import { PinTile } from './PinTile.js'
import { RelativeTime } from './RelativeTime.js'
import { cancelEvent } from './cancelEvent.ts'

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

const Properties = styled.dl`
	font-size: 85%;
	margin: 0;
	opacity: 0.75;
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 0.25rem 0.5rem;
	align-items: baseline;
	dt {
		font-weight: normal;
		text-align: right;
		&:after {
			content: ':';
		}
	}
	dd {
		margin: 0;
		font-family: var(--font-family-mono);
	}
`

const NetworkInfo = styled.div`
	background: rgba(0, 168, 200, 0.1);
	border-radius: 0.25rem;
	padding: 0.5rem;
	margin: 0.5rem 0;
	font-size: 85%;
`

const NeighborsList = styled.div`
	margin-top: 0.5rem;
	font-size: 85%;
	max-height: 150px;
	overflow-y: auto;
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

export const NordicNrplusTile = ({
	device,
	onCenter,
}: {
	device: NordicNrplusDevice
	onCenter: (location: GeoLocation) => void
}) => {
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs[device.id]
	
	const nordicNrplusData = device.state?.nordicNrplus
	const connectionProfile = nordicNrplusData?.connectionProfile
	const neighbors = nordicNrplusData?.neighbors ?? {}
	const buttonPresses = nordicNrplusData?.buttonPresses ?? {}

	const handleClick = cancelEvent(() => {
		// Center on device location if available
		const deviceLocation = Object.values(device.location ?? {})[0]
		if (deviceLocation) {
			onCenter(deviceLocation)
		}
		hideDetails()
	})

	return (
		<>
			<Title onClick={handleClick}>
				<span className="icon">📡</span>
				<span className="info">
					<DeviceName device={device} />
					{connectionProfile && (
						<small>Network {connectionProfile.networkId} • {connectionProfile.operationalMode}</small>
					)}
				</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
				<PinTile device={device} />
			</Title>
			
			{connectionProfile && (
				<NetworkInfo>
					<Properties>
						<dt>Network ID</dt>
						<dd>{connectionProfile.networkId}</dd>
						<dt>Device ID</dt>
						<dd>{connectionProfile.longRdId}</dd>
						<dt>Mode</dt>
						<dd>{connectionProfile.operationalMode}</dd>
					</Properties>
				</NetworkInfo>
			)}

			{Object.keys(neighbors).length > 0 && (
				<NeighborsList>
					<strong>Neighbors ({Object.keys(neighbors).length})</strong>
					{Object.entries(neighbors)
						.sort(([,a], [,b]) => b.ts - a.ts)
						.slice(0, 5) // Show only top 5 most recent
						.map(([instanceId, neighbor]) => (
							<NeighborItem key={instanceId}>
								<span>ID: {neighbor.neighborId}</span>
								{neighbor.rssi && (
									<span>{neighbor.rssi} dBm</span>
								)}
							</NeighborItem>
						))}
				</NeighborsList>
			)}

			{Object.keys(buttonPresses).length > 0 && (
				<Properties>
					<dt>Button presses</dt>
					<dd>{Object.keys(buttonPresses).length}</dd>
				</Properties>
			)}
		</>
	)
}