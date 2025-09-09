import { styled } from 'styled-components'
import {
	isNordicNrplus,
	isNRPlusGateway,
	isTracker,
	isWirepasGateway,
	type GeoLocation,
	type NordicNrplusDevice,
} from './context/Devices.js'
import { useMap } from './context/Map.js'
import { useVisibleDevices } from './context/VisibleDevices.js'
import { DisconnectedWarning } from './DisconnectedWarning.js'
import { HistoryOnly } from './HistoryOnly.js'
import { showDetails } from './hooks/useDetails.js'
import { NordicNrplusNetworkTile } from './NordicNrplusNetworkTile.js'
import { NRPlusGatewayTile } from './nrplus/NRPlusGatewayTile.js'
import { Tracker } from './Tracker.js'
import { WirepasGatewayTile } from './wirepas/WirepasGatewayTile.js'

const DeviceState = styled.section`
	color: var(--color-nordic-light-grey);
	position: absolute;
	right: 0;
	top: 0;
	user-select: none;
	overflow: hidden;
	max-height: calc(100vh - var(--menu-height));
	overflow-y: auto;
	scrollbar-color: #ffffff66 var(--color-panel-bg);
	scrollbar-width: thin;
	width: 375px;
	> ul {
		list-style: none;
		margin: 0;
		padding: 0;
		> li {
			margin: 2px 2px 2px 0;
			padding: 0.5rem;
			text-align: left;
			border: 0;
			background-color: var(--color-panel-bg);
			color: inherit;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			position: relative;
			button {
				border: 0;
				background: transparent;
				color: inherit;
				padding: 0;
			}
		}
	}
`

export const Properties = styled.dl`
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
	.icon {
		width: 25px;
		height: 25px;
	}
`

export const ShieldIcon = styled.span`
	margin-right: 0.25rem;
`

export const LastUpdate = styled.abbr`
	margin-left: 0.5rem;
	opacity: 0.8;
	font-size: 85%;
	white-space: nowrap;
	svg {
		margin-right: 0.5rem;
	}
`

export const Title = styled.div`
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

export const IssuerName = styled.dd`
	max-width: 20vw;
	overflow: hidden;
	text-overflow: ellipsis;
`

export const DeviceList = () => {
	const devicesToShow = useVisibleDevices()
	const map = useMap()

	const center = (location: GeoLocation) => {
		map?.center(location)
	}

	// Group nordic-nrplus devices by network ID
	const nordicNrplusDevices = devicesToShow.filter(isNordicNrplus)
	const nordicNrplusNetworks = new Map<number, NordicNrplusDevice[]>()

	//We only want to show nordic-nrplus devices that are part of a network
	nordicNrplusDevices.forEach((device) => {
		const networkId = device.state?.nordicNrplus?.connectionProfile?.networkId
		if (networkId !== undefined) {
			if (!nordicNrplusNetworks.has(networkId)) {
				nordicNrplusNetworks.set(networkId, [])
			}
			nordicNrplusNetworks.get(networkId)!.push(device)
		}
	})

	// Filter out nordic-nrplus devices from the main list since we handle them separately
	const otherDevices = devicesToShow.filter((device) => !isNordicNrplus(device))

	return (
		<DeviceState>
			<DisconnectedWarning />
			<ul>
				{otherDevices.map((device) => {
					if (isTracker(device))
						return (
							<li key={`device:${device.id}`}>
								<Tracker device={device} onCenter={center} />
							</li>
						)
					if (isNRPlusGateway(device)) {
						return (
							<li key={device.id}>
								<NRPlusGatewayTile gateway={device} onCenter={center} />
							</li>
						)
					}
					if (isWirepasGateway(device)) {
						return (
							<li key={device.id}>
								<WirepasGatewayTile gateway={device} onCenter={center} />
							</li>
						)
					}
					if (device.history !== undefined)
						return (
							<li key={device.id}>
								<HistoryOnly
									device={device}
									onClick={() => {
										showDetails(device.id)
									}}
								/>
							</li>
						)
					return null
				})}

				{/* Render grouped nordic-nrplus networks */}
				{Array.from(nordicNrplusNetworks.entries()).map(
					([networkId, devices]) => (
						<li key={`network:${networkId}`}>
							<NordicNrplusNetworkTile
								devices={devices}
								networkId={networkId}
								onCenter={center}
							/>
						</li>
					),
				)}
			</ul>
		</DeviceState>
	)
}
