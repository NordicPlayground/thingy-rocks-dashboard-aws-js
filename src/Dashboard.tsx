import styled from 'styled-components'
import { DeviceHistory } from './chart/DeviceHistory'
import { DeviceList } from './DeviceList'
import { DeviceLocations } from './map/DeviceLocations'
import { ZoomToWorldButton } from './map/ZoomToWorldButton'
import { MeshTopologyLayer } from './mesh/MeshTopologyLayer'
import { Settings, SettingsButton } from './Settings'

const SideMenu = styled.nav`
	position: absolute;
	right: 1rem;
	bottom: 1rem;
	color: #fff;
	button {
		color: inherit;
	}
	.lucide {
		width: 22px;
		height: 22px;
	}
`

export const Dashboard = () => {
	return (
		<>
			<DeviceList />
			<DeviceLocations />
			<MeshTopologyLayer />
			<DeviceHistory />
			<Settings />
			<SideMenu>
				<ZoomToWorldButton />
				<SettingsButton />
			</SideMenu>
		</>
	)
}
