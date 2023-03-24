import styled from 'styled-components'
import { AppUpdateNotifier } from './AppUpdateNotifier'
import { DeviceList } from './DeviceList'
import { GitHubButton } from './GitHubButton'
import { Settings, SettingsButton } from './Settings'
import { DeviceHistory } from './chart/DeviceHistory'
import { DeviceLocations } from './map/DeviceLocations'
import { ZoomToWorldButton } from './map/ZoomToWorldButton'
import { MeshTopologyLayer } from './mesh/MeshTopologyLayer'

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
				<GitHubButton />
				<ZoomToWorldButton />
				<SettingsButton />
			</SideMenu>
			<AppUpdateNotifier />
		</>
	)
}
