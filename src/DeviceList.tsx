import styled from 'styled-components'
import {
	GeoLocationSource,
	isLightBulb,
	isMeshNode,
	isTracker,
	useDevices,
} from './context/Devices'
import { useMap } from './context/Map'
import { useSettings } from './context/Settings'
import { useHistoryChart } from './context/showHistoryChart'
import { DisconnectedWarning } from './DisconnectedWarning'
import { SIMIcon } from './icons/SIMIcon'
import { LightbulbDevice } from './LightbulbDevice'
import { MeshNode, MeshNodeDevice } from './MeshNode'
import { Tracker } from './Tracker'

const DeviceState = styled.section`
	color: var(--color-nordic-light-grey);
	position: absolute;
	right: 0;
	top: 0;
	user-select: none;
	overflow: hidden;
	max-height: 100vh;
	overflow-y: auto;
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
`

export const StyledSIMIcon = styled(SIMIcon)`
	width: 20px;
	height: 18px;
	margin: 0 0 0 4px;
`

export const SolarColor = styled.span`
	color: var(--color-nordic-sun);
`

export const ShieldIcon = styled.span`
	margin-right: 0.25rem;
`

export const LastUpdate = styled.abbr`
	margin-left: 0.5rem;
	opacity: 0.8;
	font-size: 85%;
	svg {
		margin-right: 0.5rem;
	}
`

export const Title = styled.button`
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
	const { devices, lastUpdateTs } = useDevices()
	const map = useMap()
	const { hide: hideHistoryChart } = useHistoryChart()
	const {
		settings: { showFavorites, favorites },
	} = useSettings()

	const devicesToShow = Object.entries(devices)
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

	return (
		<DeviceState>
			<DisconnectedWarning />
			<ul>
				{devicesToShow.map(([, device]) => {
					if (isTracker(device))
						return (
							<li>
								<Tracker key={`device:${device.id}`} device={device} />
							</li>
						)
					if (isLightBulb(device))
						return (
							<li>
								<LightbulbDevice
									key={`device:${device.id}`}
									device={device}
									onClick={() => {
										if (device.state?.geo !== undefined) {
											map?.center(
												{
													...device.state.geo,
													accuracy: 0,
													source: GeoLocationSource.FIXED,
												},
												16,
											)
										}
										hideHistoryChart()
									}}
								/>
							</li>
						)
					if (isMeshNode(device))
						return (
							<li>
								<MeshNode
									key={`device:${device.id}`}
									device={device as MeshNodeDevice}
									onClick={() => {
										if (device.state?.geo !== undefined) {
											map?.center(
												{
													...device.state.geo,
													accuracy: 0,
													source: GeoLocationSource.FIXED,
												},
												16,
											)
										}
										hideHistoryChart()
									}}
								/>
							</li>
						)
					return null
				})}
			</ul>
		</DeviceState>
	)
}
